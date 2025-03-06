"use client";
import React, { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StockAdjustmentItem } from "@/types/stockAdjustment";
import { cn } from "@/utils";

interface AdjustmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: StockAdjustmentItem | null;
  onSave: (item: StockAdjustmentItem) => void;
}

const AdjustmentFormModal: React.FC<AdjustmentFormModalProps> = ({
  open,
  onOpenChange,
  item,
  onSave,
}) => {
  // Adjustment state
  const [quantity, setQuantity] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setQuantity(item.quantity || 0);
      setErrors({});
    }
  }, [item]);

  // Reset errors when input changes
  useEffect(() => {
    setErrors({});
  }, [quantity]);

  // Handle adjustment buttons
  const handleIncrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrementQuantity = () => {
    if (quantity > 0) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Calculate new quantity
  const calculateNewQuantity = () => {
    if (!item) return 0;
    return item.previousQuantity + quantity;
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    const newErrors: Record<string, string> = {};

    if (quantity === 0) {
      newErrors.quantity = "Adjustment quantity must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create updated item
    if (item) {
      const updatedItem: StockAdjustmentItem = {
        ...item,
        adjustmentType: "Add", // Always Add for incoming items
        quantity,
        newQuantity: calculateNewQuantity(),
      };

      onSave(updatedItem);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-y-auto max-h-screen !bg-white">
        <DialogHeader className="p-6 bg-white">
          <DialogTitle className="text-xl font-semibold">
            Adjust Incoming Quantity
          </DialogTitle>
        </DialogHeader>

        {item && (
          <div className="px-6 py-4 border-t border-b bg-gray-50">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 rounded-md">
                <AvatarImage
                  src={item.productImage}
                  alt={item.productName}
                  className="object-cover"
                />
                <AvatarFallback>{item.productName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-medium">{item.productName}</div>
                <div className="text-sm text-gray-500">{item.category}</div>
                <div className="text-sm mt-1">
                  Current Quantity:{" "}
                  <span className="font-medium">{item.previousQuantity}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Adjustment Controls */}
          <div className="space-y-2">
            <Label htmlFor="adjustment" className="text-gray-700">
              Incoming Quantity
            </Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-l-md border-gray-200"
                onClick={handleDecrementQuantity}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="adjustment"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    setQuantity(val);
                  }
                }}
                className={cn(
                  "text-center h-10 border-gray-200 rounded-none",
                  errors.quantity &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-r-md border-gray-200",
                  quantity > 0 && "bg-green-100 text-green-600 border-green-200"
                )}
                onClick={handleIncrementQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.quantity && (
              <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
            )}

            <div className="text-sm text-gray-500 mt-2">
              {quantity > 0 && (
                <div>
                  Adding {quantity} items. New quantity will be{" "}
                  {calculateNewQuantity()}.
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 bg-gray-50 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={handleSubmit}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdjustmentFormModal;
