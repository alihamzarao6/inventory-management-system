"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import LocationFilters from "@/components/products/LocationFilters";
import { cn } from "@/utils";
import { StockAdjustment } from "@/types/stockAdjustment";
import { MOCK_STOCK_ADJUSTMENTS } from "@/constants/mockStockAdjustments";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { MOCK_CUSTOMERS } from "@/constants/mockCustomers";

const HistoryPage = () => {
  const router = useRouter();

  // State
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [filteredAdjustments, setFilteredAdjustments] = useState<
    StockAdjustment[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [isLocationFilterOpen, setIsLocationFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Load adjustments data
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setAdjustments(MOCK_STOCK_ADJUSTMENTS);
      setIsLoading(false);
    }, 500);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...adjustments];

    // Apply status filter (tab)
    if (activeTab !== "all") {
      result = result.filter((adj) => adj.status === activeTab);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (adj) =>
          adj.locationName.toLowerCase().includes(term) ||
          adj.id.toLowerCase().includes(term)
      );
    }

    // Apply location filter using selectedLocationIds
    if (selectedLocationIds.length > 0) {
      result = result.filter((adj) => {
        // Check if adjustment's locationId matches any of the selected location IDs
        if (selectedLocationIds.includes(adj.locationId)) {
          return true;
        }

        // If the adjustment might be associated with multiple locations (in a real app)
        // we would check that here. For now, just use the single locationId

        return false;
      });
    }

    // Apply date filter
    if (dateFilter) {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));

      switch (dateFilter) {
        case "today":
          result = result.filter((adj) => {
            const date = new Date(adj.createdAt);
            return date >= today && date <= todayEnd;
          });
          break;
        case "yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayEnd = new Date(yesterday);
          yesterdayEnd.setHours(23, 59, 59, 999);

          result = result.filter((adj) => {
            const date = new Date(adj.createdAt);
            return date >= yesterday && date <= yesterdayEnd;
          });
          break;
        case "last7days":
          const last7days = new Date(today);
          last7days.setDate(last7days.getDate() - 7);

          result = result.filter((adj) => {
            const date = new Date(adj.createdAt);
            return date >= last7days && date <= todayEnd;
          });
          break;
        case "last30days":
          const last30days = new Date(today);
          last30days.setDate(last30days.getDate() - 30);

          result = result.filter((adj) => {
            const date = new Date(adj.createdAt);
            return date >= last30days && date <= todayEnd;
          });
          break;
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortColumn) {
        case "locationName":
          valueA = a.locationName.toLowerCase();
          valueB = b.locationName.toLowerCase();
          break;
        case "status":
          valueA = a.status;
          valueB = b.status;
          break;
        case "createdAt":
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredAdjustments(result);
  }, [
    adjustments,
    searchTerm,
    selectedLocationIds,
    dateFilter,
    sortColumn,
    sortDirection,
    activeTab,
  ]);

  // Handle location selection
  const handleLocationSelect = (
    locationIds: string[],
    isCustomer?: boolean
  ) => {
    setSelectedLocationIds(locationIds);
  };

  // Get location filter label
  const getLocationFilterLabel = () => {
    if (selectedLocationIds.length === 0) {
      return "All Locations";
    }

    if (selectedLocationIds.length === 1) {
      const locationId = selectedLocationIds[0];
      // Check if it's a customer
      const customer = MOCK_CUSTOMERS.find((c) => c.id === locationId);
      if (customer) {
        return `Customer: ${customer.name}`;
      }

      // Check if it's a main location
      const location = MOCK_LOCATIONS.find((loc) => loc.id === locationId);
      if (location) {
        return location.name;
      }

      // Must be a sub-location
      const subLocation = MOCK_SUB_LOCATIONS.find((sl) => sl.id === locationId);
      if (subLocation) {
        return subLocation.name;
      }

      return "Location Selected";
    }

    return `${selectedLocationIds.length} Locations`;
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

  // View adjustment details
  const handleViewAdjustment = (adjustment: StockAdjustment) => {
    const status = adjustment.status;
    let route = "/stock-adjustment";

    switch (status) {
      case "approved":
        route = `/stock-adjustment/completed?id=${adjustment.id}`;
        break;
      case "rejected":
        route = `/stock-adjustment/denied?id=${adjustment.id}`;
        break;
      case "pending":
        route = `/stock-adjustment/approve?id=${adjustment.id}`;
        break;
    }

    router.push(route);
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Approved
          </div>
        );
      case "rejected":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Denied
          </div>
        );
      case "pending":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </div>
        );
    }
  };

  // Function to clear location filter
  const clearLocationFilter = () => {
    setSelectedLocationIds([]);
  };

  return (
    <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="mb-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/stock-adjustment")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Stock Adjustment History
        </h1>
        <p className="text-gray-500">
          View and manage past inventory adjustments
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 w-full">
        <div className="relative w-2/3">
          <Input
            type="search"
            placeholder="Search adjustments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
        <div className="flex gap-4 w-1/3">
          {/* LocationFilters integration */}
          <Popover
            open={isLocationFilterOpen}
            onOpenChange={setIsLocationFilterOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-12 px-4 border-gray-300 bg-white flex items-center justify-between w-full",
                  selectedLocationIds.length > 0 &&
                    "bg-blue-50 text-blue-600 border-blue-200"
                )}
              >
                <div className="flex items-center">
                  <span>{getLocationFilterLabel()}</span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 max-h-[600px] overflow-y-auto"
              align="start"
            >
              <LocationFilters
                selectedLocationIds={selectedLocationIds}
                onLocationSelect={handleLocationSelect}
                showCustomers={true}
                allowMultipleSelection={true}
                placeholder="Filter by location..."
              />
            </PopoverContent>
          </Popover>

          {/* <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select> */}
        </div>
      </div>

      {/* Display active filters */}
      {(selectedLocationIds.length > 0 || dateFilter) && (
        <div className="mb-4 flex gap-2 items-center">
          <span className="text-sm text-gray-500">Active filters:</span>

          {selectedLocationIds.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="h-8 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
              onClick={clearLocationFilter}
            >
              {getLocationFilterLabel()} ×
            </Button>
          )}

          {dateFilter && (
            <Button
              variant="secondary"
              size="sm"
              className="h-8 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
              onClick={() => setDateFilter("")}
            >
              {dateFilter === "today" && "Today"}
              {dateFilter === "yesterday" && "Yesterday"}
              {dateFilter === "last7days" && "Last 7 Days"}
              {dateFilter === "last30days" && "Last 30 Days"} ×
            </Button>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-6 py-2 rounded-lg",
              activeTab === "all"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            All
          </Button>
          <Button
            variant={activeTab === "approved" ? "default" : "outline"}
            onClick={() => setActiveTab("approved")}
            className={cn(
              "px-6 py-2 rounded-lg",
              activeTab === "approved"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            Approved
          </Button>
          <Button
            variant={activeTab === "pending" ? "default" : "outline"}
            onClick={() => setActiveTab("pending")}
            className={cn(
              "px-6 py-2 rounded-lg",
              activeTab === "pending"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            Pending
          </Button>
          <Button
            variant={activeTab === "rejected" ? "default" : "outline"}
            onClick={() => setActiveTab("rejected")}
            className={cn(
              "px-6 py-2 rounded-lg",
              activeTab === "rejected"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            Denied
          </Button>
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
        </div>

        <TabsContent value="all" className="mt-0">
          {renderAdjustmentsTable()}
        </TabsContent>
        <TabsContent value="approved" className="mt-0">
          {renderAdjustmentsTable()}
        </TabsContent>
        <TabsContent value="pending" className="mt-0">
          {renderAdjustmentsTable()}
        </TabsContent>
        <TabsContent value="rejected" className="mt-0">
          {renderAdjustmentsTable()}
        </TabsContent>
      </Tabs>

      {/* Pagination (if needed in future) */}
      <div className="mt-6 flex justify-end">
        <Button
          variant="outline"
          className="ml-auto"
          onClick={() => router.push("/stock-adjustment")}
        >
          New Adjustment
        </Button>
      </div>
    </div>
  );

  // Helper function to render the adjustments table
  function renderAdjustmentsTable() {
    if (isLoading) {
      return (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p>Loading adjustments...</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("createdAt")}
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    {renderSortIndicator("createdAt")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("locationName")}
                >
                  <div className="flex items-center gap-1">
                    <span>Location</span>
                    {renderSortIndicator("locationName")}
                  </div>
                </th>
                <th className="px-6 py-4">Items</th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("status")}
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    {renderSortIndicator("status")}
                  </div>
                </th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdjustments.length > 0 ? (
                filteredAdjustments.map((adjustment, index) => (
                  <tr
                    key={adjustment.id}
                    className={cn(
                      "transition-colors border-t border-gray-100",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                      "hover:bg-gray-50"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {new Date(adjustment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {adjustment.locationName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {adjustment.items.length} items
                    </td>
                    <td className="px-6 py-4">
                      {renderStatusBadge(adjustment.status)}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleViewAdjustment(adjustment)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    {searchTerm ||
                    selectedLocationIds.length > 0 ||
                    dateFilter ||
                    activeTab !== "all"
                      ? "No adjustments found matching your filters"
                      : "No adjustment history available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
};

export default HistoryPage;
