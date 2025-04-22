"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  Calendar,
  Filter,
  ArrowRight,
  X,
  Download,
  Printer,
  ChevronRight,
  ExternalLink,
  Clock,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";
import { TransferFormData } from "@/types/transfers";
import LocationFilter from "@/components/products/LocationFilters";

// Define extended TransferFormData for records
interface TransferRecord extends TransferFormData {
  id: string;
  createdAt: string;
  completedAt?: string;
  status: "pending" | "completed" | "cancelled";
  username: string;
  sourceLocationName?: string; // Optional because we'll generate it
  destinationLocationName?: string; // Optional because we'll generate it
}

// Mock data for transfers with more realistic items
const generateMockTransfers = (): TransferRecord[] => {
  const transfers: TransferRecord[] = [];

  const locations = MOCK_LOCATIONS.map((loc) => ({
    id: loc.id,
    name: loc.name,
  }));

  // Generate 20 mock transfers
  for (let i = 0; i < 20; i++) {
    const sourceIndex = Math.floor(Math.random() * locations.length);
    let destIndex = Math.floor(Math.random() * locations.length);

    // Make sure source and destination are different
    while (destIndex === sourceIndex) {
      destIndex = Math.floor(Math.random() * locations.length);
    }

    const sourceLocation = locations[sourceIndex];
    const destLocation = locations[destIndex];

    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days

    const completedDate = new Date(createdDate);
    completedDate.setHours(
      completedDate.getHours() + Math.floor(Math.random() * 12)
    ); // Completed 0-12 hours later

    // Generate random items for this transfer
    const numItems = Math.floor(Math.random() * 5) + 1; // 1-5 items
    const transferItems = [];

    for (let j = 0; j < numItems; j++) {
      const randomProductIndex = Math.floor(
        Math.random() * MOCK_PRODUCTS.length
      );
      const product = MOCK_PRODUCTS[randomProductIndex];
      const quantity = Math.floor(Math.random() * 10) + 1; // 1-10 items

      transferItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        category: product.category,
        sourceLocationId: sourceLocation.id,
        sourceLocationName: sourceLocation.name,
        quantity: quantity,
        sourceQuantity: quantity + Math.floor(Math.random() * 20),
        destinationQuantity: Math.floor(Math.random() * 15),
      });
    }

    const statusOptions: Array<"pending" | "completed" | "cancelled"> = [
      "pending",
      "completed",
      "cancelled",
    ];
    const statusWeights = [0.1, 0.8, 0.1]; // 10% pending, 80% completed, 10% cancelled
    const randomStatus = () => {
      const rand = Math.random();
      let sum = 0;
      for (let i = 0; i < statusWeights.length; i++) {
        sum += statusWeights[i];
        if (rand < sum) return statusOptions[i];
      }
      return "completed";
    };

    const status = randomStatus();

    transfers.push({
      id: `TR-${1000 + i}`,
      sourceLocationIds: [sourceLocation.id],
      destinationLocationId: destLocation.id,
      sourceLocationName: sourceLocation.name,
      destinationLocationName: destLocation.name,
      items: transferItems,
      note:
        Math.random() > 0.7
          ? "This transfer was part of monthly inventory rebalancing."
          : "",
      createdAt: createdDate.toISOString(),
      completedAt:
        status === "completed" ? completedDate.toISOString() : undefined,
      status: status,
      username: `User${Math.floor(Math.random() * 10) + 1}`,
    });
  }

  return transfers.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

