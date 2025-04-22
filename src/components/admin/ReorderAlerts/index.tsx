"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  CheckCircle,
  AlertTriangle,
  Edit,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";
import { Product } from "@/types/products";

// Extended product type to include calculated fields
interface ProductWithInventoryStatus extends Product {
  totalQuantity: number;
  shortage: number;
  surplus: number;
}

const ReorderAlerts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<ProductWithInventoryStatus[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<
    ProductWithInventoryStatus[]
  >([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [editingReorderLevels, setEditingReorderLevels] = useState<
    Record<string, number>
  >({});

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Initialize products
  useEffect(() => {
    // In a real app, this would be an API call
    const productsWithReorderInfo = MOCK_PRODUCTS.map((product) => {
      // Calculate total quantity across all locations
      const totalQuantity = product.locations.reduce(
        (sum, loc) => sum + loc.quantity,
        0
      );

      // Get reorder level or default to 10
      const reorderLevel = product.reorderLevel || 10;

      // Calculate shortage and surplus
      const shortage =
        reorderLevel > totalQuantity ? reorderLevel - totalQuantity : 0;
      const surplus =
        totalQuantity > reorderLevel ? totalQuantity - reorderLevel : 0;

      return {
        ...product,
        totalQuantity,
        reorderLevel,
        shortage,
        surplus,
      };
    });

    setProducts(productsWithReorderInfo);
  }, []);

  // Filter products based on search and active tab
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      );
    }

    // Apply tab filter
    if (activeTab === "shortage") {
      filtered = filtered.filter((p) => p.totalQuantity < p.reorderLevel);
    } else if (activeTab === "instock") {
      filtered = filtered.filter((p) => p.totalQuantity >= p.reorderLevel);
    }

    // Update pagination after filtering
    setPagination((prev) => ({
      ...prev,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.itemsPerPage),
      currentPage: Math.min(
        prev.currentPage,
        Math.ceil(filtered.length / prev.itemsPerPage) || 1
      ),
    }));

    setFilteredProducts(filtered);
  }, [products, searchTerm, activeTab]);

  // Enter edit mode for selected products
  const handleEditClick = () => {
    if (selectedProductIds.length === 0) return;

    // Initialize reorder levels with current values
    const initialValues: Record<string, number> = {};
    selectedProductIds.forEach((id) => {
      const product = products.find((p) => p.id === id);
      if (product) {
        initialValues[id] = product.reorderLevel;
      }
    });

    setEditingReorderLevels(initialValues);
    setIsEditMode(true);
  };

  // Save all edited reorder levels
  const saveChanges = () => {
    // Update reorder levels for all edited products
    setProducts(
      products.map((p) => {
        if (p.id in editingReorderLevels) {
          const newReorderLevel = editingReorderLevels[p.id];
          return {
            ...p,
            reorderLevel: newReorderLevel,
            shortage:
              newReorderLevel > p.totalQuantity
                ? newReorderLevel - p.totalQuantity
                : 0,
            surplus:
              p.totalQuantity > newReorderLevel
                ? p.totalQuantity - newReorderLevel
                : 0,
          };
        }
        return p;
      })
    );

    // Exit edit mode
    setIsEditMode(false);
    setEditingReorderLevels({});
    setSelectedProductIds([]);
  };

  // Handle changing reorder level in edit mode
  const handleReorderLevelChange = (productId: string, value: number) => {
    setEditingReorderLevels((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Toggle select all visible products
  const toggleSelectAll = () => {
    const visibleProductIds = paginatedProducts.map((p) => p.id);

    if (visibleProductIds.every((id) => selectedProductIds.includes(id))) {
      // Deselect all visible products
      setSelectedProductIds((prev) =>
        prev.filter((id) => !visibleProductIds.includes(id))
      );
    } else {
      // Select all visible products
      setSelectedProductIds((prev) => {
        const newSelection = [...prev];
        visibleProductIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  const nextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      goToPage(pagination.currentPage + 1);
    }
  };

  const prevPage = () => {
    if (pagination.currentPage > 1) {
      goToPage(pagination.currentPage - 1);
    }
  };

  // Get paginated products
  const paginatedProducts = filteredProducts.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  // Cancel edit mode
  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingReorderLevels({});
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reorder Alerts</h1>
        <p className="text-gray-500 mt-1">
          Manage inventory reorder levels and view shortage alerts
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className={`px-4 h-12 border-gray-300 ${
                activeTab === "all"
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white"
              }`}
              onClick={() => setActiveTab("all")}
              disabled={isEditMode}
            >
              All Items
            </Button>
            <Button
              variant="outline"
              className={`px-4 h-12 border-gray-300 flex items-center gap-2 ${
                activeTab === "shortage"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-white"
              }`}
              onClick={() => setActiveTab("shortage")}
              disabled={isEditMode}
            >
              <AlertTriangle className="h-4 w-4" />
              Shortage
            </Button>
            <Button
              variant="outline"
              className={`px-4 h-12 border-gray-300 flex items-center gap-2 ${
                activeTab === "instock"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-white"
              }`}
              onClick={() => setActiveTab("instock")}
              disabled={isEditMode}
            >
              <CheckCircle className="h-4 w-4" />
              In Stock
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Search items..."
                className="pl-10 w-full h-12 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isEditMode}
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm("")}
                  disabled={isEditMode}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {isEditMode ? (
              <div className="flex gap-2">
                {/* <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button> */}
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white hover:text-white h-12 border-gray-300"
                  onClick={saveChanges}
                >
                  <Check className="h-4 w-4" />
                  Done Reorder Levels
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12 border-gray-300 bg-white"
                onClick={handleEditClick}
                disabled={selectedProductIds.length === 0}
              >
                <Edit className="h-4 w-4" />
                Edit Reorder Levels ({selectedProductIds.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <Card className="overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-semibold text-gray-700 uppercase">
                <th className="px-4 py-4 w-12">
                  <Checkbox
                    checked={
                      paginatedProducts.length > 0 &&
                      paginatedProducts.every((p) =>
                        selectedProductIds.includes(p.id)
                      )
                    }
                    onCheckedChange={toggleSelectAll}
                    disabled={isEditMode}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-4">Photo</th>
                <th className="px-6 py-4">
                  <div className="flex flex-col">
                    <span>Item Name</span>
                    <span className="font-normal text-xs text-gray-500 normal-case">
                      Item Category
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center">Quantity</th>
                <th className="px-6 py-4 text-center">Reorder Alert Level</th>
                <th className="px-6 py-4 text-center">
                  {activeTab === "instock" ? "Surplus" : "Shortage"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={selectedProductIds.includes(product.id)}
                        onCheckedChange={() =>
                          !isEditMode && toggleProductSelection(product.id)
                        }
                        disabled={isEditMode}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Avatar className="h-14 w-14 rounded-md">
                        <AvatarImage
                          src={product.image}
                          alt={product.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-md">
                          {product.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-base font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-lg">
                      {product.totalQuantity}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isEditMode && selectedProductIds.includes(product.id) ? (
                        <Input
                          type="number"
                          value={
                            editingReorderLevels[product.id] ||
                            product.reorderLevel
                          }
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 0) {
                              handleReorderLevelChange(product.id, value);
                            }
                          }}
                          className="w-24 text-center mx-auto"
                          min="0"
                        />
                      ) : (
                        <div className="text-blue-600 font-semibold text-lg">
                          {product.reorderLevel}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Recommended:{" "}
                        {Math.max(10, Math.round(product.totalQuantity * 0.2))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {activeTab === "instock" ||
                      product.totalQuantity >= product.reorderLevel ? (
                        <span className="text-green-500 font-semibold text-lg">
                          {product.surplus}
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold text-lg">
                          {product.shortage}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "No items found matching your search"
                      : "No items found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing{" "}
              {Math.min(
                filteredProducts.length,
                (pagination.currentPage - 1) * pagination.itemsPerPage + 1
              )}{" "}
              to{" "}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                filteredProducts.length
              )}{" "}
              of {filteredProducts.length} items
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 flex items-center justify-center"
                onClick={prevPage}
                disabled={pagination.currentPage === 1 || isEditMode}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page buttons */}
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  // Calculate which page numbers to show
                  let pageNum;

                  if (pagination.totalPages <= 5) {
                    // Show all pages if 5 or fewer
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    // Show 1-5 for first pages
                    pageNum = i + 1;
                  } else if (
                    pagination.currentPage >=
                    pagination.totalPages - 2
                  ) {
                    // Show last 5 pages for end pages
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    // Show range centered around current page
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={
                        pagination.currentPage === pageNum
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className={`h-8 w-8 p-0 flex items-center justify-center ${
                        pagination.currentPage === pageNum
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-white"
                      }`}
                      onClick={() => goToPage(pageNum)}
                      disabled={isEditMode}
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 flex items-center justify-center"
                onClick={nextPage}
                disabled={
                  pagination.currentPage === pagination.totalPages || isEditMode
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReorderAlerts;
