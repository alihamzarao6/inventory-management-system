"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowLeft, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils";
import { StockAdjustmentItem } from "@/types/stockAdjustment";
import { MOCK_LOCATIONS } from "@/constants/mockLocations";
import { debounce } from "lodash";

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
  totalItems: number;
  totalQuantity: number;
}

// Generate mock history records
const generateMockHistory = (count: number): IncomingItemsRecord[] => {
  const records: IncomingItemsRecord[] = [];

  for (let i = 0; i < count; i++) {
    const itemsCount = Math.floor(Math.random() * 10) + 1;
    const totalQuantity = Math.floor(Math.random() * 100) + 10;

    const location =
      MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
    const supplier =
      MOCK_SUPPLIERS[Math.floor(Math.random() * MOCK_SUPPLIERS.length)];

    // Create dates from newest to oldest
    const daysAgo = i * 2;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const completedAt = new Date(createdAt);
    completedAt.setHours(completedAt.getHours() + 2);

    records.push({
      id: `incoming-${1000 + i}`,
      locationId: location.id,
      locationName: location.name,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: [], // We don't need to populate this for the history view
      createdAt: createdAt.toISOString(),
      completedAt: completedAt.toISOString(),
      status: "completed",
      totalItems: itemsCount,
      totalQuantity: totalQuantity,
    });
  }

  return records;
};

const MOCK_HISTORY = generateMockHistory(20);

const HistoryPage = () => {
  const router = useRouter();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filteredRecords, setFilteredRecords] =
    useState<IncomingItemsRecord[]>(MOCK_HISTORY);

  // Filter records when search term changes with debounce
  const debouncedSearch = React.useCallback(
    debounce((query: string, location: string, supplier: string) => {
      let filtered = [...MOCK_HISTORY];

      // Apply search filter
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter(
          (record) =>
            record.id.toLowerCase().includes(lowerQuery) ||
            record.locationName.toLowerCase().includes(lowerQuery) ||
            record.supplierName.toLowerCase().includes(lowerQuery)
        );
      }

      // Apply location filter
      if (location) {
        filtered = filtered.filter((record) => record.locationId === location);
      }

      // Apply supplier filter
      if (supplier) {
        filtered = filtered.filter((record) => record.supplierId === supplier);
      }

      setFilteredRecords(filtered);
    }, 300),
    []
  );

  // Update filtered records when filters change
  useEffect(() => {
    debouncedSearch(searchTerm, locationFilter, supplierFilter);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, locationFilter, supplierFilter, debouncedSearch]);

  // Handle sort column click
  const handleSortClick = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("desc");
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

  // Get sorted records
  const getSortedRecords = () => {
    return [...filteredRecords].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortColumn) {
        case "date":
          valueA = new Date(a.completedAt || a.createdAt).getTime();
          valueB = new Date(b.completedAt || b.createdAt).getTime();
          break;
        case "location":
          valueA = a.locationName.toLowerCase();
          valueB = b.locationName.toLowerCase();
          break;
        case "supplier":
          valueA = a.supplierName.toLowerCase();
          valueB = b.supplierName.toLowerCase();
          break;
        case "items":
          valueA = a.totalItems;
          valueB = b.totalItems;
          break;
        case "quantity":
          valueA = a.totalQuantity;
          valueB = b.totalQuantity;
          break;
        default:
          valueA = new Date(a.completedAt || a.createdAt).getTime();
          valueB = new Date(b.completedAt || b.createdAt).getTime();
          break;
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  // View record details
  const handleViewRecord = (recordId: string) => {
    router.push(`/incoming-items/completed?id=${recordId}`);
  };

  const sortedRecords = getSortedRecords();

  return (
    <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="mb-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/incoming-items")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Incoming Items
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Incoming Items History
        </h1>
        <p className="text-gray-500">
          View all completed incoming inventory records
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value=" ">All Locations</SelectItem> */}
            {MOCK_LOCATIONS.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by supplier" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value=" ">All Suppliers</SelectItem> */}
            {MOCK_SUPPLIERS.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("date")}
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    {renderSortIndicator("date")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("location")}
                >
                  <div className="flex items-center gap-1">
                    <span>Location</span>
                    {renderSortIndicator("location")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("supplier")}
                >
                  <div className="flex items-center gap-1">
                    <span>Supplier</span>
                    {renderSortIndicator("supplier")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("items")}
                >
                  <div className="flex items-center gap-1">
                    <span>Items</span>
                    {renderSortIndicator("items")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("quantity")}
                >
                  <div className="flex items-center gap-1">
                    <span>Total Quantity</span>
                    {renderSortIndicator("quantity")}
                  </div>
                </th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.length > 0 ? (
                sortedRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className={cn(
                      "transition-colors border-t border-gray-100",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                      "hover:bg-gray-50"
                    )}
                  >
                    <td className="px-6 py-4 text-gray-900">
                      {new Date(
                        record.completedAt || record.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {record.locationName}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {record.supplierName}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {record.totalItems}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {record.totalQuantity}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-8 text-blue-500 hover:text-blue-700"
                        onClick={() => handleViewRecord(record.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