const TransferRecords = () => {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<TransferRecord[]>(
    []
  );

  // Filter states
  const [usernameFilter, setUsernameFilter] = useState("");
  const [fromLocationFilter, setFromLocationFilter] = useState<string[]>([]);
  const [toLocationFilter, setToLocationFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] =
    useState<TransferRecord | null>(null);
  const [activeTab, setActiveTab] = useState("items");

  // Initialize transfers
  useEffect(() => {
    // In a real app, this would be an API call
    const mockTransfers = generateMockTransfers();
    setTransfers(mockTransfers);
    setFilteredTransfers(mockTransfers);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...transfers];

    // Apply search filter (on transfer ID and location names)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(term) ||
          t.sourceLocationName?.toLowerCase().includes(term) ||
          t.destinationLocationName?.toLowerCase().includes(term)
      );
    }

    // Apply username filter
    if (usernameFilter) {
      filtered = filtered.filter((t) => t.username === usernameFilter);
    }

    // Apply from location filter
    if (fromLocationFilter.length > 0) {
      filtered = filtered.filter((t) =>
        t.sourceLocationIds.some((id) => fromLocationFilter.includes(id))
      );
    }

    // Apply to location filter
    if (toLocationFilter.length > 0) {
      filtered = filtered.filter((t) =>
        toLocationFilter.includes(t.destinationLocationId)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      filtered = filtered.filter((t) => {
        const transferDate = new Date(t.createdAt);
        return transferDate >= fromDate;
      });
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((t) => {
        const transferDate = new Date(t.createdAt);
        return transferDate <= toDate;
      });
    }

    setFilteredTransfers(filtered);
  }, [
    transfers,
    searchTerm,
    usernameFilter,
    fromLocationFilter,
    toLocationFilter,
    statusFilter,
    dateRange,
  ]);

  // Get unique usernames for filter
  const uniqueUsernames = [...new Set(transfers.map((t) => t.username))];

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

  // View transfer details
  const viewTransferDetails = (transfer: TransferRecord) => {
    setSelectedTransfer(transfer);
    setDetailModalOpen(true);
  };

  // Handle location selection from the LocationFilter component for source location
  const handleFromLocationSelect = (
    locationIds: string[],
    isCustomer?: boolean
  ) => {
    setFromLocationFilter(locationIds);
  };

  // Handle location selection from the LocationFilter component for destination location
  const handleToLocationSelect = (
    locationIds: string[],
    isCustomer?: boolean
  ) => {
    setToLocationFilter(locationIds);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setUsernameFilter("");
    setFromLocationFilter([]);
    setToLocationFilter([]);
    setDateRange({ from: undefined, to: undefined });
    setStatusFilter("");
  };

  // Handle print
  const handlePrint = () => {
    window.print();
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

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Get first source location name
  const getSourceLocationName = (transfer: TransferRecord) => {
    if (transfer.sourceLocationName) return transfer.sourceLocationName;

    if (transfer.sourceLocationIds.length > 0) {
      const locationId = transfer.sourceLocationIds[0];
      const location = MOCK_LOCATIONS.find((loc) => loc.id === locationId);
      if (location) return location.name;

      const subLocation = MOCK_SUB_LOCATIONS.find(
        (loc) => loc.id === locationId
      );
      if (subLocation) return subLocation.name;
    }

    return "Unknown location";
  };

  // Get destination location name
  const getDestinationLocationName = (transfer: TransferRecord) => {
    if (transfer.destinationLocationName)
      return transfer.destinationLocationName;

    const location = MOCK_LOCATIONS.find(
      (loc) => loc.id === transfer.destinationLocationId
    );
    if (location) return location.name;

    const subLocation = MOCK_SUB_LOCATIONS.find(
      (loc) => loc.id === transfer.destinationLocationId
    );
    if (subLocation) return subLocation.name;

    return "Unknown location";
  };

  // Count total items transferred
  const getTotalItemsCount = (transfer: TransferRecord) => {
    return transfer.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="max-w-[1200px] mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transfer Records</h1>
        <p className="text-gray-500 mt-1">
          View and manage history of items transferred between locations
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-12 border-gray-300 bg-white"
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
                // @ts-ignore
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
                <Button size="sm" className="text-xs">
                  Apply
                </Button>
              </div>
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
                  fromLocationFilter.length > 0
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white"
                )}
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm truncate">
                    {fromLocationFilter.length > 0
                      ? `${fromLocationFilter.length} Source${
                          fromLocationFilter.length > 1 ? "s" : ""
                        }`
                      : "From Location"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <LocationFilter
                selectedLocationIds={fromLocationFilter}
                onLocationSelect={handleFromLocationSelect}
                placeholder="Select source locations"
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
                  toLocationFilter.length > 0
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white"
                )}
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm truncate">
                    {toLocationFilter.length > 0
                      ? `${toLocationFilter.length} Destination${
                          toLocationFilter.length > 1 ? "s" : ""
                        }`
                      : "To Location"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <LocationFilter
                selectedLocationIds={toLocationFilter}
                onLocationSelect={handleToLocationSelect}
                placeholder="Select destination locations"
                showCustomers={false}
                allowMultipleSelection={true}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="md:col-span-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full flex items-center justify-center h-12 border-gray-300",
                  statusFilter
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white"
                )}
              >
                <Filter className="h-4 w-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="end">
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
                      statusFilter === "completed" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => setStatusFilter("completed")}
                  >
                    Completed
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
                      statusFilter === "cancelled" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => setStatusFilter("cancelled")}
                  >
                    Cancelled
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
        fromLocationFilter.length > 0 ||
        toLocationFilter.length > 0 ||
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

          {fromLocationFilter.length > 0 && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              From: {fromLocationFilter.length} location
              {fromLocationFilter.length > 1 ? "s" : ""}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setFromLocationFilter([])}
              />
            </Badge>
          )}

          {toLocationFilter.length > 0 && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              To: {toLocationFilter.length} location
              {toLocationFilter.length > 1 ? "s" : ""}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setToLocationFilter([])}
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

      {/* Transfer Records List */}
      <Card className="overflow-hidden shadow-sm">
        {filteredTransfers.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => viewTransferDetails(transfer)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                      <ArrowRight className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {transfer.id} - {getSourceLocationName(transfer)} →{" "}
                        {getDestinationLocationName(transfer)}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1 flex items-center flex-wrap gap-2">
                        <span>
                          <span className="font-medium">Date:</span>{" "}
                          {formatDate(transfer.createdAt)}
                        </span>
                        <span className="inline-block h-1 w-1 rounded-full bg-gray-300 mx-1"></span>
                        <span>
                          <span className="font-medium">Items:</span>{" "}
                          {transfer.items.length} types (
                          {getTotalItemsCount(transfer)} units)
                        </span>
                        <span className="inline-block h-1 w-1 rounded-full bg-gray-300 mx-1"></span>
                        <span>
                          <span className="font-medium">User:</span>{" "}
                          {transfer.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(transfer.status)}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-10 text-gray-500">
            {searchTerm ||
            usernameFilter ||
            fromLocationFilter.length > 0 ||
            toLocationFilter.length > 0 ||
            dateRange.from ||
            dateRange.to ||
            statusFilter
              ? "No transfers found matching your filters"
              : "No transfer records available"}
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedTransfer && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl">
                    {selectedTransfer.id} - Transfer Details
                  </DialogTitle>
                </div>
                <DialogDescription>
                  View complete details of the transfer between locations
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Transfer Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">From:</div>
                      <div className="font-medium">
                        {getSourceLocationName(selectedTransfer)}
                      </div>

                      <div className="text-gray-500">To:</div>
                      <div className="font-medium">
                        {getDestinationLocationName(selectedTransfer)}
                      </div>

                      <div className="text-gray-500">Date Created:</div>
                      <div className="font-medium">
                        {formatDate(selectedTransfer.createdAt)}
                      </div>

                      <div className="text-gray-500">Time:</div>
                      <div className="font-medium">
                        {formatTime(selectedTransfer.createdAt)}
                      </div>

                      {selectedTransfer.completedAt && (
                        <>
                          <div className="text-gray-500">Completed:</div>
                          <div className="font-medium">
                            {formatDate(selectedTransfer.completedAt)} at{" "}
                            {formatTime(selectedTransfer.completedAt)}
                          </div>
                        </>
                      )}

                      <div className="text-gray-500">Processed by:</div>
                      <div className="font-medium">
                        {selectedTransfer.username}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Summary
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Status:</div>
                      <div>{getStatusBadge(selectedTransfer.status)}</div>

                      <div className="text-gray-500">Total Items:</div>
                      <div className="font-medium">
                        {selectedTransfer.items.length} different products
                      </div>

                      <div className="text-gray-500">Total Quantity:</div>
                      <div className="font-medium">
                        {getTotalItemsCount(selectedTransfer)} units
                      </div>

                      <div className="text-gray-500">Transfer ID:</div>
                      <div className="font-medium">{selectedTransfer.id}</div>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs
                defaultValue="items"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <div className="w-full flex items-center justify-center gap-4 pb-2 mb-4">
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
                    variant={activeTab === "notes" ? "default" : "outline"}
                    onClick={() => setActiveTab("notes")}
                    className={cn(
                      "px-6 py-2 rounded-lg",
                      activeTab === "notes"
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    Notes
                  </Button>
                </div>

                <TabsContent value="items" className="p-0">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source Qty
                          </th>
                          <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transferred
                          </th>
                          <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Destination Qty
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedTransfer.items.map((item: any) => (
                          <tr key={item.productId} className="hover:bg-gray-50">
                            <td className="p-3">
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10 rounded-md mr-3">
                                  <AvatarImage
                                    src={item.productImage}
                                    alt={item.productName}
                                  />
                                  <AvatarFallback className="rounded-md">
                                    {item.productName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {item.productName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.category}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-gray-900">
                              {item.sourceQuantity}
                            </td>
                            <td className="p-3 font-medium text-blue-600">
                              {item.quantity}
                            </td>
                            <td className="p-3 font-medium text-gray-900">
                              {item.destinationQuantity + item.quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="p-3 font-bold text-gray-900">
                            Totals
                          </td>
                          <td className="p-3 font-medium text-gray-900">
                            {selectedTransfer.items.reduce(
                              (sum, item) => sum + item.sourceQuantity,
                              0
                            )}
                          </td>
                          <td className="p-3 font-medium text-blue-600">
                            {selectedTransfer.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}
                          </td>
                          <td className="p-3 font-medium text-gray-900">
                            {selectedTransfer.items.reduce(
                              (sum, item) =>
                                sum + item.destinationQuantity + item.quantity,
                              0
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="p-0">
                  <div className="border rounded-lg p-4 min-h-[200px] bg-gray-50">
                    {selectedTransfer.note ? (
                      <div className="whitespace-pre-line">
                        {selectedTransfer.note}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No notes available for this transfer.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDetailModalOpen(false)}
                >
                  Close
                </Button>
                {selectedTransfer.status === "pending" && (
                  <Button className="bg-green-500 hover:bg-green-600 text-white">
                    Complete Transfer
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Printable content for PDF export - hidden */}
      <div className="hidden">
        <div ref={printRef} className="p-8 bg-white">
          {selectedTransfer && (
            <>
              <h1 className="text-2xl font-bold mb-2">Transfer Report</h1>
              <h2 className="text-lg font-semibold text-gray-700 mb-6">
                Transaction ID: {selectedTransfer.id}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="font-medium">From:</p>
                  <p>{getSourceLocationName(selectedTransfer)}</p>
                </div>
                <div>
                  <p className="font-medium">To:</p>
                  <p>{getDestinationLocationName(selectedTransfer)}</p>
                </div>
                <div>
                  <p className="font-medium">Date:</p>
                  <p>{formatDate(selectedTransfer.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium">Status:</p>
                  <p>
                    {selectedTransfer.status.charAt(0).toUpperCase() +
                      selectedTransfer.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="font-medium">User:</p>
                  <p>{selectedTransfer.username}</p>
                </div>
                <div>
                  <p className="font-medium">Completed:</p>
                  <p>
                    {selectedTransfer.completedAt
                      ? formatDate(selectedTransfer.completedAt)
                      : "Pending"}
                  </p>
                </div>
              </div>

              <table className="w-full mb-8 border-collapse">
                <thead>
                  <tr className="border-t border-b border-gray-300">
                    <th className="py-2 px-4 text-left">Item Name</th>
                    <th className="py-2 px-4 text-left">Category</th>
                    <th className="py-2 px-4 text-right">Source Qty</th>
                    <th className="py-2 px-4 text-right">Transferred</th>
                    <th className="py-2 px-4 text-right">Destination Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransfer.items.map((item) => (
                    <tr
                      key={item.productId}
                      className="border-b border-gray-200"
                    >
                      <td className="py-2 px-4">{item.productName}</td>
                      <td className="py-2 px-4">{item.category}</td>
                      <td className="py-2 px-4 text-right">
                        {item.sourceQuantity}
                      </td>
                      <td className="py-2 px-4 text-right text-blue-600">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-4 text-right font-medium">
                        {item.destinationQuantity + item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-300">
                    <td className="py-2 px-4 font-bold" colSpan={2}>
                      Total
                    </td>
                    <td className="py-2 px-4 text-right font-bold">
                      {selectedTransfer.items.reduce(
                        (sum, item) => sum + item.sourceQuantity,
                        0
                      )}
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-blue-600">
                      {selectedTransfer.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}
                    </td>
                    <td className="py-2 px-4 text-right font-bold">
                      {selectedTransfer.items.reduce(
                        (sum, item) =>
                          sum + item.destinationQuantity + item.quantity,
                        0
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {selectedTransfer.note && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Notes:</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedTransfer.note}
                  </p>
                </div>
              )}

              <div className="mt-8 text-center text-gray-500 text-sm">
                <p>
                  This document was generated from the Inventory Management
                  System
                </p>
                <p>{new Date().toLocaleString()}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferRecords;
