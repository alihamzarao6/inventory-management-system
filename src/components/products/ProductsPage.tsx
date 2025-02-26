"use client"
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Edit, Check } from "lucide-react";
import ProductsTable from "@/components/products/ProductsTable";
import ProductFiltersComponent from "@/components/products/ProductFilters";
import LocationFilters from "@/components/products/LocationFilters";
import AddProductForm from "@/components/products/AddProductForm";
import ProductDetailModal from "@/components/products/ProductDetailModal";
import { Button } from "@/components/ui/button";
import {
  Product,
  ProductFiltersT,
  PaginationState,
  ProductFormData,
} from "@/types/products";
import {
  MOCK_PRODUCTS,
  getProductsByLocationId,
  getProductsByCategory,
  getProductsByStockStatus,
  searchProductsByName,
} from "@/constants/mockProducts";
import useToast from "@/hooks/useToast";

const ProductsPage = () => {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
 const locationId = params?.id as string | undefined;

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFiltersT>({});
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    perPage: 10,
    total: 0,
  });

  // Modals
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [similarNameWarning, setSimilarNameWarning] = useState<string | null>(
    null
  );

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Load products based on locationId
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call with a delay
    setTimeout(() => {
      let productsData: Product[];

      if (locationId) {
        productsData = getProductsByLocationId(locationId);
      } else {
        productsData = [...MOCK_PRODUCTS];
      }

      setProducts(productsData);
      setPagination((prev) => ({
        ...prev,
        total: productsData.length,
      }));
      setIsLoading(false);
    }, 500);
  }, [locationId]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (filters.search) {
      result = searchProductsByName(filters.search);
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }

    // Apply stock status filter
    if (filters.stockStatus) {
      result = result.filter((p) => {
        const totalQuantity = p.locations.reduce(
          (sum, loc) => sum + loc.quantity,
          0
        );
        return filters.stockStatus === "In Stock"
          ? totalQuantity > 0
          : totalQuantity === 0;
      });
    }

    // Apply date range filter (simplified implementation)
    if (filters.dateRange) {
      // This would typically involve more complex date filtering
      // For simplicity, we're just showing the concept
      if (filters.dateRange.type === "today") {
        const today = new Date().toISOString().split("T")[0];
        result = result.filter((p) => p.createdAt.startsWith(today));
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortColumn) {
        case "name":
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case "quantity":
          valueA = a.locations.reduce((sum, loc) => sum + loc.quantity, 0);
          valueB = b.locations.reduce((sum, loc) => sum + loc.quantity, 0);
          break;
        case "costPrice":
          valueA = a.costPrice;
          valueB = b.costPrice;
          break;
        case "wholesalePrice":
          valueA = a.wholesalePrice;
          valueB = b.wholesalePrice;
          break;
        case "retailPrice":
          valueA = a.retailPrice;
          valueB = b.retailPrice;
          break;
        case "createdAt":
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredProducts(result);
  }, [products, filters, sortColumn, sortDirection]);

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: ProductFiltersT) => {
    setFilters(newFilters);
    setPagination((prev) => ({
      ...prev,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle location filter
  const handleLocationFilter = (locId: string, isCustomer?: boolean) => {
    if (isCustomer) {
      // This would typically filter by customer ID
      showToast(
        "Customer filtering will be implemented in future updates",
        "info"
      );
    } else {
      router.push(`/products/${locId}`);
    }
  };

  // Handle sort column change
  const handleSortChange = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Handle product details view
  const handleViewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  };

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setAddProductOpen(true);
  };

  // Handle inline edit mode toggle
  const handleToggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  // Handle save after inline edit
  const handleSaveEdit = () => {
    showToast("Changes saved successfully", "success");
    setIsEditMode(false);
  };

  // Handle transfer, stock adjust, incoming items
  const handleTransfer = (product: Product, locationId: string) => {
    showToast(`Transfer functionality will be implemented soon`, "info");
  };

  const handleStockAdjust = (product: Product, locationId: string) => {
    showToast(`Stock adjust functionality will be implemented soon`, "info");
  };

  const handleIncomingItems = (product: Product, locationId: string) => {
    showToast(`Incoming items functionality will be implemented soon`, "info");
  };

  // Check for similar product names
  const checkSimilarNames = (name: string) => {
    const similarProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(p.name.toLowerCase())
    );

    if (similarProducts.length > 0) {
      setSimilarNameWarning(
        `Found ${similarProducts.length} similar item names`
      );
    } else {
      setSimilarNameWarning(null);
    }
  };

  const handleAddProduct = async (
    data: ProductFormData & { image: string }
  ) => {
    console.log(data, data?.image);
    return;
  };

  // Calculate current page data (pagination)
  const paginatedProducts = filteredProducts.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  return (
    <>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500">
              {locationId
                ? "Products for selected location"
                : "Manage your inventory products"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className={
                isEditMode ? "bg-blue-50 text-blue-600 border-blue-200" : ""
              }
              onClick={handleToggleEditMode}
            >
              {isEditMode ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Done Editing
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" /> Edit Products
                </>
              )}
            </Button>
            <Button onClick={() => setAddProductOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <ProductFiltersComponent
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Products Table */}
        <ProductsTable
          products={paginatedProducts}
          filters={filters}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEditProduct={handleEditProduct}
          onViewProductDetails={handleViewProductDetails}
          onSortChange={handleSortChange}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          isEditMode={isEditMode}
          onSaveEdit={handleSaveEdit}
        />

        {/* Add/Edit Product Modal */}
        {addProductOpen && (
          <AddProductForm
            open={addProductOpen}
            onOpenChange={setAddProductOpen}
            onSubmit={handleAddProduct}
            initialData={
              selectedProduct
                ? {
                    name: selectedProduct.name,
                    category: selectedProduct.category,
                    initialQuantity: 0,
                    reorderLevel: selectedProduct.reorderLevel,
                    initialLocationId:
                      selectedProduct.locations[0]?.locationId || "",
                    costPrice: selectedProduct.costPrice,
                    wholesalePrice: selectedProduct.wholesalePrice,
                    retailPrice: selectedProduct.retailPrice,
                    note: selectedProduct.note,
                    image: selectedProduct.image,
                  }
                : undefined
            }
            similarNameWarning={similarNameWarning}
          />
        )}

        {/* Product Detail Modal */}
        {selectedProduct && detailModalOpen && (
          <ProductDetailModal
            product={selectedProduct}
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
            onEdit={handleEditProduct}
            onTransfer={handleTransfer}
            onStockAdjust={handleStockAdjust}
            onIncomingItems={handleIncomingItems}
          />
        )}

        {/* Floating add button for mobile */}
        <div className="fixed right-6 bottom-6 md:hidden">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setAddProductOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
