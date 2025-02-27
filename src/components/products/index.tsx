"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Edit, Check } from "lucide-react";
import ProductsTable from "@/components/products/ProductsTable";
import ProductFilters from "@/components/products/ProductFilters";
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
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
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
    perPage: 5, // Changed to 5 to match requirements
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
        // Handle both location and sub-location IDs
        if (locationId.startsWith("sub-")) {
          // It's a sub-location
          productsData = MOCK_PRODUCTS.filter((p) =>
            p.locations.some(
              (loc) => loc.locationId === locationId && loc.isSubLocation
            )
          );
        } else {
          // Get products from this location and its sub-locations
          productsData = MOCK_PRODUCTS.filter((p) =>
            p.locations.some(
              (loc) =>
                (loc.locationId === locationId && !loc.isSubLocation) ||
                (loc.isSubLocation &&
                  MOCK_SUB_LOCATIONS.some(
                    (sub) =>
                      sub.id === loc.locationId && sub.parentId === locationId
                  ))
            )
          );
        }
      } else {
        productsData = [...MOCK_PRODUCTS];
      }

      setProducts(productsData);
      setPagination((prev) => ({
        ...prev,
        total: productsData.length,
        page: 1, // Reset to first page when changing location
      }));
      setIsLoading(false);
    }, 300);
  }, [locationId]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.category.toLowerCase().includes(searchTerm)
      );
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

    // Apply date range filter
    if (filters.dateRange?.startDate && filters.dateRange?.endDate) {
      const startDate = new Date(filters.dateRange.startDate).getTime();
      const endDate = new Date(filters.dateRange.endDate).getTime();

      result = result.filter((p) => {
        const productDate = new Date(p.createdAt).getTime();
        return productDate >= startDate && productDate <= endDate;
      });
    }

    // Apply location filter from dropdown (if not already filtered by URL param)
    if (filters.locationId && !locationId) {
      if (filters.isCustomer) {
        // Filter for customer - would be implemented in a real API
        result = result.filter((p) => p.id.includes("2")); // Just for demo
      } else if (filters.locationId.startsWith("sub-")) {
        // Sub-location filter
        result = result.filter((p) =>
          p.locations.some(
            (loc) => loc.locationId === filters.locationId && loc.isSubLocation
          )
        );
      } else {
        // Main location filter
        result = result.filter((p) =>
          p.locations.some(
            (loc) =>
              (loc.locationId === filters.locationId && !loc.isSubLocation) ||
              (loc.isSubLocation &&
                MOCK_SUB_LOCATIONS.some(
                  (sub) =>
                    sub.id === loc.locationId &&
                    sub.parentId === filters.locationId
                ))
          )
        );
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
  }, [products, filters, sortColumn, sortDirection, locationId]);

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
      // Apply customer filter via the filters state
      setFilters({
        ...filters,
        locationId: locId,
        isCustomer: true,
      });
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
    // In a real app, this would be an API call
    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: data.name,
      category: data.category,
      image: data.image,
      costPrice: data.costPrice,
      wholesalePrice: data.wholesalePrice,
      retailPrice: data.retailPrice,
      retailPriceUSD: data.retailPrice / 17.5, // Converting back to USD for display
      reorderLevel: data.reorderLevel,
      locations: [
        {
          locationId: data.initialLocationId,
          quantity: data.initialQuantity,
          isSubLocation: data.initialLocationId.includes("sub-"),
        },
      ],
      note: data.note,
      createdAt: new Date().toISOString(),
    };

    // Add to products list
    setProducts((prev) => [newProduct, ...prev]);
    showToast("Product added successfully", "success");
  };

  // Get location name for the header
  const getLocationName = () => {
    if (locationId) {
      if (locationId.startsWith("sub-")) {
        const subLocation = MOCK_SUB_LOCATIONS.find(
          (sl) => sl.id === locationId
        );
        return subLocation
          ? `Products for ${subLocation.name}`
          : "Products for Selected Location";
      } else {
        const location = MOCK_LOCATIONS.find((l) => l.id === locationId);
        return location
          ? `Products for ${location.name}`
          : "Products for Selected Location";
      }
    }
    return "Manage your inventory products";
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
            <p className="text-gray-500">{getLocationName()}</p>
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
        <ProductFilters filters={filters} onFilterChange={handleFilterChange} />

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
