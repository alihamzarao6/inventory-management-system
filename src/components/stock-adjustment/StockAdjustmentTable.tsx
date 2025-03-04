"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StockAdjustmentItem } from "@/types/stockAdjustment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils";
import {
  ADJUSTMENT_REASONS,
  getReasonById,
} from "@/constants/mockStockAdjustments";

interface StockAdjustmentTableProps {
  items: StockAdjustmentItem[];
  checkedItemIds: string[]; // Updated prop
  isLoading: boolean;
  onToggleItem: (productId: string) => void; // Updated prop
  onEditItem: (productId: string) => void;
  onDeleteItem: (productId: string) => void;
}

const StockAdjustmentTable: React.FC<StockAdjustmentTableProps> = ({
  items,
  checkedItemIds,
  isLoading,
  onToggleItem,
  onEditItem,
  onDeleteItem,
}) => {
  const [sortColumn, setSortColumn] = useState<string>("productName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // Toggle select all
  const toggleSelectAll = () => {
    if (checkedItemIds.length === items.length) {
      // If all are selected, unselect all
      items.forEach((item) => {
        if (checkedItemIds.includes(item.productId)) {
          onToggleItem(item.productId);
        }
      });
    } else {
      // Otherwise select all
      items.forEach((item) => {
        if (!checkedItemIds.includes(item.productId)) {
          onToggleItem(item.productId);
        }
      });
    }
  };

  // Handle sort column click
  const handleSortClick = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      );
    }
    return (
      <div className="flex flex-col">
        <ChevronUp className="w-3 h-3 -mb-1" />
        <ChevronDown className="w-3 h-3" />
      </div>
    );
  };

  // View proof image
  const handleViewProof = (proofImage: string) => {
    setSelectedProof(proofImage);
    setProofModalOpen(true);
  };

  // Sort and filter items
  const getSortedItems = () => {
    if (items.length === 0) return [];

    return [...items].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortColumn) {
        case "productName":
          valueA = a.productName.toLowerCase();
          valueB = b.productName.toLowerCase();
          break;
        case "previousQuantity":
          valueA = a.previousQuantity;
          valueB = b.previousQuantity;
          break;
        case "adjustment":
          // Sort by the adjustment value (can be positive or negative)
          valueA = a.adjustmentType === "Add" ? a.quantity : -a.quantity;
          valueB = b.adjustmentType === "Add" ? b.quantity : -b.quantity;
          break;
        case "newQuantity":
          valueA = a.newQuantity;
          valueB = b.newQuantity;
          break;
        default:
          valueA = a.productName.toLowerCase();
          valueB = b.productName.toLowerCase();
          break;
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  const sortedItems = getSortedItems();

  // Format adjustment value with + or - sign
  const formatAdjustment = (item: StockAdjustmentItem) => {
    const value =
      item.adjustmentType === "Add" ? item.quantity : -item.quantity;
    const color = value > 0 ? "text-green-500" : "text-red-500";
    return <span className={color}>{value > 0 ? `+${value}` : value}</span>;
  };

  return (
    <div className="w-full">
      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                <th className="pl-4 py-4 pr-2">
                  <Checkbox
                    checked={
                      checkedItemIds.length === items.length && items.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-4">Photo</th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("productName")}
                >
                  <div className="flex items-center gap-1">
                    <span>Item Name</span>
                    {renderSortIndicator("productName")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("previousQuantity")}
                >
                  <div className="flex items-center gap-1">
                    <span>Old Quantity</span>
                    {renderSortIndicator("previousQuantity")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("adjustment")}
                >
                  <div className="flex items-center gap-1">
                    <span>Adjustment</span>
                    {renderSortIndicator("adjustment")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("newQuantity")}
                >
                  <div className="flex items-center gap-1">
                    <span>New Quantity</span>
                    {renderSortIndicator("newQuantity")}
                  </div>
                </th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Proof</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : sortedItems.length > 0 ? (
                sortedItems.map((item, index) => {
                  const isSelected = checkedItemIds.includes(item.productId);
                  return (
                    <tr
                      key={item.productId}
                      className={cn(
                        "transition-colors border-t border-gray-100",
                        isSelected
                          ? "bg-blue-50"
                          : index % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50/30",
                        "hover:bg-gray-50"
                      )}
                    >
                      <td className="pl-4 py-4 pr-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleItem(item.productId)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <Avatar className="h-12 w-12 rounded-md">
                          <AvatarImage
                            src={item.productImage}
                            alt={item.productName}
                            className="object-cover"
                          />
                          <AvatarFallback>
                            {item.productName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">
                          {item.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {item.previousQuantity}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatAdjustment(item)}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {item.newQuantity}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {item.reasonId ? (
                          ADJUSTMENT_REASONS.find((r) => r.id === item.reasonId)
                            ?.description ||
                          item.customReason ||
                          ""
                        ) : (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {item.proof ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 p-1 h-8"
                            onClick={() => handleViewProof(item.proof!)}
                          >
                            <ImageIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        ) : (
                          <span className="text-gray-400 italic">No proof</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "p-1 h-8 text-gray-500 hover:text-gray-700",
                              !isSelected && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => onEditItem(item.productId)}
                            title="Edit"
                            disabled={!isSelected}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "p-1 h-8 text-red-500 hover:text-red-700",
                              !isSelected && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => onDeleteItem(item.productId)}
                            title="Remove from selection"
                            disabled={!isSelected}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    {checkedItemIds.length === 0
                      ? "No items selected for adjustment"
                      : "No items found matching your criteria"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Image Modal */}
      <Dialog open={proofModalOpen} onOpenChange={setProofModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Proof Image</DialogTitle>
          <div className="max-h-[70vh] overflow-y-auto">
            {selectedProof && (
              <img
                src={selectedProof}
                alt="Proof"
                className="w-full h-auto object-contain rounded-md"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockAdjustmentTable;
