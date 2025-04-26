"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Calendar,
  Filter,
  Receipt,
  X,
  Eye,
  Download,
  Printer,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  FileText,
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
import LocationFilter from "@/components/products/LocationFilters";
import { useRouter } from "next/navigation";
import { MOCK_LOCATIONS } from "@/constants/mockLocations";
import { MOCK_CUSTOMERS } from "@/constants/mockCustomers";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";

// Define invoice types
type InvoiceType = "Sale" | "Purchase" | "Return";
type InvoiceStatus = "Paid" | "Unpaid" | "Partial" | "Cancelled";

// Define invoice item interface
interface InvoiceItem {
  productId: string;
  productName: string;
  productImage: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
  tax?: number;
  discount?: number;
}

// Define invoice interface
interface Invoice {
  id: string;
  entityId: string; // Location or customer ID
  entityName: string; // Location or customer name
  entityType: "Location" | "Customer";
  type: InvoiceType;
  items: InvoiceItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
  dueDate?: string;
  paidAmount: number;
  status: InvoiceStatus;
  username: string;
  note?: string;
}

// Generate mock invoices data
const generateMockInvoices = (): Invoice[] => {
  const invoices: Invoice[] = [];
  const invoiceTypes: InvoiceType[] = ["Sale", "Purchase", "Return"];
  const invoiceStatuses: InvoiceStatus[] = [
    "Paid",
    "Unpaid",
    "Partial",
    "Cancelled",
  ];

  // Generate 50 mock invoices
  for (let i = 0; i < 50; i++) {
    // Randomly choose between location and customer
    const isCustomer = Math.random() > 0.5;

    let entityId: string;
    let entityName: string;

    if (isCustomer) {
      const customerIndex = Math.floor(Math.random() * MOCK_CUSTOMERS.length);
      entityId = MOCK_CUSTOMERS[customerIndex].id;
      entityName = MOCK_CUSTOMERS[customerIndex].name;
    } else {
      const locationIndex = Math.floor(Math.random() * MOCK_LOCATIONS.length);
      entityId = MOCK_LOCATIONS[locationIndex].id;
      entityName = MOCK_LOCATIONS[locationIndex].name;
    }

    const type = invoiceTypes[Math.floor(Math.random() * invoiceTypes.length)];
    const itemsCount = Math.floor(Math.random() * 5) + 1; // 1-5 items
    const items: InvoiceItem[] = [];
    let subtotal = 0;

    // Generate random items
    for (let j = 0; j < itemsCount; j++) {
      const productIndex = Math.floor(Math.random() * MOCK_PRODUCTS.length);
      const product = MOCK_PRODUCTS[productIndex];
      const quantity = Math.floor(Math.random() * 10) + 1;
      const unitPrice = parseFloat(product.retailPrice.toFixed(2));
      const discount =
        Math.random() > 0.7 ? parseFloat((unitPrice * 0.1).toFixed(2)) : 0;
      const itemTotal = parseFloat(
        (quantity * unitPrice - quantity * discount).toFixed(2)
      );

      subtotal += itemTotal;

      items.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        category: product.category,
        quantity,
        unitPrice,
        total: itemTotal,
        discount: discount > 0 ? discount : undefined,
      });
    }

    const tax = parseFloat((subtotal * 0.16).toFixed(2)); // 16% tax
    const discount =
      Math.random() > 0.7 ? parseFloat((subtotal * 0.05).toFixed(2)) : 0; // 5% discount sometimes
    const total = parseFloat((subtotal + tax - discount).toFixed(2));

    const status =
      invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];
    const paidAmount =
      status === "Paid"
        ? total
        : status === "Partial"
        ? parseFloat((total * (0.3 + Math.random() * 0.4)).toFixed(2))
        : 0;

    // Generate random dates within the last 90 days
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90));

    // Due date is 30 days after created date
    const dueDate = new Date(createdDate);
    dueDate.setDate(dueDate.getDate() + 30);

    // Generate invoice ID with prefix based on type
    let prefix = "INV";
    if (type === "Sale") prefix = "S";
    else if (type === "Purchase") prefix = "P";
    else if (type === "Return") prefix = "R";

    const invoiceId = `${prefix}-${isCustomer ? "C" : "L"}-${String(
      i + 1001
    ).padStart(4, "0")}`;

    invoices.push({
      id: invoiceId,
      entityId,
      entityName,
      entityType: isCustomer ? "Customer" : "Location",
      type,
      items,
      totalItems: itemsCount,
      subtotal,
      tax,
      discount,
      total,
      createdAt: createdDate.toISOString(),
      dueDate: dueDate.toISOString(),
      paidAmount,
      status,
      username: `User${Math.floor(Math.random() * 10) + 1}`,
      note:
        Math.random() > 0.7
          ? "This is a note for the invoice. It can contain additional information about the transaction."
          : undefined,
    });
  }

  // Sort by created date (newest first)
  return invoices.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

