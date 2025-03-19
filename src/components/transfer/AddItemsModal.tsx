"use client";
import React, { useState, useEffect } from "react";
import { Search, Check } from "lucide-react";
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
import { TransferItem } from "@/types/transfers";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { cn } from "@/utils";

interface AddItemsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItems: (items: TransferItem[]) => void;
  sourceLocationIds: string[];
  existingItems: TransferItem[];
  destinationLocationId: string;
}

const AddItemsModal: React.FC<AddItemsModalProps> = ({
  open,
  onOpenChange,
  onAddItems,
  sourceLocationIds,
  existingItems,
  destinationLocationId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    {
      productId: string;
      sourceLocationId: string;
    }[]
  >([]);
  const [availableProducts, setAvailableProducts] = useState<
    {
      product: any;
      sourceLocationId: string;
      sourceLocationName: string;
      quantity: number;
    }[]
  >([]);

  // Load available products when modal opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setSelectedProducts([]);
      setAvailableProducts(getAvailableProducts());
    }
  }, [open, sourceLocationIds, existingItems]);

  // Get products available at the source locations
  const getAvailableProducts = () => {
    const availableProducts: {
      product: any;
      sourceLocationId: string;
      sourceLocationName: string;
      quantity: number;
    }[] = [];

    // Filter products that have stock in selected source locations
    MOCK_PRODUCTS.forEach((product) => {
      product.locations.forEach((loc) => {
        if (sourceLocationIds.includes(loc.locationId) && loc.quantity > 0) {
          // Check if this product+location combo is already in the transfer
          const isAlreadyAdded = existingItems.some(
            (item) =>
              item.productId === product.id &&
              item.sourceLocationId === loc.locationId
          );

          if (!isAlreadyAdded) {
            // Get location name
            let locationName = "Unknown";
            if (loc.isSubLocation) {
              const subLoc = MOCK_SUB_LOCATIONS.find(
                (sl) => sl.id === loc.locationId
              );
              if (subLoc) {
                const parentLoc = MOCK_LOCATIONS.find(
                  (l) => l.id === subLoc.parentId
                );
                locationName = `${subLoc.name} (${
                  parentLoc?.name || "Unknown"
                })`;
              }
            } else {
              const mainLoc = MOCK_LOCATIONS.find(
                (l) => l.id === loc.locationId
              );
              locationName = mainLoc?.name || "Unknown";
            }

            availableProducts.push({
              product,
              sourceLocationId: loc.locationId,
              sourceLocationName: locationName,
              quantity: loc.quantity,
            });
          }
        }
      });
    });

    // Sort by product name
    return availableProducts.sort((a, b) =>
      a.product.name.localeCompare(b.product.name)
    );
  };

  // Filter products by search term
  const filteredProducts = availableProducts.filter(
    (item) =>
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sourceLocationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle product selection
  const toggleProductSelection = (productId: string, locationId: string) => {
    const itemKey = { productId, sourceLocationId: locationId };
    const isSelected = selectedProducts.some(
      (item) =>
        item.productId === productId && item.sourceLocationId === locationId
    );

    if (isSelected) {
      setSelectedProducts(
        selectedProducts.filter(
          (item) =>
            !(
              item.productId === productId &&
              item.sourceLocationId === locationId
            )
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, itemKey]);
    }
  };

  // Toggle select all products
  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(
        filteredProducts.map((item) => ({
          productId: item.product.id,
          sourceLocationId: item.sourceLocationId,
        }))
      );
    }
  };

  // Handle continue button click
  const handleContinue = () => {
    // Convert selected products to transfer items
    const transferItems: TransferItem[] = selectedProducts.map((selected) => {
      const productData = filteredProducts.find(
        (item) =>
          item.product.id === selected.productId &&
          item.sourceLocationId === selected.sourceLocationId
      );

      if (!productData) return null as any;

      // Get destination quantity (if product exists at destination)
      const destinationQuantity =
        productData.product.locations.find(
          (loc: any) => loc.locationId === destinationLocationId
        )?.quantity || 0;

      return {
        productId: selected.productId,
        productName: productData.product.name,
        productImage: productData.product.image,
        category: productData.product.category,
        sourceLocationId: selected.sourceLocationId,
        sourceLocationName: productData.sourceLocationName,
        sourceQuantity: productData.quantity,
        destinationQuantity: destinationQuantity,
        quantity: 1, // Default quantity
      };
    });

    onAddItems(transferItems.filter(Boolean));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] bg-gray-100 p-0 overflow-hidden flex flex-col h-[90vh]">
        <DialogHeader className="bg-white px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Add Items to Transfer
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <div className="relative mb-4 shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="Search items..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {selectedProducts.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-500">
                Selected:
              </span>
              {selectedProducts.map((selected) => {
                const item = availableProducts.find(
                  (p) =>
                    p.product.id === selected.productId &&
                    p.sourceLocationId === selected.sourceLocationId
                );
                if (!item) return null;

                return (
                  <Badge
                    key={`${selected.productId}-${selected.sourceLocationId}`}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 flex items-center gap-1"
                  >
                    {item.product.name}
                    <button
                      className="ml-1 rounded-full hover:bg-blue-200"
                      onClick={() =>
                        toggleProductSelection(
                          selected.productId,
                          selected.sourceLocationId
                        )
                      }
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
                          selectedProducts.length === filteredProducts.length &&
                          filteredProducts.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-4">Photo</th>
                    <th className="px-6 py-4">
                      <div>
                        <span>Item Name</span>
                      </div>
                    </th>
                    <th className="px-6 py-4">
                      <div>
                        <span>Quantity</span>
                        <span className="text-xs font-normal block">
                          From Location
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((item, index) => {
                      const isSelected = selectedProducts.some(
                        (selected) =>
                          selected.productId === item.product.id &&
                          selected.sourceLocationId === item.sourceLocationId
                      );

                      return (
                        <tr
                          key={`${item.product.id}-${item.sourceLocationId}`}
                          className={cn(
                            "transition-colors",
                            isSelected
                              ? "bg-blue-50"
                              : index % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50/30",
                            "hover:bg-gray-50 cursor-pointer"
                          )}
                          onClick={() =>
                            toggleProductSelection(
                              item.product.id,
                              item.sourceLocationId
                            )
                          }
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
                                src={item.product.image}
                                alt={item.product.name}
                                className="object-cover"
                              />
                              <AvatarFallback>
                                {item.product.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-gray-900 font-medium">
                                {item.product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.product.category}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-gray-900">
                                {item.quantity}
                              </div>
                              <div className="text-sm text-gray-500">
                                From: {item.sourceLocationName}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        {searchTerm
                          ? `No items found matching "${searchTerm}"`
                          : sourceLocationIds.length === 0
                          ? "Please select source location(s) first"
                          : "No available items found in selected location(s)"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </div>

          <DialogFooter className="flex justify-end gap-2 shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              disabled={selectedProducts.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check className="mr-2 h-4 w-4" />
              Continue
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemsModal;
