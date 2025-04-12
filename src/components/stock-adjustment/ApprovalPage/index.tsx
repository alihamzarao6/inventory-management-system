"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Printer,
  Share,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils";
import { StockAdjustment, StockAdjustmentItem } from "@/types/stockAdjustment";
import { ADJUSTMENT_REASONS } from "@/constants/mockStockAdjustments";
import useToast from "@/hooks/useToast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { createHandleExport } from "@/utils/pdfExport";

export const ApprovalPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

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
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [denyReasonError, setDenyReasonError] = useState("");

  // Set up export function
  const handleExport = adjustment
    ? createHandleExport(
        //@ts-ignore
        printRef,
        "stock-adjustment",
        `${adjustment.locationName.replace(/\s+/g, "-").toLowerCase()}`
      )
    : () => {};

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
      // Select all items by default
      setSelectedItemIds(items.map((item) => item.productId));
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
    const approvedAdjustment = {
      ...adjustment,
      status: "approved",
      approvedBy: "Admin User",
      approvedAt: new Date().toISOString(),
      note: note.trim() || "Approved",
    };

    showToast("Adjustment approved successfully", "success");

    // Navigate to completion page
    router.push(`/stock-adjustment/completed?id=${adjustmentId}`);
  };

  // Handle deny dialog open
  const handleDenyClick = () => {
    setDenyDialogOpen(true);
  };

  // Handle deny action
  const handleDenyConfirm = () => {
    if (!denyReason.trim()) {
      setDenyReasonError("Please provide a reason for denial");
      return;
    }

    // In a real app, this would be an API call
    const deniedAdjustment = {
      ...adjustment,
      status: "rejected",
      rejectedBy: "Admin User",
      rejectedAt: new Date().toISOString(),
      note: denyReason,
    };

    setDenyDialogOpen(false);
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2 bg-white"
          >
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>
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
                          View Proof
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

      {/* Note Field - Optional for approval */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2 font-medium">
          Approval Note (Optional):
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add notes about this approval..."
          className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          className="bg-red-500 hover:bg-red-600 text-white border-none px-8"
          onClick={handleDenyClick}
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

      {/* Deny Reason Dialog */}
      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent className="sm:max-w-md !bg-white">
          <DialogTitle>Reason for Denial</DialogTitle>
          <div className="py-4">
            <p className="text-gray-500 mb-4">
              Please provide a reason why this stock adjustment is being denied.
            </p>
            <textarea
              value={denyReason}
              onChange={(e) => {
                setDenyReason(e.target.value);
                if (e.target.value.trim()) {
                  setDenyReasonError("");
                }
              }}
              placeholder="Enter reason for denial..."
              className={cn(
                "w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300",
                denyReasonError && "border-red-500 focus:ring-red-300"
              )}
              rows={4}
            />
            {denyReasonError && (
              <p className="text-red-500 text-sm mt-1">{denyReasonError}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDenyConfirm}
            >
              Confirm Denial
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Printable content for export - hidden */}
      <div className="hidden">
        <div ref={printRef} className="p-8 bg-white">
          <h1 className="text-2xl font-bold mb-2">Stock Adjustment Report</h1>
          <h2 className="text-lg font-semibold text-gray-700 mb-6">
            Pending Approval - {adjustment.locationName}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="font-medium">Date:</p>
              <p>{new Date(adjustment.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-medium">Status:</p>
              <p>Pending Approval</p>
            </div>
          </div>

          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="border-t border-b border-gray-300">
                <th className="py-2 px-4 text-left">Item Name</th>
                <th className="py-2 px-4 text-left">Category</th>
                <th className="py-2 px-4 text-right">Previous Qty</th>
                <th className="py-2 px-4 text-right">Adjustment</th>
                <th className="py-2 px-4 text-right">New Qty</th>
                <th className="py-2 px-4 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {adjustment.items.map((item) => (
                <tr key={item.productId} className="border-b border-gray-200">
                  <td className="py-2 px-4">{item.productName}</td>
                  <td className="py-2 px-4">{item.category}</td>
                  <td className="py-2 px-4 text-right">
                    {item.previousQuantity}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {item.adjustmentType === "Add" ? (
                      <span className="text-green-600">+{item.quantity}</span>
                    ) : (
                      <span className="text-red-600">-{item.quantity}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-right font-medium">
                    {item.newQuantity}
                  </td>
                  <td className="py-2 px-4">
                    {ADJUSTMENT_REASONS.find((r) => r.id === item.reasonId)
                      ?.description ||
                      item.customReason ||
                      ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>
              This document was generated from the Inventory Management System
            </p>
            <p>{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPage;
