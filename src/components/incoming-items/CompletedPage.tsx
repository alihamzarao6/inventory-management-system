"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Printer,
  Share,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";
import { StockAdjustmentItem } from "@/types/stockAdjustment";
import { createHandleExport } from "@/utils/pdfExport";

// Mock suppliers data
const MOCK_SUPPLIERS = [
  { id: "sup-1", name: "ABC Suppliers" },
  { id: "sup-2", name: "XYZ Distributors" },
  { id: "sup-3", name: "Global Trade Partners" },
  { id: "sup-4", name: "Quality Imports Ltd" },
  { id: "sup-5", name: "Prime Vendors Inc" },
];

interface IncomingItemsRecord {
  id: string;
  locationId: string;
  locationName: string;
  supplierId: string;
  supplierName: string;
  items: StockAdjustmentItem[];
  createdAt: string;
  completedAt: string;
  status: string;
  note?: string;
}

export const CompletedPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const printRef = useRef<HTMLDivElement>(null);

  // Get record ID from query params
  const recordId = searchParams.get("id");

  // State
  const [record, setRecord] = useState<IncomingItemsRecord | null>(null);
  const [sortColumn, setSortColumn] = useState<string>("productName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("items");

  // Set up export function
  const handleExport = record
    ? createHandleExport(
        //@ts-ignore
        printRef,
        "incoming-report",
        `${record.supplierName.replace(/\s+/g, "-").toLowerCase()}`
      )
    : () => {};

  // Load record data
  useEffect(() => {
    if (!recordId) {
      router.push("/incoming-items");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, we would fetch the record from the API
      // For this mock, we'll create a fake record
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
          reasonId: "",
        },
        {
          productId: "prod-2",
          productName: "Stainless Steel Cookware Set",
          productImage:
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1528&auto=format&fit=crop",
          category: "Kitchenware",
          adjustmentType: "Add",
          quantity: 10,
          previousQuantity: 30,
          newQuantity: 40,
          reasonId: "",
        },
      ];

      // Find a random supplier for the mock
      const supplier =
        MOCK_SUPPLIERS[Math.floor(Math.random() * MOCK_SUPPLIERS.length)];

      const mockRecord: IncomingItemsRecord = {
        id: recordId,
        locationId: "1",
        locationName: "Warehouse 1",
        supplierId: supplier.id,
        supplierName: supplier.name,
        items,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        status: "completed",
      };

      setRecord(mockRecord);
      setIsLoading(false);
    }, 500);
  }, [recordId, router]);

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

  // Sort and filter items
  const getSortedAndFilteredItems = () => {
    if (!record?.items || record.items.length === 0) return [];

    let filteredItems = record.items;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.productName.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
      );
    }

    // Sort items
    return [...filteredItems].sort((a, b) => {
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
          valueA = a.quantity;
          valueB = b.quantity;
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

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    router.push("/incoming-items");
  };

  const sortedAndFilteredItems = getSortedAndFilteredItems();

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p>Loading details...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-8 text-center">
        <p>Record not found</p>
        <Button className="mt-4" onClick={() => router.push("/incoming-items")}>
          Back to Incoming Items
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="mb-4">
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Incoming Items
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-green-500">
            Incoming Items Completed - {record.locationName}
          </h1>
          <p className="text-gray-500">
            Completed:{" "}
            {new Date(
              record.completedAt || record.createdAt
            ).toLocaleDateString()}
          </p>
          <div className="flex items-center text-gray-500 mt-1">
            <User className="h-4 w-4 mr-1 text-blue-500" />
            <span>Supplier: </span>
            <span className="font-medium ml-1">{record.supplierName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/incoming-items/history")}
            className="flex items-center gap-2 bg-white"
          >
            <Share className="h-4 w-4" />
            View History
          </Button>
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
            Export
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="items"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={activeTab === "items" ? "default" : "outline"}
            onClick={() => setActiveTab("items")}
            className={cn(
              "px-6 py-2 rounded-lg",
              activeTab === "items"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            Items
          </Button>
          <Button
            variant={activeTab === "details" ? "default" : "outline"}
            onClick={() => setActiveTab("details")}
            className={cn(
              "px-6 py-2 rounded-lg",
              activeTab === "details"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            Details
          </Button>
        </div>

        <TabsContent value="items">
          {/* Search Bar */}
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Search items..."
              className="max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
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
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredItems.length > 0 ? (
                    sortedAndFilteredItems.map((item, index) => (
                      <tr
                        key={item.productId}
                        className={cn(
                          "transition-colors border-t border-gray-100",
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                          "hover:bg-gray-50"
                        )}
                      >
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
                          <span className="text-green-500">
                            +{item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {item.newQuantity}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        {searchTerm
                          ? "No items found matching your search"
                          : "No items in this record"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Transaction Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Location Information
                </h3>
                <p className="text-gray-900 mb-1">
                  <span className="font-medium">Location:</span>{" "}
                  {record.locationName}
                </p>
                <p className="text-gray-900 mb-1">
                  <span className="font-medium">Location ID:</span>{" "}
                  {record.locationId}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Supplier Information
                </h3>
                <p className="text-gray-900 mb-1">
                  <span className="font-medium">Supplier:</span>{" "}
                  {record.supplierName}
                </p>
                <p className="text-gray-900 mb-1">
                  <span className="font-medium">Supplier ID:</span>{" "}
                  {record.supplierId}
                </p>
              </div>

              <div className="col-span-1 md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Transaction Information
                </h3>
                <p className="text-gray-900 mb-1">
                  <span className="font-medium">Transaction ID:</span>{" "}
                  {record.id}
                </p>
                <p className="text-gray-900 mb-1">
                  <span className="font-medium">Date Created:</span>{" "}
                  {new Date(record.createdAt).toLocaleString()}
                </p>
                <p className="text-gray-900 mb-1">
                  <span className="font-medium">Date Completed:</span>{" "}
                  {new Date(record.completedAt).toLocaleString()}
                </p>
                <p className="text-gray-900 mb-1">
                  <span className="font-medium">Status:</span>{" "}
                  {record.status.charAt(0).toUpperCase() +
                    record.status.slice(1)}
                </p>
                <p className="text-gray-900 mb-1">
                  <span className="font-medium">Total Items:</span>{" "}
                  {record.items.length}
                </p>
                <p className="text-gray-900 mb-1">
                  <span className="font-medium">Total Quantity Added:</span>{" "}
                  {record.items.reduce(
                    (total, item) => total + item.quantity,
                    0
                  )}
                </p>
              </div>
            </div>

            {/* Note section */}
            {record.note && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Notes
                </h3>
                <p className="text-gray-900 whitespace-pre-line">
                  {record.note}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Printable content for PDF export - hidden */}
      <div className="hidden">
        <div ref={printRef} className="p-8 bg-white">
          <h1 className="text-2xl font-bold mb-2">Incoming Items Report</h1>
          <h2 className="text-lg font-semibold text-gray-700 mb-6">
            Transaction ID: {record.id}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="font-medium">Date:</p>
              <p>{new Date(record.completedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-medium">Location:</p>
              <p>{record.locationName}</p>
            </div>
            <div>
              <p className="font-medium">Supplier:</p>
              <p>{record.supplierName}</p>
            </div>
            <div>
              <p className="font-medium">Status:</p>
              <p>
                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
              </p>
            </div>
          </div>

          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="border-t border-b border-gray-300">
                <th className="py-2 px-4 text-left">Item Name</th>
                <th className="py-2 px-4 text-left">Category</th>
                <th className="py-2 px-4 text-right">Previous Qty</th>
                <th className="py-2 px-4 text-right">Added</th>
                <th className="py-2 px-4 text-right">New Qty</th>
              </tr>
            </thead>
            <tbody>
              {record.items.map((item) => (
                <tr key={item.productId} className="border-b border-gray-200">
                  <td className="py-2 px-4">{item.productName}</td>
                  <td className="py-2 px-4">{item.category}</td>
                  <td className="py-2 px-4 text-right">
                    {item.previousQuantity}
                  </td>
                  <td className="py-2 px-4 text-right text-green-600">
                    +{item.quantity}
                  </td>
                  <td className="py-2 px-4 text-right font-medium">
                    {item.newQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-300">
                <td className="py-2 px-4 font-bold" colSpan={3}>
                  Total
                </td>
                <td className="py-2 px-4 text-right font-bold text-green-600">
                  +{record.items.reduce((sum, item) => sum + item.quantity, 0)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          {record.note && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Notes:</h3>
              <p className="text-gray-700 whitespace-pre-line">{record.note}</p>
            </div>
          )}

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

export default CompletedPage;
