"use client";
import React, { useState, useEffect } from "react";
import { Search, Plus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import useToast from "@/hooks/useToast";
import { StockAdjustmentItem } from "@/types/stockAdjustment";

interface ProductSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductsSelected: (items: StockAdjustmentItem[]) => void;
  selectedLocationIds: string[];
  availableProducts: any[];
  existingItems: StockAdjustmentItem[];
  onAddNewProduct?: () => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  open,
  onOpenChange,
  onProductsSelected,
  selectedLocationIds,
  availableProducts,
  existingItems,
  onAddNewProduct,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  // Initialize with an explicitly empty array
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // Flag to track if this is the initial opening or a subsequent one
  const [initialized, setInitialized] = useState(false);

  // Initialize state when modal opens - COMPLETELY RESET the state
  useEffect(() => {
    if (open) {
      // Reset search
      setSearchTerm("");

      // Clear and then set selected products
      if (!initialized) {
        // First time modal opens - start with nothing selected
        setSelectedProductIds([]);
        setInitialized(true);
      } else if (existingItems.length > 0) {
        // Subsequent opens - maintain selections from existing items
        setSelectedProductIds(existingItems.map((item) => item.productId));
      } else {
        // No existing items - clear selections
        setSelectedProductIds([]);
      }

      // Set filtered products to all available
      if (availableProducts.length > 0) {
        console.log(
          `Setting filtered products: ${availableProducts.length} products`
        );
        setFilteredProducts([...availableProducts]);
      } else {
        console.log("No available products");
        setFilteredProducts([]);
      }
    }
  }, [open, existingItems, availableProducts]);

  // Filter products by search term - completely separate from selection logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(availableProducts);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = availableProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, availableProducts]);

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle select all filtered products
  const toggleSelectAll = () => {
    if (
      filteredProducts.length > 0 &&
      filteredProducts.every((product) =>
        selectedProductIds.includes(product.id)
      )
    ) {
      // Remove all filtered products from selection
      const filteredIds = filteredProducts.map((p) => p.id);
      setSelectedProductIds((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    } else {
      // Add all filtered products to selection
      const filteredIds = filteredProducts.map((p) => p.id);
      setSelectedProductIds((prev) => {
        const newSelection = [...prev];
        filteredIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Explicitly check if a product is selected
  const isProductSelected = (productId: string) => {
    return selectedProductIds.includes(productId);
  };

  // Continue with selected products
  const handleContinue = () => {
    // Convert selected product IDs to StockAdjustmentItems
    const newItems: StockAdjustmentItem[] = [];

    // First add existing items that are still selected
    existingItems.forEach((item) => {
      if (selectedProductIds.includes(item.productId)) {
        newItems.push(item);
      }
    });

    // Then add newly selected products
    selectedProductIds.forEach((productId) => {
      // Skip if already in newItems
      if (newItems.some((item) => item.productId === productId)) {
        return;
      }

      const product = availableProducts.find((p) => p.id === productId);
      if (product) {
        // Calculate current quantity from all selected locations
        let currentQuantity = 0;
        product.locations.forEach((loc: any) => {
          if (selectedLocationIds.includes(loc.locationId)) {
            currentQuantity += loc.quantity;
          }
        });

        newItems.push({
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          category: product.category,
          adjustmentType: "Add",
          quantity: 0, // Default quantity (no adjustment yet)
          previousQuantity: currentQuantity,
          newQuantity: currentQuantity,
          reasonId: "", // No reason needed for incoming items
        });
      }
    });

    if (newItems.length === 0) {
      showToast("Please select at least one product", "warning");
      return;
    }

    onProductsSelected(newItems);
    onOpenChange(false);
  };

  // When modal closes, reset the initialized flag to ensure fresh state next time
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setInitialized(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-gray-100 p-0 overflow-hidden flex flex-col h-[90vh]">
        <DialogHeader className="bg-white px-6 py-4 mt-3 border-b shrink-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              Select Products for Incoming Items
            </DialogTitle>
            {onAddNewProduct && (
              <Button
                variant="outline"
                className="gap-1 mr-4"
                onClick={() => {
                  onOpenChange(false);
                  setTimeout(() => onAddNewProduct(), 100);
                }}
              >
                <Plus className="h-4 w-4" /> Add New Product
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <div className="relative mb-4 shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Show newly selected products as badges */}
          {selectedProductIds.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-500">
                Selected:
              </span>
              {selectedProductIds.map((productId) => {
                const product = availableProducts.find(
                  (p) => p.id === productId
                );
                if (!product) return null;

                return (
                  <Badge
                    key={productId}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 flex items-center gap-1"
                  >
                    {product.name}
                    <button
                      className="ml-1 rounded-full hover:bg-blue-200"
                      onClick={() => toggleProductSelection(productId)}
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          <div className="bg-white rounded-lg overflow-hidden mb-6 flex-1 flex flex-col">
            <ScrollArea className="flex-1 h-full w-full">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <th className="pl-4 py-4 pr-2">
                      <Checkbox
                        checked={
                          filteredProducts.length > 0 &&
                          filteredProducts.every((product) =>
                            selectedProductIds.includes(product.id)
                          )
                        }
                        onCheckedChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-4">Photo</th>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Current Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => {
                      // Explicitly calculate the selection state for each product
                      const isSelected = isProductSelected(product.id);

                      // Calculate current quantity from all selected locations
                      let currentQuantity = 0;
                      product.locations.forEach((loc: any) => {
                        if (selectedLocationIds.includes(loc.locationId)) {
                          currentQuantity += loc.quantity;
                        }
                      });

                      return (
                        <tr
                          key={product.id}
                          className={cn(
                            "transition-colors",
                            isSelected
                              ? "bg-blue-50"
                              : index % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50/30",
                            "hover:bg-gray-50 cursor-pointer"
                          )}
                          onClick={() => toggleProductSelection(product.id)}
                        >
                          <td className="pl-4 py-4 pr-2">
                            <Checkbox
                              checked={isSelected}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <Avatar className="h-12 w-12 rounded-md">
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
                          <td className="px-6 py-4">
                            <div className="text-gray-900 font-medium">
                              {product.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              {product.category}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-gray-900">
                              {currentQuantity}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        {searchTerm
                          ? `No products found matching "${searchTerm}"`
                          : "No additional products available to add"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </div>

          <DialogFooter className="flex justify-between items-center gap-2 shrink-0">
            <div className="text-sm text-gray-500">
              {selectedProductIds.length} product(s) selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                disabled={selectedProductIds.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="mr-2 h-4 w-4" />
                Continue
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelectionModal;
