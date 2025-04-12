"use client";
import React, { useState, useEffect } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils";
import { Product } from "@/types/products";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { MOCK_CUSTOMERS } from "@/constants/mockCustomers";

interface AddProductsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationIds: string[]; // Changed from locationId to locationIds
  checkedItemIds: string[];
  onSelectionChanged: (productIds: string[]) => void;
  availableProducts: Product[];
}

const AddProductsModal: React.FC<AddProductsModalProps> = ({
  open,
  onOpenChange,
  locationIds,
  checkedItemIds,
  onSelectionChanged,
  availableProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Reset state when modal opens and set already selected items
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedProductIds([...checkedItemIds]);
      setIsLoading(true);

      // Small delay to show loading state
      setTimeout(() => {
        setDisplayedProducts(availableProducts);
        setIsLoading(false);
      }, 300);
    }
  }, [open, checkedItemIds, availableProducts]);

  // Filter products when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setDisplayedProducts(availableProducts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = availableProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );

    setDisplayedProducts(filtered);
  }, [searchQuery, availableProducts]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
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

  // Get item quantity across all selected locations
  const getItemQuantity = (product: Product): number => {
    let totalQuantity = 0;

    // Process each location ID
    locationIds.forEach((locationId) => {
      // Customer locations
      if (locationId.startsWith("cust-")) {
        // For customers, you might have special logic or just use a default value
        totalQuantity += 10; // Example default value
      }
      // Sub-locations
      else if (locationId.startsWith("sub-")) {
        const locationData = product.locations.find(
          (loc) => loc.locationId === locationId && loc.isSubLocation
        );
        if (locationData) {
          totalQuantity += locationData.quantity;
        }
      }
      // Main locations
      else {
        // Add quantity in the main location
        const mainLocationData = product.locations.find(
          (loc) => loc.locationId === locationId && !loc.isSubLocation
        );
        if (mainLocationData) {
          totalQuantity += mainLocationData.quantity;
        }

        // Add quantities from all sub-locations of this main location
        const subLocationIds = MOCK_SUB_LOCATIONS.filter(
          (sl) => sl.parentId === locationId
        ).map((sl) => sl.id);

        product.locations.forEach((loc) => {
          if (loc.isSubLocation && subLocationIds.includes(loc.locationId)) {
            totalQuantity += loc.quantity;
          }
        });
      }
    });

    return totalQuantity;
  };

  // Sort products
  const getSortedProducts = () => {
    return [...displayedProducts].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortColumn) {
        case "name":
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case "category":
          valueA = a.category.toLowerCase();
          valueB = b.category.toLowerCase();
          break;
        case "quantity":
          valueA = getItemQuantity(a);
          valueB = getItemQuantity(b);
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  // Handle continue button click
  const handleContinue = () => {
    onSelectionChanged(selectedProductIds);
  };

  const sortedProducts = getSortedProducts();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 bg-gray-100">
        <DialogHeader className="p-6 bg-white">
          <DialogTitle className="text-xl font-semibold">
            Select Products to Adjust
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="p-4 bg-white border-t border-b">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 h-10 bg-gray-50"
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        {/* Products Table */}
        <ScrollArea className="max-h-[60vh]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="pl-4 py-3 pr-2">Select</th>
                  <th className="px-4 py-3">Photo</th>
                  <th
                    className="px-6 py-3 cursor-pointer"
                    onClick={() => handleSortClick("name")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Item Name</span>
                      {renderSortIndicator("name")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 cursor-pointer"
                    onClick={() => handleSortClick("category")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      {renderSortIndicator("category")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 cursor-pointer"
                    onClick={() => handleSortClick("quantity")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Current Quantity</span>
                      {renderSortIndicator("quantity")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Loading products...
                    </td>
                  </tr>
                ) : sortedProducts.length > 0 ? (
                  sortedProducts.map((product, index) => {
                    const isSelected = selectedProductIds.includes(product.id);
                    const quantity = getItemQuantity(product);

                    return (
                      <tr
                        key={product.id}
                        className={cn(
                          "transition-colors border-t border-gray-100",
                          isSelected
                            ? "bg-blue-50"
                            : index % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50/30",
                          "hover:bg-gray-50"
                        )}
                      >
                        <td className="pl-4 py-3 pr-2">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                toggleProductSelection(product.id)
                              }
                              className="rounded w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Avatar className="h-10 w-10 rounded-md">
                            <AvatarImage
                              src={product.image}
                              alt={product.name}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {product.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td
                          className="px-6 py-3 cursor-pointer"
                          onClick={() => toggleProductSelection(product.id)}
                        >
                          <div className="text-gray-900 font-medium">
                            {product.name}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-3 text-gray-900">{quantity}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "No products found matching your search"
                        : "No products available in these locations"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 bg-white border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Selected: {selectedProductIds.length} item(s)
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Update Selection
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductsModal;
