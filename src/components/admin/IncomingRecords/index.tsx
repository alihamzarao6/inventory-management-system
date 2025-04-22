"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Calendar,
  Filter,
  Truck,
  X,
  Eye,
  Download,
  Printer,
  ChevronDown,
  ChevronRight,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import LocationFilter from "@/components/products/LocationFilters";
import { useRouter } from "next/navigation";
import { MOCK_LOCATIONS } from "@/constants/mockLocations";
import { MOCK_SUPPLIERS } from "@/constants/mockSupplier";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";

// Enhanced mock data for incoming items
const generateMockIncomingItems = () => {
  const incomingItems = [];

  // Generate 20 mock incoming records
  for (let i = 0; i < 20; i++) {
    const locationIndex = Math.floor(Math.random() * MOCK_LOCATIONS.length);
    const supplierIndex = Math.floor(Math.random() * MOCK_SUPPLIERS.length);
    const totalItems = Math.floor(Math.random() * 6) + 2; // 2-7 items per record

    const location = MOCK_LOCATIONS[locationIndex];
    const supplier = MOCK_SUPPLIERS[supplierIndex];

    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days

    // Generate random items for each record
    const mockItems = [];
    let totalQuantity = 0;

    for (let j = 0; j < totalItems; j++) {
      const randomProductIndex = Math.floor(
        Math.random() * MOCK_PRODUCTS.length
      );
      const product = MOCK_PRODUCTS[randomProductIndex];
      const quantity = Math.floor(Math.random() * 20) + 1;
      totalQuantity += quantity;

      mockItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        category: product.category,
        quantity: quantity,
        previousQuantity: Math.floor(Math.random() * 50),
        newQuantity: Math.floor(Math.random() * 50) + quantity,
      });
    }

    incomingItems.push({
      id: `IN-${1000 + i}`,
      locationId: location.id,
      locationName: location.name,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: mockItems,
      totalItems: totalItems,
      totalQuantity: totalQuantity,
      createdAt: createdDate.toISOString(),
      completedAt: new Date(
        createdDate.getTime() + Math.random() * 86400000
      ).toISOString(), // 0-24 hours later
      status: "completed",
      username: `User${Math.floor(Math.random() * 10) + 1}`,
      note:
        Math.random() > 0.7
          ? "This was a scheduled delivery from our regular supplier."
          : undefined,
    });
  }

  return incomingItems.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

