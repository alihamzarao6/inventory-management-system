"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Search, Check, Trash2, User } from "lucide-react";
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
import { cn } from "@/utils";

interface EditQuantitiesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: TransferItem[];
  onUpdateQuantities: (items: TransferItem[]) => void;
  destinationLocationId: string;
  isCustomerDestination?: boolean;
}

const EditQuantitiesModal: React.FC<EditQuantitiesModalProps> = ({
  open,
  onOpenChange,
  items,
  onUpdateQuantities,
  destinationLocationId,
  isCustomerDestination = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editedItems, setEditedItems] = useState<TransferItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setEditedItems([...items]);
      setSelectedItems([]);
    }
  }, [open, items]);

  // Filter items by search term
  const filteredItems = editedItems.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sourceLocationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle item selection
  const toggleItemSelection = (productId: string, sourceLocationId: string) => {
    const itemKey = `${productId}-${sourceLocationId}`;
    setSelectedItems((prev) =>
      prev.includes(itemKey)
        ? prev.filter((id) => id !== itemKey)
        : [...prev, itemKey]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        filteredItems.map(
          (item) => `${item.productId}-${item.sourceLocationId}`
        )
      );
    }
  };

  // Handle quantity change
  const handleQuantityChange = (
    productId: string,
    sourceLocationId: string,
    newQuantity: string
  ) => {
    const quantity = parseInt(newQuantity) || 0;
    const itemIndex = editedItems.findIndex(
      (item) =>
        item.productId === productId &&
        item.sourceLocationId === sourceLocationId
    );

    if (itemIndex !== -1) {
      const maxQuantity = editedItems[itemIndex].sourceQuantity;

      // Limit quantity to available stock
      const validQuantity = Math.max(0, Math.min(quantity, maxQuantity));

      const updatedItems = [...editedItems];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity: validQuantity,
      };

      setEditedItems(updatedItems);
    }
  };

  // Handle remove selected items
  const handleRemoveSelected = () => {
    setEditedItems(
      editedItems.filter(
        (item) =>
          !selectedItems.includes(`${item.productId}-${item.sourceLocationId}`)
      )
    );
    setSelectedItems([]);
  };

  // Handle confirm button click
  const handleConfirm = () => {
    // Filter out items with zero quantity
    const validItems = editedItems.filter((item) => item.quantity > 0);
    onUpdateQuantities(validItems);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] bg-gray-100 p-0 overflow-hidden flex flex-col h-[90vh]">
        <DialogHeader className="bg-white px-6 py-4 border-b shrink-0">
          <div className="flex items-center">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Edit Transfer Quantities
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Customer indicator */}
        {isCustomerDestination && (
          <div className="bg-blue-50 p-4 border-b border-blue-100">
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-blue-800">
                <span className="font-medium">Customer Transfer:</span> Items
                will be sent to a customer
              </p>
            </div>
          </div>
        )}

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Search items..."
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {selectedItems.length > 0 && (
              <Button
                variant="outline"
                className="flex items-center gap-1 text-red-500"
                onClick={handleRemoveSelected}
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove Selected ({selectedItems.length})</span>
              </Button>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-500">
                Selected:
              </span>
              {selectedItems.map((itemKey) => {
                const [productId, sourceLocationId] = itemKey.split("-");
                const item = editedItems.find(
                  (i) =>
                    i.productId === productId &&
                    i.sourceLocationId === sourceLocationId
                );
                if (!item) return null;

                return (
                  <Badge
                    key={itemKey}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 flex items-center gap-1"
                  >
                    {item.productName}
                    <button
                      className="ml-1 rounded-full hover:bg-blue-200"
                      onClick={() =>
                        toggleItemSelection(productId, sourceLocationId)
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
                          selectedItems.length === filteredItems.length &&
                          filteredItems.length > 0
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
                        <span>From Location</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div>
                        <span>Available</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div>
                        <span>Transfer Quantity</span>
                      </div>
                    </th>
                    {!isCustomerDestination && (
                      <th className="px-6 py-4 text-center">
                        <div>
                          <span>Destination Qty</span>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => {
                      const isSelected = selectedItems.includes(
                        `${item.productId}-${item.sourceLocationId}`
                      );
                      return (
                        <tr
                          key={`${item.productId}-${item.sourceLocationId}`}
                          className={cn(
                            "transition-colors",
                            isSelected
                              ? "bg-blue-50"
                              : index % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50/30",
                            "hover:bg-gray-50"
                          )}
                        >
                          <td className="pl-4 py-4 pr-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleItemSelection(
                                  item.productId,
                                  item.sourceLocationId
                                )
                              }
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <Avatar className="h-12 w-12 rounded-md">
                              <AvatarImage
                                src={item.productImage}
                                alt={item.productName}
                                className="object-cover"
                              />
                              <AvatarFallback>
                                {item.productName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-gray-900 font-medium">
                                {item.productName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.category}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              {item.sourceLocationName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-gray-900">
                                {item.sourceQuantity}
                              </span>
                              <span className="text-xs text-gray-500">
                                Available
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Input
                              type="number"
                              min="0"
                              max={item.sourceQuantity}
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.productId,
                                  item.sourceLocationId,
                                  e.target.value
                                )
                              }
                              className="w-24 text-center h-9 mx-auto"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {item.sourceQuantity - item.quantity} will remain
                            </div>
                          </td>
                          {!isCustomerDestination && (
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center">
                                <div className="flex items-center">
                                  <span className="text-gray-900">
                                    {item.destinationQuantity}
                                  </span>
                                  <span className="text-gray-500 mx-2">→</span>
                                  <span className="text-gray-900 font-medium">
                                    {item.destinationQuantity + item.quantity}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  After transfer
                                </span>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={isCustomerDestination ? 6 : 7}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        {searchTerm
                          ? `No items found matching "${searchTerm}"`
                          : "No items available for transfer"}
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
              onClick={handleConfirm}
              disabled={
                editedItems.length === 0 ||
                editedItems.every((item) => item.quantity === 0)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuantitiesModal;
