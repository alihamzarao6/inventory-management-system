"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils";
import { StockAdjustmentItem } from "@/types/stockAdjustment";
import ExportOptions from "@/components/stock-adjustment/ExportOptions";

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

  // Get record ID from query params
  const recordId = searchParams.get("id");

  // State
  const [record, setRecord] = useState<IncomingItemsRecord | null>(null);
  const [sortColumn, setSortColumn] = useState<string>("productName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
          <p className="text-gray-500 mt-1">
            Supplier: <span className="font-medium">{record.supplierName}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <ExportOptions
            adjustment={{
              id: record.id,
              locationId: record.locationId,
              locationName: record.locationName,
              items: record.items,
              createdAt: record.createdAt,
              completedAt: record.completedAt,
              status: "approved",
            }}
            fileName={`incoming-items-${record.id}`}
          />
        </div>
      </div>

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
                      <span className="text-green-500">+{item.quantity}</span>
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

      {/* Note */}
      {record.note && (
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Note:</label>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            {record.note}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedPage;
