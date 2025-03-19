import React, { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit,
  Pencil,
  Printer,
} from "lucide-react";
import { Product, ProductFiltersT, PaginationState } from "@/types/products";
import { getTotalProductQuantity } from "@/constants/mockProducts";
import { cn } from "@/utils";
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

interface ProductsTableProps {
  products: Product[];
  filters: ProductFiltersT;
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onEditProduct: (product: Product) => void;
  onViewProductDetails: (product: Product) => void;
  onSortChange?: (column: string) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  isEditMode?: boolean;
  onSaveEdit?: () => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  filters,
  pagination,
  onPageChange,
  onEditProduct,
  onViewProductDetails,
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

  // Generate pagination
  const generatePaginationItems = () => {
    const totalPages = Math.ceil(pagination.total / pagination.perPage);

    let pages = [];
    const currentPage = pagination.page;

    // Always show first page
    pages.push(1);

    // Add pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    // Add ellipsis where needed
    const withEllipsis = [];
    let prev = 0;

    for (const page of pages) {
      if (page - prev > 1) {
        withEllipsis.push("...");
      }
      withEllipsis.push(page);
      prev = page;
    }

    return withEllipsis;
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
                    <span>Item Quantity</span>
                    {renderSortIndicator("quantity")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("costPrice")}
                >
                  <div className="flex items-center gap-1">
                    <span>Cost Price ($)</span>
                    {renderSortIndicator("costPrice")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSortClick("wholesalePrice")}
                >
                  <div className="flex items-center gap-1">
                    <span>Wholesale Price ($)</span>
                    {renderSortIndicator("wholesalePrice")}
                  </div>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => handleSortClick("retailPrice")}
                >
                  <div className="flex items-center gap-1">
                    <span>Retail Price (K)</span>
                    {renderSortIndicator("retailPrice")}
                  </div>
                </th>
                <th className="px-6 py-4">Note</th>
                <th
                  className="px-6 py-4 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSortClick("createdAt")}
                >
                  <div className="flex items-center gap-1">
                    <span>Date Created</span>
                    {renderSortIndicator("createdAt")}
                  </div>
                </th>
                {isEditMode && <th className="px-4 py-4">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => {
                  const totalQuantity = getTotalProductQuantity(product);
                  const isSelected = selectedProductIds.includes(product.id);
                  const isEditing = editedRows[product.id] || false;

                  // Calculate profit margins
                  const wholesaleMargin =
                    ((product.wholesalePrice - product.costPrice) /
                      product.wholesalePrice) *
                    100;
                  const retailMargin =
                    ((product.retailPriceUSD - product.wholesalePrice) /
                      product.retailPriceUSD) *
                    100;

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
                            defaultValue={totalQuantity}
                            className="px-2 py-1 h-8 w-20"
                          />
                        ) : (
                          <div>
                            <div className="text-gray-900">{totalQuantity}</div>
                            <div
                              className="text-sm text-blue-600 hover:underline cursor-pointer"
                              onClick={() => onViewProductDetails(product)}
                            >
                              Locations ({product.locations.length})
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditMode && isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={product.costPrice}
                            className="px-2 py-1 h-8 w-24"
                          />
                        ) : (
                          <div className="text-gray-900">
                            $ {product.costPrice.toFixed(2)}
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
                          <div>
                            <div className="text-gray-900">
                              $ {product.wholesalePrice.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Profit: {wholesaleMargin.toFixed(1)}%
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditMode && isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={product.retailPrice}
                            className="px-2 py-1 h-8 w-24"
                          />
                        ) : (
                          <div>
                            <div className="text-gray-900">
                              K {product.retailPrice.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              $ {product.retailPriceUSD.toFixed(2)} |{" "}
                              {retailMargin.toFixed(1)}%
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs overflow-hidden text-ellipsis">
                        {isEditMode && isEditing ? (
                          <Input
                            defaultValue={product.note || ""}
                            className="px-2 py-1 h-8"
                          />
                        ) : (
                          <div className="text-gray-900">
                            {product.note || "-"}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      {isEditMode && (
                        <td className="px-4 py-4">
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
                    colSpan={isEditMode ? 10 : 9}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No products found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination and Summary */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-500">
          Showing {Math.min(pagination.perPage, products.length)} of{" "}
          {pagination.total} products
        </div>

        {pagination.total > pagination.perPage && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>

            {(() => {
              const totalPages = Math.ceil(
                pagination.total / pagination.perPage
              );

              // Don't show pagination for 1 page
              if (totalPages <= 1) return null;

              let buttons = [];

              // Always show first page
              buttons.push(
                <Button
                  key="page-1"
                  variant={pagination.page === 1 ? "default" : "outline"}
                  className={cn(
                    "rounded-full min-w-[40px]",
                    pagination.page === 1
                      ? "bg-gray-900 text-white"
                      : "text-gray-700"
                  )}
                  onClick={() => onPageChange(1)}
                >
                  1
                </Button>
              );

              // Show ellipsis if needed
              if (pagination.page > 3) {
                buttons.push(
                  <span key="ellipsis-1" className="text-gray-400">
                    ...
                  </span>
                );
              }

              // Show pages around current page
              for (
                let i = Math.max(2, pagination.page - 1);
                i <= Math.min(totalPages - 1, pagination.page + 1);
                i++
              ) {
                if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown

                buttons.push(
                  <Button
                    key={`page-${i}`}
                    variant={pagination.page === i ? "default" : "outline"}
                    className={cn(
                      "rounded-full min-w-[40px]",
                      pagination.page === i
                        ? "bg-gray-900 text-white"
                        : "text-gray-700"
                    )}
                    onClick={() => onPageChange(i)}
                  >
                    {i}
                  </Button>
                );
              }

              // Show ellipsis if needed
              if (pagination.page < totalPages - 2) {
                buttons.push(
                  <span key="ellipsis-2" className="text-gray-400">
                    ...
                  </span>
                );
              }

              // Always show last page
              if (totalPages > 1) {
                buttons.push(
                  <Button
                    key={`page-${totalPages}`}
                    variant={
                      pagination.page === totalPages ? "default" : "outline"
                    }
                    className={cn(
                      "rounded-full min-w-[40px]",
                      pagination.page === totalPages
                        ? "bg-gray-900 text-white"
                        : "text-gray-700"
                    )}
                    onClick={() => onPageChange(totalPages)}
                  >
                    {totalPages}
                  </Button>
                );
              }

              return buttons;
            })()}

            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={
                pagination.page * pagination.perPage >= pagination.total
              }
            >
              <ChevronUp className="h-4 w-4 rotate-90" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full ml-2"
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsTable;
