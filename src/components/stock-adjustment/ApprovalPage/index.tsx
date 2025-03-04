"use client"

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils";
import { StockAdjustment, StockAdjustmentItem } from "@/types/stockAdjustment";
import { ADJUSTMENT_REASONS } from "@/constants/mockStockAdjustments";
import useToast from "@/hooks/useToast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ExportOptions from "../ExportOptions";

export const ApprovalPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  // Get adjustment ID from query params
  const adjustmentId = searchParams.get("id");

  // State
  const [adjustment, setAdjustment] = useState<StockAdjustment | null>(null);
  const [sortColumn, setSortColumn] = useState<string>("productName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load adjustment data
  useEffect(() => {
    if (!adjustmentId) {
      router.push("/stock-adjustment");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, we would fetch the adjustment from the API
      // For this mock, we'll create a fake adjustment
      const items: StockAdjustmentItem[] = [
        {
          productId: "prod-1",
          productName: "Deluxe Coffee Maker",
          productImage:
            "https://images.unsplash.com/photo-1572431447238-425af66a273b?q=80&w=1470&auto=format&fit=crop",
          category: "Kitchenware",
          adjustmentType: "Add",
          quantity: 5,
          previousQuantity: 10,
          newQuantity: 15,
          reasonId: "reason-3",
          proof:
            "https://images.unsplash.com/photo-1572431447238-425af66a273b?q=80&w=1470&auto=format&fit=crop",
        },
        {
          productId: "prod-2",
          productName: "Stainless Steel Cookware Set",
          productImage:
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1528&auto=format&fit=crop",
          category: "Kitchenware",
          adjustmentType: "Remove",
          quantity: 10,
          previousQuantity: 30,
          newQuantity: 20,
          reasonId: "reason-1",
          proof:
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1528&auto=format&fit=crop",
        },
      ];

      const mockAdjustment: StockAdjustment = {
        id: adjustmentId,
        locationId: "1",
        locationName: "Warehouse 1",
        items,
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      setAdjustment(mockAdjustment);
      setIsLoading(false);
    }, 500);
  }, [adjustmentId, router]);

  // Toggle row selection
  const toggleRowSelection = (productId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedItemIds.length === adjustment?.items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(adjustment?.items.map((item) => item.productId) || []);
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

  // Sort items
  const getSortedItems = () => {
    if (!adjustment?.items || adjustment.items.length === 0) return [];

    return [...adjustment.items].sort((a, b) => {
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

  // Format adjustment value with + or - sign
  const formatAdjustment = (item: StockAdjustmentItem) => {
    const value =
      item.adjustmentType === "Add" ? item.quantity : -item.quantity;
    const color = value > 0 ? "text-green-500" : "text-red-500";
    return <span className={color}>{value > 0 ? `+${value}` : value}</span>;
  };

  // Handle approve action
  const handleApprove = () => {
    // In a real app, this would be an API call
    showToast("Adjustment approved successfully", "success");

    // Navigate to completion page
    router.push(`/stock-adjustment/completed?id=${adjustmentId}`);
  };

  // Handle deny action
  const handleDeny = () => {
    // In a real app, this would be an API call
    showToast("Adjustment denied", "info");

    // Navigate to denied page
    router.push(`/stock-adjustment/denied?id=${adjustmentId}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const sortedItems = getSortedItems();

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p>Loading adjustment details...</p>
      </div>
    );
  }

  if (!adjustment) {
    return (
      <div className="p-8 text-center">
        <p>Adjustment not found</p>
        <Button
          className="mt-4"
          onClick={() => router.push("/stock-adjustment")}
        >
          Back to Stock Adjustments
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="mb-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/stock-adjustment")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stock Adjustments
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-yellow-500">
            Stock Adjust Pending Approval - {adjustment.locationName}
          </h1>
          <p className="text-gray-500">
            Created: {new Date(adjustment.createdAt).toLocaleDateString()}
          </p>
        </div>
        <ExportOptions
          adjustment={adjustment}
          fileName={`stock-adjustment-${adjustment.id}`}
        />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search items..."
          className="max-w-md"
        />
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                <th className="pl-4 py-4 pr-2">
                  <Checkbox
                    checked={
                      selectedItemIds.length === adjustment.items.length &&
                      adjustment.items.length > 0
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
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, index) => {
                const isSelected = selectedItemIds.includes(item.productId);
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
                        onCheckedChange={() =>
                          toggleRowSelection(item.productId)
                        }
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
                      {ADJUSTMENT_REASONS.find((r) => r.id === item.reasonId)
                        ?.description ||
                        item.customReason ||
                        ""}
                    </td>
                    <td className="px-6 py-4">
                      {item.proof ? (
                        <Button
                          variant="link"
                          className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                          onClick={() => handleViewProof(item.proof!)}
                        >
                          Proof
                        </Button>
                      ) : (
                        <span className="text-gray-400 italic">No proof</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note Field */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2 font-medium">Note:</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add notes about this decision..."
          className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          className="bg-red-500 hover:bg-red-600 text-white border-none px-8"
          onClick={handleDeny}
        >
          Deny
        </Button>
        <Button
          className="bg-green-500 hover:bg-green-600 text-white px-8"
          onClick={handleApprove}
        >
          Approve
        </Button>
      </div>

      {/* Proof Image Modal */}
      <Dialog open={proofModalOpen} onOpenChange={setProofModalOpen}>
        <DialogContent className="sm:max-w-md !bg-white">
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
