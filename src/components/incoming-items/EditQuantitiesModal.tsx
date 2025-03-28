"use client";
import React, { useState, useEffect } from "react";
import { Search, Check, Plus, Minus } from "lucide-react";
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
import { StockAdjustmentItem } from "@/types/stockAdjustment";
import { cn } from "@/utils";

interface EditQuantitiesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: StockAdjustmentItem[];
  onUpdateQuantities: (items: StockAdjustmentItem[]) => void;
}

const EditQuantitiesModal: React.FC<EditQuantitiesModalProps> = ({
  open,
  onOpenChange,
  items,
  onUpdateQuantities,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editedItems, setEditedItems] = useState<StockAdjustmentItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setEditedItems([...items]);
      setSelectedItemIds([]);
    }
  }, [open, items]);

  // Filter items by search term
  const filteredItems = editedItems.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle item selection
  const toggleItemSelection = (productId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedItemIds.length === filteredItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredItems.map((item) => item.productId));
    }
  };

  // Handle quantity change
  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity) || 1;
    if (quantity < 1) return; // Enforce minimum quantity of 1 for incoming items

    setEditedItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity: quantity,
            newQuantity: item.previousQuantity + quantity,
          };
        }
        return item;
      })
    );
  };

  // Handle increment quantity
  const handleIncrementQuantity = (productId: string) => {
    setEditedItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + 1;
          return {
            ...item,
            quantity: newQuantity,
            newQuantity: item.previousQuantity + newQuantity,
          };
        }
        return item;
      })
    );
  };

  // Handle decrement quantity (with minimum of 1)
  const handleDecrementQuantity = (productId: string) => {
    setEditedItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.quantity > 1) {
          const newQuantity = item.quantity - 1;
          return {
            ...item,
            quantity: newQuantity,
            newQuantity: item.previousQuantity + newQuantity,
          };
        }
        return item;
      })
    );
  };

  // Handle confirm button click
  const handleConfirm = () => {
    onUpdateQuantities(editedItems);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] bg-gray-100 p-0 overflow-hidden flex flex-col h-[90vh]">
        <DialogHeader className="bg-white px-6 py-4 border-b shrink-0">
          <div className="flex items-center">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Edit Incoming Item Quantities
            </DialogTitle>
          </div>
        </DialogHeader>

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
          </div>

          {selectedItemIds.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-500">
                Selected:
              </span>
              {selectedItemIds.map((itemId) => {
                const item = editedItems.find((i) => i.productId === itemId);
                if (!item) return null;

                return (
                  <Badge
                    key={itemId}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 flex items-center gap-1"
                  >
                    {item.productName}
                    <button
                      className="ml-1 rounded-full hover:bg-blue-200"
                      onClick={() => toggleItemSelection(itemId)}
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
                          selectedItemIds.length === filteredItems.length &&
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
                        <span>Current</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div>
                        <span>Incoming Quantity</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div>
                        <span>New</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => {
                      const isSelected = selectedItemIds.includes(
                        item.productId
                      );
                      return (
                        <tr
                          key={item.productId}
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
                                toggleItemSelection(item.productId)
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
                            <div className="text-gray-900">
                              {item.previousQuantity}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-l-md"
                                onClick={() =>
                                  handleDecrementQuantity(item.productId)
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.productId,
                                    e.target.value
                                  )
                                }
                                className="w-20 h-9 rounded-none text-center"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-r-md"
                                onClick={() =>
                                  handleIncrementQuantity(item.productId)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-gray-900 font-medium">
                              {item.newQuantity}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        {searchTerm
                          ? `No items found matching "${searchTerm}"`
                          : "No items available"}
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
