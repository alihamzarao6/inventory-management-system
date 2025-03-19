"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddProductForm from "@/components/products/AddProductForm";
import ProductDetailModal from "@/components/products/ProductDetailModal";
import ProductFilters from "@/components/products/ProductFilters";
import CustomerProductsTable from "@/components/customer/CustomerProductsTable";
import AddCustomerProductForm from "@/components/customer/AddCustomerProductForm";
import RemoveCustomerProductDialog from "@/components/customer/RemoveCustomerProductDialog";
import { Customer, CustomerProduct } from "@/types/customer";
import {
  Product,
  ProductFiltersT,
  PaginationState,
  ProductFormData,
} from "@/types/products";
import {
  getCustomerById,
  getProductsByCustomerId,
  getCustomerProductRelationship,
} from "@/constants/mockCustomers";
import useToast from "@/hooks/useToast";

const CustomerDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const customerId = params?.id as string;

  // State management
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFiltersT>({});
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    perPage: 5,
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
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [productToRemove, setProductToRemove] = useState<string | null>(null);

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Load customer and their products
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call with a delay
    setTimeout(() => {
      const customerData = getCustomerById(customerId);
      if (customerData) {
        setCustomer(customerData);
        const customerProducts = getProductsByCustomerId(customerId);
        setProducts(customerProducts);
        setPagination((prev) => ({
          ...prev,
          total: customerProducts.length,
        }));
      }
      setIsLoading(false);
    }, 300);
  }, [customerId]);

  // Apply filters and sorting
  useEffect(() => {
    if (!products.length) return;

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

  // Handle adding a product for this customer
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

  // Handle removing a product from this customer
  const handleRemoveProduct = (productId: string) => {
    setProductToRemove(productId);
    setRemoveDialogOpen(true);
  };

  // Confirm product removal
  const confirmRemoveProduct = () => {
    if (productToRemove) {
      // In a real app, this would be an API call
      setProducts((prev) => prev.filter((p) => p.id !== productToRemove));
      showToast("Product removed from customer", "success");
      setRemoveDialogOpen(false);
      setProductToRemove(null);
    }
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

  if (isLoading) {
    return (
      <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 w-96 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Customer Not Found
        </h1>
        <Button onClick={() => router.push("/customer")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
      </div>
    );
  }

  // Calculate current page data (pagination)
  const paginatedProducts = filteredProducts.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  return (
    <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Customer Header with Back Navigation */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4 -ml-4 text-gray-600"
          onClick={() => router.push("/customer")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {customer.name}
            </h1>
            <p className="text-gray-500">
              {customer.email} • {customer.phone}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              showToast(
                "Edit customer functionality will be added soon",
                "info"
              )
            }
          >
            <Edit className="mr-2 h-4 w-4" /> Edit Customer
          </Button>
        </div>
      </div>

      {/* Customer Details Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-start gap-6">
          {/* Customer Image */}
          <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={customer.image}
              alt={customer.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Customer Info */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="text-gray-900">{customer.address}</p>
              <p className="text-gray-900">
                {customer.city}, {customer.country}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact</h3>
              <p className="text-gray-900">{customer.email}</p>
              <p className="text-gray-900">{customer.phone}</p>
            </div>

            {customer.note && (
              <div className="md:col-span-2 bg-blue-50 p-3 rounded-lg mt-2">
                <h3 className="text-sm font-medium text-blue-600">Note</h3>
                <p className="text-gray-900">{customer.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Customer Products
          </h2>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className={
                isEditMode ? "bg-blue-50 text-blue-600 border-blue-200" : ""
              }
              onClick={handleToggleEditMode}
            >
              {isEditMode ? (
                <>Done Editing</>
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
        {products.length > 0 ? (
          <>
            <CustomerProductsTable
              products={paginatedProducts}
              customerId={customerId}
              onViewProductDetails={handleViewProductDetails}
              onRemoveCustomerProduct={handleRemoveProduct}
              onSortChange={handleSortChange}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              isEditMode={isEditMode}
              onSaveEdit={handleSaveEdit}
            />

            {/* Pagination */}
            {pagination.total > pagination.perPage && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                  Showing {Math.min(pagination.perPage, products.length)} of{" "}
                  {pagination.total} products
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>

                  {Array.from(
                    {
                      length: Math.ceil(pagination.total / pagination.perPage),
                    },
                    (_, i) => (
                      <Button
                        key={i}
                        variant={
                          pagination.page === i + 1 ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={
                      pagination.page * pagination.perPage >= pagination.total
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500 mb-4">
              No products associated with this customer yet
            </p>
            <Button onClick={() => setAddProductOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add First Product
            </Button>
          </div>
        )}
      </div>

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
          setSimilarNameWarning={setSimilarNameWarning}
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

      {/* Remove Customer Product Confirmation Dialog */}
      {productToRemove && (
        <RemoveCustomerProductDialog
          open={removeDialogOpen}
          onOpenChange={setRemoveDialogOpen}
          onConfirm={confirmRemoveProduct}
          productName={
            products.find((p) => p.id === productToRemove)?.name ||
            "this product"
          }
          customerName={customer.name}
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
  );
};

export default CustomerDetailPage;
