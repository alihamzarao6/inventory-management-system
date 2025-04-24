"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  Calendar,
  Filter,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/utils";
import { MOCK_LOCATIONS } from "@/constants/mockLocations";
import { MOCK_STOCK_ADJUSTMENTS } from "@/constants/mockStockAdjustments";
import LocationFilter from "@/components/products/LocationFilters";

// Define enhanced adjustment type
interface EnhancedAdjustment {
  id: string;
  locationId: string;
  locationName: string;
  items: any[];
  createdAt: string;
  completedAt?: string;
  status: "pending" | "approved" | "rejected";
  note?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  username: string;
}

const StockAdjustRecords = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustments, setAdjustments] = useState<EnhancedAdjustment[]>([]);
  const [filteredAdjustments, setFilteredAdjustments] = useState<
    EnhancedAdjustment[]
  >([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedAdjustments, setPaginatedAdjustments] = useState<
    EnhancedAdjustment[]
  >([]);

  const [usernameFilter, setUsernameFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [isLocationFilterOpen, setIsLocationFilterOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  // Initialize stock adjustments
  useEffect(() => {
    // In a real app, this would be an API call
    // Add username for each record to match the UI mockup
    const mockAdjustments = MOCK_STOCK_ADJUSTMENTS.map((adj) => ({
      ...adj,
      username:
        adj.approvedBy ||
        adj.rejectedBy ||
        `User${Math.floor(Math.random() * 10) + 1}`,
      status: adj.status === "draft" ? "pending" : adj.status,
    })) as EnhancedAdjustment[];

    // Sort by date (newest first)
    mockAdjustments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setAdjustments(mockAdjustments);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...adjustments];

    // Apply search filter (on location name and ID)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (adj) =>
          adj.locationName.toLowerCase().includes(term) ||
          adj.id.toLowerCase().includes(term)
      );
    }

    // Apply username filter
    if (usernameFilter) {
      filtered = filtered.filter((adj) => adj.username === usernameFilter);
    }

    // Apply location filter
    if (locationFilter.length > 0) {
      filtered = filtered.filter((adj) =>
        locationFilter.includes(adj.locationId)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((adj) => adj.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      filtered = filtered.filter((adj) => {
        const adjustmentDate = new Date(adj.createdAt);
        return adjustmentDate >= fromDate;
      });
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((adj) => {
        const adjustmentDate = new Date(adj.createdAt);
        return adjustmentDate <= toDate;
      });
    }

    setFilteredAdjustments(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [
    adjustments,
    searchTerm,
    usernameFilter,
    locationFilter,
    statusFilter,
    dateRange,
    itemsPerPage,
  ]);

  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedAdjustments(filteredAdjustments.slice(startIndex, endIndex));
  }, [filteredAdjustments, currentPage, itemsPerPage]);

  // Get unique usernames for filter
  const uniqueUsernames = [
    ...new Set(adjustments.map((adj) => adj.username)),
  ].sort();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Denied
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  // View adjustment details
  const viewAdjustmentDetails = (adjustment: EnhancedAdjustment) => {
    // Route based on status
    switch (adjustment.status) {
      case "pending":
        router.push(`/stock-adjustment/approve?id=${adjustment.id}`);
        break;
      case "approved":
        router.push(`/stock-adjustment/completed?id=${adjustment.id}`);
        break;
      case "rejected":
        router.push(`/stock-adjustment/denied?id=${adjustment.id}`);
        break;
      default:
        router.push(`/stock-adjustment/history?id=${adjustment.id}`);
    }
  };

  // Handle location selection
  const handleLocationSelect = (locationIds: string[]) => {
    setLocationFilter(locationIds);
  };

  // Get location filter label
  const getLocationFilterLabel = () => {
    if (locationFilter.length === 0) {
      return "Filter by location";
    }

    if (locationFilter.length === 1) {
      const locationId = locationFilter[0];
      const location = MOCK_LOCATIONS.find((loc) => loc.id === locationId);
      return location ? location.name : "Location Selected";
    }

    return `${locationFilter.length} Locations`;
  };

  // Get date range label
  const getDateRangeLabel = () => {
    if (!dateRange.from && !dateRange.to) return "Filter by date";

    if (dateRange.from && dateRange.to) {
      if (dateRange.from.toDateString() === dateRange.to.toDateString()) {
        return format(dateRange.from, "d MMM yyyy");
      }
      return `${format(dateRange.from, "d MMM")} - ${format(
        dateRange.to,
        "d MMM yyyy"
      )}`;
    }

    if (dateRange.from) {
      return `From ${format(dateRange.from, "d MMM yyyy")}`;
    }

    if (dateRange.to) {
      return `Until ${format(dateRange.to, "d MMM yyyy")}`;
    }

    return "Filter by date";
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setUsernameFilter("");
    setLocationFilter([]);
    setDateRange({ from: undefined, to: undefined });
    setStatusFilter("");
  };

  // Get total items count
  const getTotalItemsCount = (adjustment: EnhancedAdjustment) => {
    return adjustment.items.length;
  };

  // Get total quantity
  const getTotalQuantity = (adjustment: EnhancedAdjustment) => {
    return adjustment.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="max-w-[1200px] mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Stock Adjustment Records
        </h1>
        <p className="text-gray-500 mt-1">
          View and manage inventory adjustment history
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="search"
            placeholder="Search by ID, location..."
            className="pl-10 w-full h-12 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="md:col-span-3">
          <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between h-12 border-gray-300",
                  dateRange.from || dateRange.to
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white"
                )}
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm truncate">
                    {getDateRangeLabel()}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                selected={dateRange}
                //@ts-ignore
                onSelect={setDateRange}
                numberOfMonths={2}
                defaultMonth={dateRange.from || new Date()}
              />
              <div className="flex items-center justify-between p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDateRange({ from: undefined, to: undefined })
                  }
                  className="text-xs"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={() => setIsDateFilterOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="md:col-span-3">
          <Popover
            open={isLocationFilterOpen}
            onOpenChange={setIsLocationFilterOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between h-12 border-gray-300",
                  locationFilter.length > 0
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white"
                )}
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm truncate">
                    {getLocationFilterLabel()}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <LocationFilter
                selectedLocationIds={locationFilter}
                onLocationSelect={handleLocationSelect}
                placeholder="Select locations"
                showCustomers={false}
                allowMultipleSelection={true}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="md:col-span-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between h-12 border-gray-300",
                  statusFilter || usernameFilter
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white"
                )}
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm truncate">More Filters</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="end">
              <div className="p-2">
                <div className="mb-2 text-sm font-medium text-gray-700 px-2 py-1">
                  Status
                </div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm",
                      statusFilter === "" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => setStatusFilter("")}
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm",
                      statusFilter === "approved" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => setStatusFilter("approved")}
                  >
                    Approved
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm",
                      statusFilter === "pending" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => setStatusFilter("pending")}
                  >
                    Pending
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm",
                      statusFilter === "rejected" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => setStatusFilter("rejected")}
                  >
                    Denied
                  </Button>
                </div>

                <div className="mt-3 border-t pt-2">
                  <div className="mb-2 text-sm font-medium text-gray-700 px-2 py-1">
                    User
                  </div>
                  <div className="max-h-[200px] overflow-y-auto space-y-1">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm",
                        usernameFilter === "" && "bg-blue-50 text-blue-700"
                      )}
                      onClick={() => setUsernameFilter("")}
                    >
                      All Users
                    </Button>
                    {uniqueUsernames.map((username) => (
                      <Button
                        key={username}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-sm",
                          usernameFilter === username &&
                            "bg-blue-50 text-blue-700"
                        )}
                        onClick={() => setUsernameFilter(username)}
                      >
                        {username}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 border-t pt-2">
                  <Button
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                    variant="ghost"
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Applied Filters */}
      {(usernameFilter ||
        locationFilter.length > 0 ||
        dateRange.from ||
        dateRange.to ||
        statusFilter) && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Active filters:</span>

          {usernameFilter && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              User: {usernameFilter}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setUsernameFilter("")}
              />
            </Badge>
          )}

          {locationFilter.length > 0 && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              Locations: {locationFilter.length} selected
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setLocationFilter([])}
              />
            </Badge>
          )}

          {statusFilter && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              Status:{" "}
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setStatusFilter("")}
              />
            </Badge>
          )}

          {dateRange.from && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              From: {format(dateRange.from, "d MMM yyyy")}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setDateRange({ ...dateRange, from: undefined })}
              />
            </Badge>
          )}

          {dateRange.to && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              To: {format(dateRange.to, "d MMM yyyy")}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setDateRange({ ...dateRange, to: undefined })}
              />
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Status Icons for Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-yellow-700 text-sm">Pending</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-700 text-sm">Approved</span>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700 text-sm">Denied</span>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Records List */}
      <Card className="overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-200">
          {paginatedAdjustments.length > 0 ? (
            paginatedAdjustments.map((adjustment) => (
              <div
                key={adjustment.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => viewAdjustmentDetails(adjustment)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex-shrink-0 p-3 rounded-lg",
                        adjustment.status === "approved"
                          ? "bg-green-100"
                          : adjustment.status === "rejected"
                          ? "bg-red-100"
                          : "bg-yellow-100"
                      )}
                    >
                      {adjustment.status === "approved" ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : adjustment.status === "rejected" ? (
                        <XCircle className="h-6 w-6 text-red-600" />
                      ) : (
                        <Clock className="h-6 w-6 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {adjustment.id} - {adjustment.locationName}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1 flex items-center flex-wrap gap-2">
                        <span>
                          <span className="font-medium">Date:</span>{" "}
                          {formatDate(adjustment.createdAt)}
                        </span>
                        <span className="inline-block h-1 w-1 rounded-full bg-gray-300 mx-1"></span>
                        <span>
                          <span className="font-medium">Items:</span>{" "}
                          {getTotalItemsCount(adjustment)} types (
                          {getTotalQuantity(adjustment)} units)
                        </span>
                        <span className="inline-block h-1 w-1 rounded-full bg-gray-300 mx-1"></span>
                        <span>
                          <span className="font-medium">User:</span>{" "}
                          {adjustment.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStatusBadge(adjustment.status)}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-10 text-gray-500">
              {searchTerm ||
              usernameFilter ||
              locationFilter.length > 0 ||
              statusFilter ||
              dateRange.from ||
              dateRange.to
                ? "No stock adjustments found matching your filters"
                : "No stock adjustment records available"}
            </div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {filteredAdjustments.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredAdjustments.length)}{" "}
            of {filteredAdjustments.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum = i + 1;

              // If there are more than 5 pages and we're not on the first page
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 3 + i;

                // Don't go beyond the last page
                if (pageNum > totalPages) {
                  return null;
                }
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "w-8 h-8 p-0",
                    currentPage === pageNum
                      ? "bg-blue-500 text-white"
                      : "text-gray-700"
                  )}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && (
                  <span className="px-2">...</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 p-0 text-gray-700"
                >
                  {totalPages}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAdjustRecords;