const IncomingRecords = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [incomingItems, setIncomingItems] = useState<any[]>([]);
  const [filteredIncomingItems, setFilteredIncomingItems] = useState<any[]>([]);

  // Filter states
  const [usernameFilter, setUsernameFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("items");

  // Initialize incoming items
  useEffect(() => {
    // In a real app, this would be an API call
    const mockIncomingItems = generateMockIncomingItems();
    setIncomingItems(mockIncomingItems);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...incomingItems];

    // Apply search filter (on location name and supplier name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.locationName.toLowerCase().includes(term) ||
          item.supplierName.toLowerCase().includes(term) ||
          item.id.toLowerCase().includes(term)
      );
    }

    // Apply username filter
    if (usernameFilter) {
      filtered = filtered.filter((item) => item.username === usernameFilter);
    }

    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter((item) => item.locationId === locationFilter);
    }

    // Apply date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= fromDate;
      });
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate <= toDate;
      });
    }

    setFilteredIncomingItems(filtered);
  }, [incomingItems, searchTerm, usernameFilter, locationFilter, dateRange]);

  // Get unique usernames for filter
  const uniqueUsernames = [
    ...new Set(incomingItems.map((item) => item.username)),
  ];

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

  // View incoming item details
  const viewItemDetails = (item: any) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  // Handle location selection from the LocationFilter component
  // Changed to accept an array of locationIds as expected by the component
  const handleLocationSelect = (
    locationIds: string[],
    isCustomer?: boolean
  ) => {
    // Just use the first selected location ID since we want single-location filtering
    if (locationIds.length > 0) {
      setLocationFilter(locationIds[0]);
    } else {
      setLocationFilter("");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setUsernameFilter("");
    setLocationFilter("");
    setDateRange({ from: undefined, to: undefined });
  };

  // Calculate total quantities for a selected item
  const calculateItemTotals = (items: any[]) => {
    return items.reduce(
      (acc, item) => {
        acc.previousTotal += item.previousQuantity;
        acc.newTotal += item.newQuantity;
        acc.addedTotal += item.quantity;
        return acc;
      },
      { previousTotal: 0, newTotal: 0, addedTotal: 0 }
    );
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

  return (
    <div className="max-w-[1200px] mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Incoming Items Records
        </h1>
        <p className="text-gray-500 mt-1">
          View and manage history of items received at your locations
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="search"
            placeholder="Search by location, supplier, or ID..."
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
                <Button
                  size="sm"
                  onClick={() => setIsCalendarOpen(false)}
                  className="text-xs"
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="md:col-span-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between h-12 border-gray-300",
                  locationFilter
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white"
                )}
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm truncate">
                    {locationFilter
                      ? MOCK_LOCATIONS.find((loc) => loc.id === locationFilter)
                          ?.name || "Selected Location"
                      : "Filter by location"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <LocationFilter
                selectedLocationIds={locationFilter ? [locationFilter] : []}
                onLocationSelect={handleLocationSelect}
                placeholder="Select location"
                showCustomers={false}
                allowMultipleSelection={true}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="md:col-span-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 bg-white border-gray-300"
              >
                <Filter className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="!bg-white">
              <div className="px-3 py-2 text-sm font-semibold text-gray-700">
                Filter by User
              </div>
              {uniqueUsernames.map((username) => (
                <DropdownMenuItem
                  key={username}
                  className={cn(
                    usernameFilter === username && "bg-blue-50 text-blue-700"
                  )}
                  onClick={() =>
                    setUsernameFilter(
                      usernameFilter === username ? "" : username
                    )
                  }
                >
                  {username} {usernameFilter === username && " ✓"}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="border-t mt-1 text-red-500"
                onClick={clearFilters}
              >
                Clear all filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Applied Filters */}
      {(usernameFilter || locationFilter || dateRange.from || dateRange.to) && (
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

          {locationFilter && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              Location:{" "}
              {MOCK_LOCATIONS.find((l) => l.id === locationFilter)?.name ||
                locationFilter}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setLocationFilter("")}
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

      {/* Incoming Items Records List */}
      <Card className="overflow-hidden shadow-sm">
        {filteredIncomingItems.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredIncomingItems.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => viewItemDetails(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                      <Truck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item.id} - {item.supplierName}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1 flex items-center flex-wrap gap-2">
                        <span>
                          <span className="font-medium">Location:</span>{" "}
                          {item.locationName}
                        </span>
                        <span className="inline-block h-1 w-1 rounded-full bg-gray-300 mx-1"></span>
                        <span>
                          <span className="font-medium">Date:</span>{" "}
                          {formatDate(item.createdAt)}
                        </span>
                        <span className="inline-block h-1 w-1 rounded-full bg-gray-300 mx-1"></span>
                        <span>
                          <span className="font-medium">Items:</span>{" "}
                          {item.totalItems} ({item.totalQuantity} units)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Completed
                    </Badge>
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
            locationFilter ||
            dateRange.from ||
            dateRange.to
              ? "No incoming items found matching your filters"
              : "No incoming items records available"}
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl">
                    {selectedItem.id} - Incoming Shipment
                  </DialogTitle>
                  {/* <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div> */}
                </div>
                <DialogDescription>
                  View complete details of the incoming items transaction
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Transaction Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Location:</div>
                      <div className="font-medium">
                        {selectedItem.locationName}
                      </div>

                      <div className="text-gray-500">Supplier:</div>
                      <div className="font-medium">
                        {selectedItem.supplierName}
                      </div>

                      <div className="text-gray-500">Date Created:</div>
                      <div className="font-medium">
                        {formatDate(selectedItem.createdAt)}
                      </div>

                      <div className="text-gray-500">Time:</div>
                      <div className="font-medium">
                        {formatTime(selectedItem.createdAt)}
                      </div>

                      <div className="text-gray-500">Completed:</div>
                      <div className="font-medium">
                        {formatDate(selectedItem.completedAt)}
                      </div>

                      <div className="text-gray-500">Processed by:</div>
                      <div className="font-medium">{selectedItem.username}</div>
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
                      <div>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Completed
                        </Badge>
                      </div>

                      <div className="text-gray-500">Total Items:</div>
                      <div className="font-medium">
                        {selectedItem.totalItems} different products
                      </div>

                      <div className="text-gray-500">Total Quantity:</div>
                      <div className="font-medium">
                        {selectedItem.totalQuantity} units
                      </div>

                      <div className="text-gray-500">Items Added:</div>
                      <div className="font-medium text-green-600">
                        +{selectedItem.totalQuantity}
                      </div>
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
                            Previous Qty
                          </th>
                          <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Added
                          </th>
                          <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            New Qty
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedItem.items.map((item: any) => (
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
                              {item.previousQuantity}
                            </td>
                            <td className="p-3 font-medium text-green-600">
                              +{item.quantity}
                            </td>
                            <td className="p-3 font-medium text-gray-900">
                              {item.newQuantity}
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
                            {
                              calculateItemTotals(selectedItem.items)
                                .previousTotal
                            }
                          </td>
                          <td className="p-3 font-medium text-green-600">
                            +
                            {calculateItemTotals(selectedItem.items).addedTotal}
                          </td>
                          <td className="p-3 font-medium text-gray-900">
                            {calculateItemTotals(selectedItem.items).newTotal}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="p-0">
                  <div className="border rounded-lg p-4 min-h-[200px] bg-gray-50">
                    {selectedItem.note ? (
                      <div className="whitespace-pre-line">
                        {selectedItem.note}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No notes available for this transaction.
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
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncomingRecords;