const InvoiceRecords = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedInvoices, setPaginatedInvoices] = useState<Invoice[]>([]);

  // Filter states
  const [usernameFilter, setUsernameFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [isLocationFilterOpen, setIsLocationFilterOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState("items");

  // Initialize invoices
  useEffect(() => {
    // In a real app, this would be an API call
    const mockInvoices = generateMockInvoices();
    setInvoices(mockInvoices);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...invoices];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.id.toLowerCase().includes(term) ||
          invoice.entityName.toLowerCase().includes(term)
      );
    }

    // Apply entity filter (location or customer)
    if (entityFilter.length > 0) {
      filtered = filtered.filter((invoice) =>
        entityFilter.includes(invoice.entityId)
      );
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter((invoice) => invoice.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    // Apply username filter
    if (usernameFilter) {
      filtered = filtered.filter(
        (invoice) => invoice.username === usernameFilter
      );
    }

    // Apply date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate >= fromDate;
      });
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate <= toDate;
      });
    }

    setFilteredInvoices(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    invoices,
    searchTerm,
    entityFilter,
    typeFilter,
    statusFilter,
    usernameFilter,
    dateRange,
    itemsPerPage,
  ]);

  // Apply pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedInvoices(filteredInvoices.slice(startIndex, endIndex));
  }, [filteredInvoices, currentPage, itemsPerPage]);

  // Get unique usernames for filter
  const uniqueUsernames = [
    ...new Set(invoices.map((invoice) => invoice.username)),
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // View invoice details
  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailModalOpen(true);
  };

  // Handle entity selection
  const handleEntitySelect = (entityIds: string[], isCustomer?: boolean) => {
    setEntityFilter(entityIds);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setEntityFilter([]);
    setTypeFilter("");
    setStatusFilter("");
    setUsernameFilter("");
    setDateRange({ from: undefined, to: undefined });
  };

  // Get entity filter label
  const getEntityFilterLabel = () => {
    if (entityFilter.length === 0) {
      return "Filter by entity";
    }

    if (entityFilter.length === 1) {
      const entityId = entityFilter[0];
      // Check if it's a customer
      const customer = MOCK_CUSTOMERS.find((c) => c.id === entityId);
      if (customer) return customer.name;

      // Check if it's a location
      const location = MOCK_LOCATIONS.find((l) => l.id === entityId);
      if (location) return location.name;

      return "Entity Selected";
    }

    return `${entityFilter.length} Entities`;
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

  // Render status badge
  const renderStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "Paid":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Paid
          </Badge>
        );
      case "Unpaid":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Unpaid
          </Badge>
        );
      case "Partial":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Partial
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Render invoice type badge
  const renderTypeBadge = (type: InvoiceType) => {
    switch (type) {
      case "Sale":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Sale
          </Badge>
        );
      case "Purchase":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Purchase
          </Badge>
        );
      case "Return":
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200"
          >
            Return
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoice Records</h1>
        <p className="text-gray-500 mt-1">
          View and manage all sales, purchases and return invoices
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="search"
            placeholder="Search by ID, entity name..."
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
                  entityFilter.length > 0
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white"
                )}
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm truncate">
                    {getEntityFilterLabel()}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <LocationFilter
                selectedLocationIds={entityFilter}
                onLocationSelect={handleEntitySelect}
                placeholder="Select entities"
                showCustomers={true}
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
                  typeFilter || statusFilter || usernameFilter
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
                  Invoice Type
                </div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm",
                      typeFilter === "" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => setTypeFilter("")}
                  >
                    All Types
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm",
                      typeFilter === "Sale" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => setTypeFilter("Sale")}
                  >
                    Sale
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm",
                      typeFilter === "Purchase" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => setTypeFilter("Purchase")}
                  >
                    Purchase
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm",
                      typeFilter === "Return" && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => setTypeFilter("Return")}
                  >
                    Return
                  </Button>
                </div>

                <div className="mt-3 border-t pt-2">
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
                      All Statuses
                    </Button>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm",
                        statusFilter === "Paid" && "bg-blue-50 text-blue-700"
                      )}
                      onClick={() => setStatusFilter("Paid")}
                    >
                      Paid
                    </Button>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm",
                        statusFilter === "Unpaid" && "bg-blue-50 text-blue-700"
                      )}
                      onClick={() => setStatusFilter("Unpaid")}
                    >
                      Unpaid
                    </Button>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm",
                        statusFilter === "Partial" && "bg-blue-50 text-blue-700"
                      )}
                      onClick={() => setStatusFilter("Partial")}
                    >
                      Partially Paid
                    </Button>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm",
                        statusFilter === "Cancelled" &&
                          "bg-blue-50 text-blue-700"
                      )}
                      onClick={() => setStatusFilter("Cancelled")}
                    >
                      Cancelled
                    </Button>
                  </div>
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
        entityFilter.length > 0 ||
        typeFilter ||
        statusFilter ||
        dateRange.from ||
        dateRange.to) && (
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

          {entityFilter.length > 0 && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              Entities: {entityFilter.length} selected
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setEntityFilter([])}
              />
            </Badge>
          )}

          {typeFilter && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              Type: {typeFilter}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setTypeFilter("")}
              />
            </Badge>
          )}

          {statusFilter && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 hover:bg-blue-100"
            >
              Status: {statusFilter}
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

      {/* Status Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-green-700 text-sm">Paid</span>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1">
            <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-700 text-sm">Partial</span>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1">
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            <span className="text-red-700 text-sm">Unpaid</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1">
            <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
            <span className="text-gray-700 text-sm">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Invoice Records List */}
      <Card className="overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-200">
          {paginatedInvoices.length > 0 ? (
            paginatedInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => viewInvoiceDetails(invoice)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex-shrink-0 p-3 rounded-lg",
                        invoice.type === "Sale"
                          ? "bg-blue-100"
                          : invoice.type === "Purchase"
                          ? "bg-purple-100"
                          : "bg-orange-100"
                      )}
                    >
                      <Receipt
                        className={cn(
                          "h-6 w-6",
                          invoice.type === "Sale"
                            ? "text-blue-600"
                            : invoice.type === "Purchase"
                            ? "text-purple-600"
                            : "text-orange-600"
                        )}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {invoice.id} - {invoice.entityName}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1 flex items-center flex-wrap gap-2">
                        <span>
                          <span className="font-medium">Date:</span>{" "}
                          {formatDate(invoice.createdAt)}
                        </span>
                        <span className="inline-block h-1 w-1 rounded-full bg-gray-300 mx-1"></span>
                        <span>
                          <span className="font-medium">Items:</span>{" "}
                          {invoice.totalItems} items
                        </span>
                        <span className="inline-block h-1 w-1 rounded-full bg-gray-300 mx-1"></span>
                        <span>
                          <span className="font-medium">User:</span>{" "}
                          {invoice.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-lg font-medium">
                      {formatCurrency(invoice.total)}
                    </div>
                    <div className="flex items-center gap-2">
                      {renderTypeBadge(invoice.type)}
                      {renderStatusBadge(invoice.status)}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-10 text-gray-500">
              {searchTerm ||
              usernameFilter ||
              entityFilter.length > 0 ||
              typeFilter ||
              statusFilter ||
              dateRange.from ||
              dateRange.to
                ? "No invoices found matching your filters"
                : "No invoice records available"}
            </div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {filteredInvoices.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of{" "}
            {filteredInvoices.length} results
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

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl">
                    {selectedInvoice.id} - {selectedInvoice.type} Invoice
                  </DialogTitle>
                  {/* <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                    >
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
                  View complete details of the invoice
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Invoice Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Invoice Type:</div>
                      <div className="font-medium">{selectedInvoice.type}</div>

                      <div className="text-gray-500">
                        {selectedInvoice.entityType === "Customer"
                          ? "Customer:"
                          : "Location:"}
                      </div>
                      <div className="font-medium">
                        {selectedInvoice.entityName}
                      </div>

                      <div className="text-gray-500">Date Created:</div>
                      <div className="font-medium">
                        {formatDate(selectedInvoice.createdAt)}
                      </div>

                      {selectedInvoice.dueDate && (
                        <>
                          <div className="text-gray-500">Due Date:</div>
                          <div className="font-medium">
                            {formatDate(selectedInvoice.dueDate)}
                          </div>
                        </>
                      )}

                      <div className="text-gray-500">Created By:</div>
                      <div className="font-medium">
                        {selectedInvoice.username}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Payment Summary
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Status:</div>
                      <div>{renderStatusBadge(selectedInvoice.status)}</div>

                      <div className="text-gray-500">Subtotal:</div>
                      <div className="font-medium">
                        {formatCurrency(selectedInvoice.subtotal)}
                      </div>

                      <div className="text-gray-500">Tax (16%):</div>
                      <div className="font-medium">
                        {formatCurrency(selectedInvoice.tax)}
                      </div>

                      {selectedInvoice.discount > 0 && (
                        <>
                          <div className="text-gray-500">Discount:</div>
                          <div className="font-medium text-red-600">
                            -{formatCurrency(selectedInvoice.discount)}
                          </div>
                        </>
                      )}

                      <div className="text-gray-500 font-medium">Total:</div>
                      <div className="font-bold text-lg">
                        {formatCurrency(selectedInvoice.total)}
                      </div>

                      <div className="text-gray-500">Paid Amount:</div>
                      <div className="font-medium text-green-600">
                        {formatCurrency(selectedInvoice.paidAmount)}
                      </div>

                      {selectedInvoice.paidAmount < selectedInvoice.total &&
                        selectedInvoice.status !== "Cancelled" && (
                          <>
                            <div className="text-gray-500">Balance Due:</div>
                            <div className="font-medium text-red-600">
                              {formatCurrency(
                                selectedInvoice.total -
                                  selectedInvoice.paidAmount
                              )}
                            </div>
                          </>
                        )}
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
                          <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                            Quantity
                          </th>
                          <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                            Unit Price
                          </th>
                          {selectedInvoice.items.some(
                            (item) => item.discount
                          ) && (
                            <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                              Discount
                            </th>
                          )}
                          <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedInvoice.items.map((item) => (
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
                            <td className="p-3 text-gray-900 text-right">
                              {item.quantity}
                            </td>
                            <td className="p-3 text-gray-900 text-right">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            {selectedInvoice.items.some(
                              (item) => item.discount
                            ) && (
                              <td className="p-3 text-red-600 text-right">
                                {item.discount
                                  ? `-${formatCurrency(item.discount)}`
                                  : "-"}
                              </td>
                            )}
                            <td className="p-3 font-medium text-gray-900 text-right">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td
                            colSpan={
                              selectedInvoice.items.some(
                                (item) => item.discount
                              )
                                ? 4
                                : 3
                            }
                            className="p-3 font-bold text-gray-900 text-right"
                          >
                            Subtotal:
                          </td>
                          <td className="p-3 font-medium text-gray-900 text-right">
                            {formatCurrency(selectedInvoice.subtotal)}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={
                              selectedInvoice.items.some(
                                (item) => item.discount
                              )
                                ? 4
                                : 3
                            }
                            className="p-3 font-bold text-gray-900 text-right"
                          >
                            Tax (16%):
                          </td>
                          <td className="p-3 font-medium text-gray-900 text-right">
                            {formatCurrency(selectedInvoice.tax)}
                          </td>
                        </tr>
                        {selectedInvoice.discount > 0 && (
                          <tr>
                            <td
                              colSpan={
                                selectedInvoice.items.some(
                                  (item) => item.discount
                                )
                                  ? 4
                                  : 3
                              }
                              className="p-3 font-bold text-gray-900 text-right"
                            >
                              Discount:
                            </td>
                            <td className="p-3 font-medium text-red-600 text-right">
                              -{formatCurrency(selectedInvoice.discount)}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td
                            colSpan={
                              selectedInvoice.items.some(
                                (item) => item.discount
                              )
                                ? 4
                                : 3
                            }
                            className="p-3 font-bold text-gray-900 text-right"
                          >
                            Total:
                          </td>
                          <td className="p-3 font-bold text-gray-900 text-right">
                            {formatCurrency(selectedInvoice.total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="p-0">
                  <div className="border rounded-lg p-4 min-h-[200px] bg-gray-50">
                    {selectedInvoice.note ? (
                      <div className="whitespace-pre-line">
                        {selectedInvoice.note}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No notes available for this invoice.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDetailModalOpen(false)}
                  className="mr-2"
                >
                  Close
                </Button>
                {selectedInvoice.status === "Unpaid" ||
                selectedInvoice.status === "Partial" ? (
                  <Button className="bg-green-500 hover:bg-green-600 text-white">
                    Process Payment
                  </Button>
                ) : null}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceRecords;
