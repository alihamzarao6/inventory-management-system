"use client";
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils";
import { CustomerProduct } from "@/types/customer";
import { Product } from "@/types/products";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";

// Form validation schema
const customerProductSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  specialPrice: z.coerce
    .number()
    .min(0, "Price must be 0 or greater")
    .optional(),
  discount: z.coerce
    .number()
    .min(0, "Discount must be 0 or greater")
    .max(100, "Discount cannot exceed 100%")
    .optional(),
  note: z.string().optional(),
});

type CustomerProductFormData = {
  productId: string;
  specialPrice?: number;
  discount?: number;
  note?: string;
};

interface AddCustomerProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CustomerProductFormData) => void;
  customerId: string;
  initialData?: Partial<CustomerProductFormData>;
  existingProductIds?: string[]; // Products already assigned to this customer
}

const AddCustomerProductForm: React.FC<AddCustomerProductFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  customerId,
  initialData,
  existingProductIds = [],
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const isEditMode = !!initialData?.productId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CustomerProductFormData>({
    resolver: zodResolver(customerProductSchema),
    defaultValues: initialData || {
      productId: "",
      specialPrice: undefined,
      discount: undefined,
      note: "",
    },
  });

  // Watch for product ID changes
  const productId = watch("productId");

  // Reset form when closed or update selected product when product ID changes
  useEffect(() => {
    if (!open) {
      if (!isEditMode) {
        reset();
        setSelectedProduct(null);
      }
    } else if (productId) {
      const product = MOCK_PRODUCTS.find((p) => p.id === productId);
      setSelectedProduct(product || null);
    }
  }, [open, reset, isEditMode, productId]);

  // Set initial data when in edit mode
  useEffect(() => {
    if (open && isEditMode && initialData) {
      reset(initialData);
      if (initialData.productId) {
        const product = MOCK_PRODUCTS.find(
          (p) => p.id === initialData.productId
        );
        setSelectedProduct(product || null);
      }
    }
  }, [open, isEditMode, initialData, reset]);

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data);
    onOpenChange(false);
  });

  // Get available products (exclude already assigned ones in create mode)
  const getAvailableProducts = () => {
    if (isEditMode && initialData?.productId) {
      // In edit mode, include the currently selected product plus unassigned ones
      return MOCK_PRODUCTS.filter(
        (p) =>
          !existingProductIds.includes(p.id) || p.id === initialData.productId
      );
    }
    // In create mode, only show unassigned products
    return MOCK_PRODUCTS.filter((p) => !existingProductIds.includes(p.id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            {isEditMode ? "Edit Customer Product" : "Add Product for Customer"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form
            id="customerProductForm"
            onSubmit={onFormSubmit}
            className="p-6 pt-4 space-y-6"
          >
            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="productId" className="text-gray-700">
                Select Product
              </Label>
              <Select
                defaultValue={initialData?.productId}
                onValueChange={(value) => setValue("productId", value)}
                disabled={isEditMode} // Disable changing product in edit mode
              >
                <SelectTrigger
                  className={cn(
                    "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                    errors.productId &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                >
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableProducts().map((product) => (
                    <SelectItem
                      key={product.id}
                      value={product.id}
                      className="hover:!bg-gray-200"
                    >
                      {product.name} - {product.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && (
                <p className="text-sm text-red-500 mt-0">
                  {errors.productId.message}
                </p>
              )}
            </div>

            {/* Product Details if selected */}
            {selectedProduct && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-white">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-500">
                      Category: {selectedProduct.category}
                    </p>
                    <div className="mt-1 flex gap-4 text-sm">
                      <span>Cost: ${selectedProduct.costPrice.toFixed(2)}</span>
                      <span>
                        Wholesale: ${selectedProduct.wholesalePrice.toFixed(2)}
                      </span>
                      <span>
                        Retail: K{selectedProduct.retailPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Special Price */}
            <div className="space-y-2">
              <Label htmlFor="specialPrice" className="text-gray-700">
                Special Price (Optional)
              </Label>
              <Input
                id="specialPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("specialPrice")}
                className={cn(
                  "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                  errors.specialPrice &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {selectedProduct && (
                <p className="text-xs text-gray-500">
                  Regular wholesale price: $
                  {selectedProduct.wholesalePrice.toFixed(2)}
                </p>
              )}
              {errors.specialPrice && (
                <p className="text-sm text-red-500 mt-0">
                  {errors.specialPrice.message}
                </p>
              )}
            </div>

            {/* Discount Percentage */}
            <div className="space-y-2">
              <Label htmlFor="discount" className="text-gray-700">
                Discount Percentage (Optional)
              </Label>
              <Input
                id="discount"
                type="number"
                step="1"
                placeholder="0"
                {...register("discount")}
                className={cn(
                  "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                  errors.discount &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.discount && (
                <p className="text-sm text-red-500 mt-0">
                  {errors.discount.message}
                </p>
              )}
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note" className="text-gray-700">
                Note (Optional)
              </Label>
              <Textarea
                id="note"
                placeholder="Add any additional notes about this customer-specific pricing..."
                {...register("note")}
                className="border-gray-200 focus:border-gray-300 focus:ring-gray-300 min-h-[100px] rounded-xl"
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50">
          <Button
            type="submit"
            form="customerProductForm"
            className="w-full bg-gray-900 hover:bg-opacity-80 text-white py-2.5 rounded-[10px] transition-colors duration-200"
          >
            {isEditMode ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerProductForm;
