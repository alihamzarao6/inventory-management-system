"use client"
import React, { useState } from "react";
import { Download, Printer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StockAdjustment } from "@/types/stockAdjustment";
import { ADJUSTMENT_REASONS } from "@/constants/mockStockAdjustments";

interface ExportOptionsProps {
  adjustment: StockAdjustment;
  fileName?: string;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  adjustment,
  fileName = "stock-adjustment",
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    setIsExporting(true);

    try {
      // Generate CSV content
      const headers = [
        "Item Name",
        "Category",
        "Previous Quantity",
        "Adjustment",
        "New Quantity",
        "Reason",
      ];

      const rows = adjustment.items.map((item) => [
        item.productName,
        item.category,
        item.previousQuantity,
        item.adjustmentType === "Add"
          ? `+${item.quantity}`
          : `-${item.quantity}`,
        item.newQuantity,
        ADJUSTMENT_REASONS.find((r) => r.id === item.reasonId)?.description ||
          item.customReason ||
          "",
      ]);

      // Add metadata rows at the top
      const metadata = [
        ["Stock Adjustment Report"],
        [`Location: ${adjustment.locationName}`],
        [`Date: ${new Date(adjustment.createdAt).toLocaleDateString()}`],
        [
          `Status: ${
            adjustment.status.charAt(0).toUpperCase() +
            adjustment.status.slice(1)
          }`,
        ],
        [""], // Empty row as separator
      ];

      const csvContent = [...metadata, headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${fileName}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle export to PDF
  const handleExportPDF = () => {
    // In a real app, this would generate a PDF using a library like jsPDF
    // For this demo, we'll just use the print functionality
    handlePrint();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          <span>Print</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          <span>Export CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <Download className="mr-2 h-4 w-4" />
          <span>Export PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportOptions;
