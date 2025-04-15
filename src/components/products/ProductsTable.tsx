import React, { useState, useEffect } from "react";
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
  selectedProductIds: string[];
  onSelectedProductsChange: (selectedIds: string[]) => void;
  onProductFieldChange: (productId: string, field: string, value: any) => void;
  editedProducts: Record<string, Partial<Product>>;
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
  selectedProductIds,
  onSelectedProductsChange,
  onProductFieldChange,
  editedProducts,
}) => {
  // Store original values to detect changes
  const [originalValues, setOriginalValues] = useState<Record<string, any>>({});

  // Set original values when products or selection changes
  useEffect(() => {
    const values: Record<string, any> = {};
    products.forEach((product) => {
      values[product.id] = {
        name: product.name,
        category: product.category,
        costPrice: product.costPrice,
        wholesalePrice: product.wholesalePrice,
        retailPrice: product.retailPrice,
        note: product.note || "",
      };
    });
    setOriginalValues(values);
  }, [products]);

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
    const updatedSelection = selectedProductIds.includes(productId)
      ? selectedProductIds.filter((id) => id !== productId)
      : [...selectedProductIds, productId];

    onSelectedProductsChange(updatedSelection);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      onSelectedProductsChange([]);
    } else {
      onSelectedProductsChange(products.map((p) => p.id));
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = "$") => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  // Handle input field change
  const handleInputChange = (
    productId: string,
    field: string,
    value: any,
    type: string = "text"
  ) => {
    let parsedValue = value;

    if (type === "number") {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    }

    onProductFieldChange(productId, field, parsedValue);
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

  // Check if a product is editable (selected + edit mode)
  const isProductEditable = (productId: string) => {
    return isEditMode && selectedProductIds.includes(productId);
  };

  // Get edited or original value
  const getProductValue = (
    productId: string,
    field: string,
    originalValue: any
  ) => {
    if (
      editedProducts[productId] &&
      editedProducts[productId][field as keyof Product] !== undefined
    ) {
      return editedProducts[productId][field as keyof Product];
    }
    return originalValue;
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
                <th className="px-6 py-4 min-w-[200px] text-center">Note</th>
                <th
                  className="px-6 py-4 cursor-pointer whitespace-nowrap"
                  onClick={() => handleSortClick("createdAt")}
                >
                  <div className="flex items-center gap-1">
                    <span>Date Created</span>
                    {renderSortIndicator("createdAt")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => {
                  const totalQuantity = getTotalProductQuantity(product);
                  const isSelected = selectedProductIds.includes(product.id);
                  const isEditable = isProductEditable(product.id);

                  // Calculate profit margins
                  const wholesaleMargin =
                    ((product.wholesalePrice - product.costPrice) /
                      product.wholesalePrice) *
                    100;
                  const retailMargin =
                    ((product.retailPriceUSD - product.wholesalePrice) /
                      product.retailPriceUSD) *
                    100;

                  // Get edited values or original values
                  const productName = getProductValue(
                    product.id,
                    "name",
                    product.name
                  );
                  const productCategory = getProductValue(
                    product.id,
                    "category",
                    product.category
                  );
                  const productCostPrice = getProductValue(
                    product.id,
                    "costPrice",
                    product.costPrice
                  );
                  const productWholesalePrice = getProductValue(
                    product.id,
                    "wholesalePrice",
                    product.wholesalePrice
                  );
                  const productRetailPrice = getProductValue(
                    product.id,
                    "retailPrice",
                    product.retailPrice
                  );
                  const productNote = getProductValue(
                    product.id,
                    "note",
                    product.note || ""
                  );

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
                        {isEditable ? (
                          <div className="space-y-1">
                            <Input
                              value={productName}
                              onChange={(e) =>
                                handleInputChange(
                                  product.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="px-2 py-1 h-8"
                            />
                            <Input
                              value={productCategory}
                              onChange={(e) =>
                                handleInputChange(
                                  product.id,
                                  "category",
                                  e.target.value
                                )
                              }
                              className="px-2 py-1 h-8 text-sm text-gray-500"
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => onViewProductDetails(product)}
                            className="cursor-pointer"
                          >
                            <div className="text-gray-900 font-medium">
                              {productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {productCategory}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-gray-900">{totalQuantity}</div>
                          <div
                            className="text-sm text-blue-600 hover:underline cursor-pointer"
                            onClick={() => onViewProductDetails(product)}
                          >
                            Locations ({product.locations.length})
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isEditable ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={productCostPrice}
                            onChange={(e) =>
                              handleInputChange(
                                product.id,
                                "costPrice",
                                e.target.value,
                                "number"
                              )
                            }
                            className="px-2 py-1 h-8 w-24"
                          />
                        ) : (
                          <div className="text-gray-900">
                            $ {productCostPrice.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditable ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={productWholesalePrice}
                            onChange={(e) =>
                              handleInputChange(
                                product.id,
                                "wholesalePrice",
                                e.target.value,
                                "number"
                              )
                            }
                            className="px-2 py-1 h-8 w-24"
                          />
                        ) : (
                          <div>
                            <div className="text-gray-900">
                              $ {productWholesalePrice.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Profit: {wholesaleMargin.toFixed(1)}%
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditable ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={productRetailPrice}
                            onChange={(e) =>
                              handleInputChange(
                                product.id,
                                "retailPrice",
                                e.target.value,
                                "number"
                              )
                            }
                            className="px-2 py-1 h-8 w-24"
                          />
                        ) : (
                          <div>
                            <div className="text-gray-900">
                              K {productRetailPrice.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              $ {product.retailPriceUSD.toFixed(2)} |{" "}
                              {retailMargin.toFixed(1)}%
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs overflow-hidden text-ellipsis">
                        {isEditable ? (
                          <Input
                            value={productNote}
                            onChange={(e) =>
                              handleInputChange(
                                product.id,
                                "note",
                                e.target.value
                              )
                            }
                            className="px-2 py-1 h-8"
                          />
                        ) : (
                          <div className="text-gray-900">
                            {productNote || "-"}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">
                          {(() => {
                            const date = new Date(product.createdAt);
                            const day = date.getDate();
                            const month = date.toLocaleString("en-US", {
                              month: "short",
                            });
                            const year = date.getFullYear();
                            return `${day} ${month}, ${year}`;
                          })()}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={9}
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
