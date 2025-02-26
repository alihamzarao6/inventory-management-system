import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  PRODUCT_CATEGORIES,
  STOCK_STATUS,
  DATE_RANGE_OPTIONS,
} from "@/constants/mockProducts";
import { ProductFiltersT } from "@/types/products";

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

  // Handler for search input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchValue });
  };

  // Handler for category change
  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category });
    setIsGeneralFilterOpen(false);
  };

  // Handler for stock status change
  const handleStockStatusChange = (
    stockStatus: "In Stock" | "Out of Stock"
  ) => {
    onFilterChange({ ...filters, stockStatus });
    setIsGeneralFilterOpen(false);
  };

  // Handler for date range change
  const handleDateRangeChange = (dateType: string) => {
    onFilterChange({
      ...filters,
      dateRange: {
        type: dateType as any,
        startDate: undefined,
        endDate: undefined,
      },
    });
    setIsGeneralFilterOpen(false);
  };

  // Clear all filters
  const clearFilters = () => {
    onFilterChange({});
    setSearchValue("");
    setIsGeneralFilterOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Box */}
      <div className="flex-1">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-10 h-12 bg-white"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </form>
      </div>

      {/* General Filter Dropdown */}
      <div>
        <Popover
          open={isGeneralFilterOpen}
          onOpenChange={setIsGeneralFilterOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-12 px-4 border-gray-200 bg-white flex items-center justify-between min-w-[140px]"
            >
              <span>Filter</span>
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="grid gap-4 p-6">
              <div>
                <h3 className="font-medium text-sm mb-3">Category</h3>
                <div className="space-y-2">
                  {PRODUCT_CATEGORIES.map((category) => (
                    <div
                      key={category}
                      className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md"
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
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm mb-3">Stock Status</h3>
                <RadioGroup
                  value={filters.stockStatus}
                  onValueChange={(value) =>
                    handleStockStatusChange(value as any)
                  }
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="In Stock" id="in-stock" />
                    <Label htmlFor="in-stock">In Stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Out of Stock" id="out-of-stock" />
                    <Label htmlFor="out-of-stock">Out of Stock</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm mb-3">Date Range</h3>
                <div className="space-y-2">
                  {DATE_RANGE_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md"
                      onClick={() => handleDateRangeChange(option.id)}
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
                  ))}
                </div>
              </div>

              {Object.keys(filters).length > 0 && (
                <>
                  <Separator />
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
          </PopoverContent>
        </Popover>
      </div>

      {/* Location Filter Dropdown - This will be implemented in a separate component */}
      <div>
        <Popover
          open={isLocationFilterOpen}
          onOpenChange={setIsLocationFilterOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-12 px-4 border-gray-200 bg-white flex items-center justify-between min-w-[180px]"
            >
              <span>Filter by location</span>
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-2">
              {/* This will be populated by the LocationFilters component */}
              <div className="p-4 text-center text-sm text-gray-500">
                Location filter component will be here
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ProductFilters;
