import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ArrowLeft,
  Download,
  Upload,
  X,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  onExportCSV?: () => void;
  onImportCSV?: (file: File) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onExportCSV,
  onImportCSV,
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
  }>({
    from: filters.dateRange?.startDate,
    to: filters.dateRange?.endDate,
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.categories || []
  );
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(
    filters.locationIds || []
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize date range when filters change externally
  useEffect(() => {
    setSelectedDateRange({
      from: filters.dateRange?.startDate,
      to: filters.dateRange?.endDate,
    });
  }, [filters.dateRange]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (filters.search || "")) {
        onFilterChange({ ...filters, search: searchValue });
      }
    }, 300); // 300ms debounce time

    return () => clearTimeout(timer);
  }, [searchValue, filters, onFilterChange]);

  // Handler for category change - multiple selection
  const handleCategoryToggle = (category: string) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updatedCategories);
    onFilterChange({ ...filters, categories: updatedCategories });
  };

  // Apply selected categories
  const applyCategories = () => {
    onFilterChange({ ...filters, categories: selectedCategories });
    setIsGeneralFilterOpen(false);
    setGeneralFilterView("main");
  };

  // Handler for stock status change with toggle
  const handleStockStatusToggle = (
    stockStatus: "In Stock" | "Out of Stock"
  ) => {
    // If same status is already selected, clear it
    if (filters.stockStatus === stockStatus) {
      onFilterChange({ ...filters, stockStatus: undefined });
    } else {
      // Otherwise apply the new status
      onFilterChange({ ...filters, stockStatus: stockStatus });
    }
  };

  // Handler for date range selection from custom calendar
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

  // Handle predefined date ranges with toggle functionality
  const handlePredefinedDateRange = (rangeType: string) => {
    // If this range is already selected, clear it
    if (filters.dateRange?.type === rangeType) {
      onFilterChange({
        ...filters,
        dateRange: undefined,
      });
      setSelectedDateRange({});
      return;
    }

    // Otherwise, set the new date range
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    switch (rangeType) {
      case "today":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
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
      // Update both state and filters
      setSelectedDateRange({ from: startDate, to: endDate });

      onFilterChange({
        ...filters,
        dateRange: {
          type: rangeType as any,
          startDate,
          endDate,
        },
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    onFilterChange({});
    setSearchValue("");
    setSelectedCategories([]);
    setSelectedLocationIds([]);
    setSelectedDateRange({});
    setIsGeneralFilterOpen(false);
    setGeneralFilterView("main");
  };

  // Handle location selections
  const handleLocationSelect = (
    locationIds: string[],
    isCustomer?: boolean
  ) => {
    setSelectedLocationIds(locationIds);
    onFilterChange({
      ...filters,
      locationIds: locationIds,
      isCustomer: (locationIds.length > 0 && isCustomer) || false,
    });
  };

  // Handle file import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onImportCSV) {
      onImportCSV(e.target.files[0]);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Get active filter label
  const getGeneralFilterLabel = () => {
    if (selectedCategories.length > 0) {
      return selectedCategories.length === 1
        ? selectedCategories[0]
        : `${selectedCategories.length} Categories`;
    }
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
    if (selectedLocationIds.length > 0) {
      return selectedLocationIds.length === 1
        ? "1 Location"
        : `${selectedLocationIds.length} Locations`;
    }
    return "Filter by location";
  };

  // Remove a category from selection
  const removeCategory = (category: string) => {
    const newCategories = selectedCategories.filter((c) => c !== category);
    setSelectedCategories(newCategories);
    onFilterChange({ ...filters, categories: newCategories });
  };

  // Handle calendar date selection directly
  const handleCalendarSelect = (range: { from?: Date; to?: Date } | undefined) => {
      if (range) {
        setSelectedDateRange(range);
      }
    };

  // Handle clear custom date range - UPDATED
  const clearCustomDateRange = () => {
    setSelectedDateRange({});
    // Also clear the dateRange from filters
    onFilterChange({
      ...filters,
      dateRange: undefined,
    });
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
                (selectedCategories.length > 0 ||
                  filters.stockStatus ||
                  filters.dateRange) &&
                  "bg-blue-50 text-blue-600 border-blue-200"
              )}
            >
              <span>{getGeneralFilterLabel()}</span>
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-0 max-h-[600px] overflow-y-auto" // Increased height
            align="end"
          >
            {/* Selected Categories Display */}
            {selectedCategories.length > 0 && generalFilterView === "main" && (
              <div className="px-4 pt-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedCategories.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      {category}
                      <button
                        className="ml-1 rounded-full hover:bg-blue-200"
                        onClick={() => removeCategory(category)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Separator className="my-2" />
              </div>
            )}

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
                    onClick={() => handleStockStatusToggle("In Stock")}
                    className={cn(
                      "flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md",
                      filters.stockStatus === "In Stock" && "bg-blue-50"
                    )}
                  >
                    <Checkbox
                      checked={filters.stockStatus === "In Stock"}
                      onCheckedChange={() =>
                        handleStockStatusToggle("In Stock")
                      }
                      className="mr-2 rounded"
                    />
                    <span>In Stock</span>
                  </div>
                  <div
                    onClick={() => handleStockStatusToggle("Out of Stock")}
                    className={cn(
                      "flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md",
                      filters.stockStatus === "Out of Stock" && "bg-blue-50"
                    )}
                  >
                    <Checkbox
                      checked={filters.stockStatus === "Out of Stock"}
                      onCheckedChange={() =>
                        handleStockStatusToggle("Out of Stock")
                      }
                      className="mr-2 rounded"
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

                {(selectedCategories.length > 0 ||
                  filters.stockStatus ||
                  filters.dateRange) && (
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
                <div className="flex items-center mb-4 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGeneralFilterView("main")}
                    className="py-1 px-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <h3 className="font-medium text-sm">Category</h3>
                </div>

                <ScrollArea className="max-h-[230px] overflow-y-auto pr-4">
                  <div className="space-y-2">
                    {PRODUCT_CATEGORIES.map((category) => (
                      <div
                        key={category}
                        className={cn(
                          "flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md",
                          selectedCategories.includes(category) && "bg-blue-50"
                        )}
                        onClick={() => handleCategoryToggle(category)}
                      >
                        <Checkbox
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                          className="mr-2 rounded"
                        />
                        <span>{category}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="mt-4 pt-3 border-t flex justify-end">
                  <Button
                    size="sm"
                    onClick={applyCategories}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}

            {generalFilterView === "dateRange" && (
              <div className="p-4 min-h-[520px] overflow-y-auto">
                <div className="flex items-center mb-4 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGeneralFilterView("main")}
                    className="py-1 px-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <h3 className="font-medium text-sm">Date Range</h3>
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
                        <Checkbox
                          checked={filters.dateRange?.type === option.id}
                          onCheckedChange={() =>
                            handlePredefinedDateRange(option.id)
                          }
                          className="mr-2 rounded"
                        />
                        <span>{option.label}</span>
                      </div>
                    )
                  )}
                </div>

                <Separator className="my-2" />
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Custom Range</h4>
                  {(selectedDateRange.from || selectedDateRange.to) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                      onClick={clearCustomDateRange}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="border rounded-md p-3 bg-white">
                  <Calendar
                    mode="range"
                    selected={
                      selectedDateRange.from || selectedDateRange.to
                        ? {
                            from: selectedDateRange.from,
                            to: selectedDateRange.to,
                          }
                        : undefined
                    }
                    onSelect={handleCalendarSelect}
                    className="p-0"
                  />
                  <div className="mt-4 flex justify-end sticky bottom-0 bg-white py-2">
                    <Button
                      size="sm"
                      disabled={
                        !selectedDateRange.from && !selectedDateRange.to
                      }
                      onClick={handleDateRangeChange}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Apply Date Range
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
                selectedLocationIds.length > 0 &&
                  "bg-blue-50 text-blue-600 border-blue-200"
              )}
            >
              <span>{getLocationFilterLabel()}</span>
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-0 max-h-[600px] overflow-y-auto" // Increased height
            align="end"
          >
            <LocationFilters
              selectedLocationIds={selectedLocationIds}
              onLocationSelect={handleLocationSelect}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Import/Export Buttons */}
      <div className="flex gap-2">
        {onExportCSV && (
          <Button
            variant="outline"
            className="h-12 px-4 border-gray-200 bg-white"
            onClick={onExportCSV}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}

        {onImportCSV && (
          <>
            <Button
              variant="outline"
              className="h-12 px-4 border-gray-200 bg-white"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              className="hidden"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
