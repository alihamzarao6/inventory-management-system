"use client"
import React, { useState, useEffect, useRef } from "react";
import { Plus, Minus, Upload, Check, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StockAdjustmentItem } from "@/types/stockAdjustment";
import { ADJUSTMENT_REASONS } from "@/constants/mockStockAdjustments";
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
  const [adjustmentType, setAdjustmentType] = useState<"Add" | "Remove">("Add");
  const [quantity, setQuantity] = useState<number>(0);
  const [reasonId, setReasonId] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [proof, setProof] = useState<string | null>(null);
  const [proofName, setProofName] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setAdjustmentType(item.adjustmentType === "Remove" ? "Remove" : "Add");
      setQuantity(item.quantity || 0);
      setReasonId(item.reasonId || "");
      setCustomReason(item.customReason || "");
      setProof(item.proof || null);
      setProofName(item.proof ? "proof-image.png" : "");
      setErrors({});
    }
  }, [item]);

  // Reset errors when input changes
  useEffect(() => {
    setErrors({});
  }, [quantity, reasonId]);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file is an image
      if (!file.type.match('image.*')) {
        setErrors(prev => ({ ...prev, proof: "Please upload an image file" }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, proof: "Image size should be less than 5MB" }));
        return;
      }
      
      setProofName(file.name);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setProof(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle removal of proof image
  const handleRemoveProof = () => {
    setProof(null);
    setProofName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle adjustment buttons
  const handleIncrementQuantity = () => {
    setQuantity(prev => prev + 1);
    if (quantity === 0) {
      setAdjustmentType("Add");
    }
  };

  const handleDecrementQuantity = () => {
    if (quantity > 0) {
      setQuantity(prev => prev - 1);
    } else {
      setAdjustmentType("Remove");
      setQuantity(prev => prev + 1);
    }
  };

  // Calculate new quantity
  const calculateNewQuantity = () => {
    if (!item) return 0;
    return adjustmentType === "Add" 
      ? item.previousQuantity + quantity 
      : item.previousQuantity - quantity;
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (quantity === 0) {
      newErrors.quantity = "Adjustment quantity must be greater than 0";
    }
    
    if (!reasonId) {
      newErrors.reason = "Please select a reason for adjustment";
    }
    
    if (reasonId === "reason-4" && !customReason.trim()) {
      newErrors.customReason = "Please provide a custom reason";
    }
    
    // If new quantity would be negative, show error
    if (adjustmentType === "Remove" && quantity > (item?.previousQuantity || 0)) {
      newErrors.quantity = "Adjustment would result in negative quantity";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create updated item
    if (item) {
      const updatedItem: StockAdjustmentItem = {
        ...item,
        adjustmentType,
        quantity,
        newQuantity: calculateNewQuantity(),
        reasonId,
        customReason: reasonId === "reason-4" ? customReason : undefined,
        proof: proof || undefined,
      };
      
      onSave(updatedItem);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-y-auto max-h-screen !bg-white">
        <DialogHeader className="p-6 bg-white">
          <DialogTitle className="text-xl font-semibold">
            Adjust Inventory
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
                <AvatarFallback>
                  {item.productName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-medium">{item.productName}</div>
                <div className="text-sm text-gray-500">{item.category}</div>
                <div className="text-sm mt-1">
                  Current Quantity: <span className="font-medium">{item.previousQuantity}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Adjustment Controls */}
          <div className="space-y-2">
            <Label htmlFor="adjustment" className="text-gray-700">
              Adjustment
            </Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-l-md border-gray-200",
                  adjustmentType === "Remove" && quantity > 0 && "bg-red-100 text-red-600 border-red-200"
                )}
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
                  errors.quantity && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-r-md border-gray-200",
                  adjustmentType === "Add" && quantity > 0 && "bg-green-100 text-green-600 border-green-200"
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
                  {adjustmentType === "Add" 
                    ? `Adding ${quantity} items. New quantity will be ${calculateNewQuantity()}.`
                    : `Removing ${quantity} items. New quantity will be ${calculateNewQuantity()}.`
                  }
                </div>
              )}
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-gray-700">
              Reason
            </Label>
            <Select 
              value={reasonId} 
              onValueChange={setReasonId}
            >
              <SelectTrigger
                id="reason"
                className={cn(
                  "border-gray-200",
                  errors.reason && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              >
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {ADJUSTMENT_REASONS.map((reason) => (
                  <SelectItem key={reason.id} value={reason.id}>
                    {reason.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="text-sm text-red-500 mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Custom Reason */}
          {reasonId === "reason-4" && (
            <div className="space-y-2">
              <Label htmlFor="customReason" className="text-gray-700">
                Custom Reason
              </Label>
              <Textarea
                id="customReason"
                placeholder="Enter custom reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className={cn(
                  "resize-none border-gray-200",
                  errors.customReason && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
                rows={3}
              />
              {errors.customReason && (
                <p className="text-sm text-red-500 mt-1">{errors.customReason}</p>
              )}
            </div>
          )}

          {/* Proof Upload */}
          <div className="space-y-2">
            <Label htmlFor="proof" className="text-gray-700">
              Upload Proof (Optional)
            </Label>
            {!proof ? (
              <div 
                className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="proof"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG or JPEG (max 5MB)
                </p>
              </div>
            ) : (
              <div className="relative border rounded-md overflow-hidden">
                <img
                  src={proof}
                  alt="Proof"
                  className="w-full h-48 object-contain bg-gray-50 p-2"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemoveProof}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="bg-gray-50 px-3 py-2 text-sm text-gray-500 border-t">
                  {proofName}
                </div>
              </div>
            )}
            {errors.proof && (
              <p className="text-sm text-red-500 mt-1">{errors.proof}</p>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 bg-gray-50 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
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