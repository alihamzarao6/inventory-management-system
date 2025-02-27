import React, { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown, ArrowLeft } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  PRODUCT_CATEGORIES,
  STOCK_STATUS,
  DATE_RANGE_OPTIONS,
} from "@/constants/mockProducts";
import { ProductFiltersT } from "@/types/products";
import LocationFilters from "./LocationFilters";
import { cn } from "@/utils";

interface ProductFiltersProps {
  filters: ProductFiltersT;
  onFilterChange: (filters: ProductFiltersT) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [isGeneralFilterOpen, setIsGeneralFilterOpen] = useState(false);
  const [isLocationFilterOpen, setIsLocationFilterOpen] = useState(false);
  const [generalFilterView, setGeneralFilterView] = useState<
    "main" | "category" | "dateRange"
  >("main");
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (filters.search || "")) {
        onFilterChange({ ...filters, search: searchValue });
      }
    }, 300); // 300ms debounce time

    return () => clearTimeout(timer);
  }, [searchValue, filters, onFilterChange]);

  // Handler for category change
  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category });
    setIsGeneralFilterOpen(false);
    setGeneralFilterView("main");
  };

  // Handler for stock status change
  const handleStockStatusChange = (
    stockStatus: "In Stock" | "Out of Stock"
  ) => {
    onFilterChange({ ...filters, stockStatus });
    setIsGeneralFilterOpen(false);
  };

  // Handler for date range selection
  const handleDateRangeChange = useCallback(() => {
    if (selectedDateRange.from && selectedDateRange.to) {
      onFilterChange({
        ...filters,
        dateRange: {
          type: "custom",
          startDate: selectedDateRange.from,
          endDate: selectedDateRange.to,
        },
      });
      setIsGeneralFilterOpen(false);
      setGeneralFilterView("main");
    }
  }, [selectedDateRange, filters, onFilterChange]);

  // Handle predefined date ranges
  const handlePredefinedDateRange = (rangeType: string) => {
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    switch (rangeType) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "yesterday":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "last7days":
        endDate = new Date(now);
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last30days":
        endDate = new Date(now);
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
    }

    if (startDate && endDate) {
      onFilterChange({
        ...filters,
        dateRange: {
          type: rangeType as any,
          startDate,
          endDate,
        },
      });
      setIsGeneralFilterOpen(false);
      setGeneralFilterView("main");
    }
  };

  // Effect for date range selection
  useEffect(() => {
    if (selectedDateRange.from && selectedDateRange.to) {
      handleDateRangeChange();
    }
  }, [selectedDateRange, handleDateRangeChange]);

  // Clear all filters
  const clearFilters = () => {
    onFilterChange({});
    setSearchValue("");
    setIsGeneralFilterOpen(false);
    setGeneralFilterView("main");
  };

  // Handle location selection
  const handleLocationSelect = (locationId: string, isCustomer?: boolean) => {
    onFilterChange({
      ...filters,
      locationId: locationId,
      isCustomer: isCustomer || false,
    });
    setIsLocationFilterOpen(false);
  };

  // Get active filter label
  const getGeneralFilterLabel = () => {
    if (filters.category) return filters.category;
    if (filters.stockStatus) return filters.stockStatus;
    if (filters.dateRange?.type) {
      const dateOption = DATE_RANGE_OPTIONS.find(
        (opt) => opt.id === filters.dateRange?.type
      );
      return dateOption?.label || "Date Range";
    }
    return "Filter";
  };

  // Get location filter label
  const getLocationFilterLabel = () => {
    if (filters.locationId) {
      // Logic to get location name based on ID
      return "Selected Location";
    }
    return "Filter by location";
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Box */}
      <div className="flex-1">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-10 h-12 bg-white"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      </div>

      {/* General Filter Dropdown */}
      <div>
        <Popover
          open={isGeneralFilterOpen}
          onOpenChange={(open) => {
            setIsGeneralFilterOpen(open);
            if (!open) setGeneralFilterView("main");
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-12 px-4 border-gray-200 bg-white flex items-center justify-between min-w-[140px]",
                Object.keys(filters).some(
                  (key) =>
                    key === "category" ||
                    key === "stockStatus" ||
                    key === "dateRange"
                ) && "bg-blue-50 text-blue-600 border-blue-200"
              )}
            >
              <span>{getGeneralFilterLabel()}</span>
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-0 max-h-[400px] overflow-hidden"
            align="end"
            onInteractOutside={(e) => {
              // Don't close when clicking on calendar
              if ((e.target as HTMLElement).closest(".react-calendar")) {
                e.preventDefault();
              }
            }}
          >
            {generalFilterView === "main" && (
              <div className="p-4">
                {/* Main Filter Options */}
                <div className="space-y-2">
                  <div
                    onClick={() => setGeneralFilterView("category")}
                    className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-md"
                  >
                    <span>Category</span>
                    <ChevronDown className="h-4 w-4 opacity-50 -rotate-90" />
                  </div>
                  <div
                    onClick={() => handleStockStatusChange("In Stock")}
                    className={cn(
                      "flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md",
                      filters.stockStatus === "In Stock" && "bg-blue-50"
                    )}
                  >
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        filters.stockStatus === "In Stock"
                          ? "bg-blue-500"
                          : "bg-gray-200"
                      }`}
                    />
                    <span>In Stock</span>
                  </div>
                  <div
                    onClick={() => handleStockStatusChange("Out of Stock")}
                    className={cn(
                      "flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md",
                      filters.stockStatus === "Out of Stock" && "bg-blue-50"
                    )}
                  >
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        filters.stockStatus === "Out of Stock"
                          ? "bg-blue-500"
                          : "bg-gray-200"
                      }`}
                    />
                    <span>Out of Stock</span>
                  </div>
                  <div
                    onClick={() => setGeneralFilterView("dateRange")}
                    className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-md"
                  >
                    <span>Date Range</span>
                    <ChevronDown className="h-4 w-4 opacity-50 -rotate-90" />
                  </div>
                </div>

                {Object.keys(filters).some(
                  (key) =>
                    key === "category" ||
                    key === "stockStatus" ||
                    key === "dateRange"
                ) && (
                  <>
                    <Separator className="my-4" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={clearFilters}
                    >
                      Clear All Filters
                    </Button>
                  </>
                )}
              </div>
            )}

            {generalFilterView === "category" && (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGeneralFilterView("main")}
                    className="p-0"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <h3 className="font-medium text-sm ml-2">Category</h3>
                </div>

                <ScrollArea className="max-h-[230px] overflow-y-auto pr-4">
                  <div className="space-y-2">
                    {PRODUCT_CATEGORIES.map((category) => (
                      <div
                        key={category}
                        className={cn(
                          "flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md",
                          filters.category === category && "bg-blue-50"
                        )}
                        onClick={() => handleCategoryChange(category)}
                      >
                        <div
                          className={`h-2 w-2 rounded-full mr-2 ${
                            filters.category === category
                              ? "bg-blue-500"
                              : "bg-gray-200"
                          }`}
                        />
                        <span>{category}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {generalFilterView === "dateRange" && (
              <div className="p-4 max-h-[350px] overflow-y-auto">
                <div className="flex items-center mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGeneralFilterView("main")}
                    className="p-0"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <h3 className="font-medium text-sm ml-2">Date Range</h3>
                </div>

                <div className="space-y-2 mb-4">
                  {DATE_RANGE_OPTIONS.filter((opt) => opt.id !== "custom").map(
                    (option) => (
                      <div
                        key={option.id}
                        className={cn(
                          "flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md",
                          filters.dateRange?.type === option.id && "bg-blue-50"
                        )}
                        onClick={() => handlePredefinedDateRange(option.id)}
                      >
                        <div
                          className={`h-2 w-2 rounded-full mr-2 ${
                            filters.dateRange?.type === option.id
                              ? "bg-blue-500"
                              : "bg-gray-200"
                          }`}
                        />
                        <span>{option.label}</span>
                      </div>
                    )
                  )}
                </div>

                <Separator className="my-2" />
                <h4 className="text-sm font-medium my-2">Custom Range</h4>
                <div className="border rounded-md p-3 bg-gray-50">
                  <Calendar
                    mode="range"
                    selected={
                      selectedDateRange.from && selectedDateRange.to
                        ? {
                            from: selectedDateRange.from,
                            to: selectedDateRange.to,
                          }
                        : undefined
                    }
                    onSelect={setSelectedDateRange as any}
                    className="rounded-md border"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="sm"
                      disabled={
                        !selectedDateRange.from || !selectedDateRange.to
                      }
                      onClick={handleDateRangeChange}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Location Filter Dropdown */}
      <div>
        <Popover
          open={isLocationFilterOpen}
          onOpenChange={setIsLocationFilterOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-12 px-4 border-gray-200 bg-white flex items-center justify-between min-w-[180px]",
                filters.locationId && "bg-blue-50 text-blue-600 border-blue-200"
              )}
            >
              <span>{getLocationFilterLabel()}</span>
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-0 max-h-[400px] overflow-hidden"
            align="end"
          >
            <LocationFilters
              selectedLocationId={filters.locationId}
              onLocationSelect={handleLocationSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ProductFilters;
