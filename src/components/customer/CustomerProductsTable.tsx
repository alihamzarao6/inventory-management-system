import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash,
  Tag,
  Percent,
  Check,
  Pencil,
} from "lucide-react";
import { Product } from "@/types/products";
import { CustomerProduct } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils";
import { getCustomerProductRelationship } from "@/constants/mockCustomers";

interface CustomerProductsTableProps {
  products: Product[];
  customerId: string;
  onViewProductDetails: (product: Product) => void;
  onRemoveCustomerProduct: (productId: string) => void;
  onSortChange?: (column: string) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  isEditMode?: boolean;
  onSaveEdit?: () => void;
}

const CustomerProductsTable: React.FC<CustomerProductsTableProps> = ({
  products,
  customerId,
  onViewProductDetails,
  onRemoveCustomerProduct,
  onSortChange,
  sortColumn,
  sortDirection,
  isEditMode = false,
  onSaveEdit,
}) => {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [editedRows, setEditedRows] = useState<Record<string, boolean>>({});

  // Handle sort column click
  const handleSortClick = (column: string) => {
    if (onSortChange) {
      onSortChange(column);
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

  // Toggle row selection
  const toggleRowSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = "$") => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  // Calculate total quantity for a product
  const getTotalQuantity = (product: Product) => {
    return product.locations.reduce((sum, loc) => sum + loc.quantity, 0);
  };

  return (
    <div className="w-full">
      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pl-4 py-4 pr-2">
                  <Checkbox
                    checked={
                      selectedProductIds.length === products.length &&
                      products.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-4">Photo</th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("name")}
                >
                  <div className="flex items-center gap-1">
                    <span>Item Name</span>
                    {renderSortIndicator("name")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("quantity")}
                >
                  <div className="flex items-center gap-1">
                    <span>Stock</span>
                    {renderSortIndicator("quantity")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("wholesalePrice")}
                >
                  <div className="flex items-center gap-1">
                    <span>Regular Price</span>
                    {renderSortIndicator("wholesalePrice")}
                  </div>
                </th>
                <th className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <span>Special Pricing</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
                {isEditMode && <th className="px-4 py-4">Edit</th>}
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const customerProduct = getCustomerProductRelationship(
                    customerId,
                    product.id
                  );
                  const hasSpecialPrice = !!customerProduct?.specialPrice;
                  const hasDiscount = !!customerProduct?.discount;

                  // Calculate the final price after discount or special price
                  let finalPrice = product.wholesalePrice;
                  if (hasSpecialPrice && customerProduct?.specialPrice) {
                    finalPrice = customerProduct.specialPrice;
                  } else if (hasDiscount && customerProduct?.discount) {
                    finalPrice =
                      product.wholesalePrice *
                      (1 - customerProduct.discount / 100);
                  }

                  const specialPriceClass =
                    hasSpecialPrice || hasDiscount
                      ? "text-green-600 font-medium"
                      : "text-gray-400";

                  const isEditing = editedRows[product.id] || false;

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
                      <td className="pl-4 py-4 pr-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRowSelection(product.id)}
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
                        {isEditMode && isEditing ? (
                          <div className="space-y-1">
                            <Input
                              defaultValue={product.name}
                              className="px-2 py-1 h-8"
                            />
                            <Input
                              defaultValue={product.category}
                              className="px-2 py-1 h-8 text-sm text-gray-500"
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => onViewProductDetails(product)}
                            className="cursor-pointer"
                          >
                            <div className="text-gray-900 font-medium">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.category}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditMode && isEditing ? (
                          <Input
                            type="number"
                            defaultValue={getTotalQuantity(product)}
                            className="px-2 py-1 h-8 w-20"
                          />
                        ) : (
                          <div className="text-gray-900">
                            {getTotalQuantity(product)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditMode && isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={product.wholesalePrice}
                            className="px-2 py-1 h-8 w-24"
                          />
                        ) : (
                          <div className="text-gray-900">
                            {formatCurrency(product.wholesalePrice)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditMode && isEditing ? (
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-gray-500 block">
                                Special Price
                              </label>
                              <Input
                                type="number"
                                step="0.01"
                                defaultValue={
                                  customerProduct?.specialPrice || ""
                                }
                                placeholder="0.00"
                                className="px-2 py-1 h-8 w-24"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block">
                                Discount %
                              </label>
                              <Input
                                type="number"
                                step="1"
                                defaultValue={customerProduct?.discount || ""}
                                placeholder="0"
                                className="px-2 py-1 h-8 w-24"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {hasSpecialPrice &&
                            customerProduct?.specialPrice ? (
                              <div className="flex items-center text-green-600">
                                <Tag className="h-3 w-3 mr-1" />
                                <span>
                                  {formatCurrency(customerProduct.specialPrice)}
                                </span>
                              </div>
                            ) : hasDiscount && customerProduct?.discount ? (
                              <div className="flex items-center text-green-600">
                                <Percent className="h-3 w-3 mr-1" />
                                <span>
                                  {customerProduct.discount}% off (
                                  {formatCurrency(finalPrice)})
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}

                            {customerProduct?.note && (
                              <div className="text-xs text-gray-500 italic">
                                {customerProduct.note}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-blue-600"
                                  onClick={() => onViewProductDetails(product)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View details</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-red-600"
                                  onClick={() =>
                                    onRemoveCustomerProduct(product.id)
                                  }
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Remove from customer
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                      {isEditMode && (
                        <td className="px-4 py-2">
                          {isEditing ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => {
                                // Toggle editing status for this row
                                setEditedRows((prev) => ({
                                  ...prev,
                                  [product.id]: false,
                                }));

                                // Call the save function
                                if (onSaveEdit) onSaveEdit();
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    className="p-2 hover:bg-gray-100"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      // Toggle editing status for this row
                                      setEditedRows((prev) => ({
                                        ...prev,
                                        [product.id]: true,
                                      }));
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No products assigned to this customer yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerProductsTable;
