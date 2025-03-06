"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationFilter from "@/components/stock-adjustment/LocationFilter";
import IncomingItemsTable from "@/components/incoming-items/IncomingItemsTable";
import AdjustmentFormModal from "@/components/incoming-items/AdjustmentFormModal";
import AddProductForm from "@/components/products/AddProductForm";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useToast from "@/hooks/useToast";
import { StockAdjustmentItem } from "@/types/stockAdjustment";
import { Product, ProductFiltersT } from "@/types/products";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { debounce } from "lodash";
import IncomingItemsAddProductsModal from "@/components/incoming-items/IncomingItemsAddProductsModal";
import ProductFilters from "@/components/products/ProductFilters";

// Mock suppliers data
const MOCK_SUPPLIERS = [
  { id: "sup-1", name: "ABC Suppliers" },
  { id: "sup-2", name: "XYZ Distributors" },
  { id: "sup-3", name: "Global Trade Partners" },
  { id: "sup-4", name: "Quality Imports Ltd" },
  { id: "sup-5", name: "Prime Vendors Inc" },
];

const IncomingItemsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();

  // State management
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [locationName, setLocationName] = useState<string>("");
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<StockAdjustmentItem[]>([]);
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<StockAdjustmentItem[]>([]);
  const [filters, setFilters] = useState<ProductFiltersT>({});

  // Modals
  const [addProductsModalOpen, setAddProductsModalOpen] = useState(false);
  const [adjustmentFormOpen, setAdjustmentFormOpen] = useState(false);
  const [addProductFormOpen, setAddProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Filter items when filters change with debounce
  const debouncedFilter = React.useCallback(
    debounce((itemFilters: ProductFiltersT) => {
      if (!selectedItems.length) return;

      let filtered = [...selectedItems];

      // Apply search filter from ProductFilters
      if (itemFilters.search && itemFilters.search.trim()) {
        const lowerQuery = itemFilters.search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.productName.toLowerCase().includes(lowerQuery) ||
            item.category.toLowerCase().includes(lowerQuery)
        );
      }

      // Apply category filter
      if (itemFilters.category) {
        filtered = filtered.filter(
          (item) => item.category === itemFilters.category
        );
      }

      // Apply date filter if needed
      // (not implementing for this demo since we don't have date data on items)

      // Apply stock status filter if needed
      if (itemFilters.stockStatus) {
        // Apply the stock status logic here if needed
      }

      setFilteredItems(filtered);
    }, 300),
    [selectedItems]
  );

  // Update filtered items when filters or selected items change
  useEffect(() => {
    debouncedFilter(filters);

    // Clean up the debounced function on unmount
    return () => {
      debouncedFilter.cancel();
    };
  }, [filters, selectedItems, debouncedFilter]);

  // Handle filter changes
  const handleFilterChange = (newFilters: ProductFiltersT) => {
    setFilters(newFilters);
  };

  // Load products when location is selected
  useEffect(() => {
    if (!selectedLocationId) {
      setAvailableProducts([]);
      setLocationName("");
      setSelectedItems([]);
      setCheckedItemIds([]);
      setFilteredItems([]);
      return;
    }

    setIsLoading(true);
    console.log("Loading products for location:", selectedLocationId);

    // Get location name
    let locationDisplayName = "Selected Location";

    if (selectedLocationId.startsWith("sub-")) {
      // Get sub-location name
      const subLocation = MOCK_SUB_LOCATIONS.find(
        (sl) => sl.id === selectedLocationId
      );
      if (subLocation) {
        locationDisplayName = subLocation.name;
      }
    } else {
      // Get main location name
      const location = MOCK_LOCATIONS.find(
        (loc) => loc.id === selectedLocationId
      );
      if (location) {
        locationDisplayName = location.name;
      }
    }

    setLocationName(locationDisplayName);

    // Simulate API call delay
    setTimeout(() => {
      let locationProducts: Product[] = [];

      // Different logic based on whether it's a main location or sub-location
      if (selectedLocationId.startsWith("sub-")) {
        // For sub-location: Get only products in this specific sub-location
        console.log("Getting products for sub-location:", selectedLocationId);

        locationProducts = MOCK_PRODUCTS.filter((product) =>
          product.locations.some(
            (loc) => loc.locationId === selectedLocationId && loc.isSubLocation
          )
        );
      } else {
        // For main location: Get products in this location OR any of its sub-locations
        console.log("Getting products for main location:", selectedLocationId);

        // Get sub-location IDs for this main location
        const subLocationIds = MOCK_SUB_LOCATIONS.filter(
          (sl) => sl.parentId === selectedLocationId
        ).map((sl) => sl.id);

        console.log("Sub-location IDs:", subLocationIds);

        // Get products that are in this main location or any of its sub-locations
        locationProducts = MOCK_PRODUCTS.filter((product) => {
          // Check if product is in the main location
          const inMainLocation = product.locations.some(
            (loc) => loc.locationId === selectedLocationId && !loc.isSubLocation
          );

          // Check if product is in any sub-location of this main location
          const inSubLocation = product.locations.some(
            (loc) =>
              loc.isSubLocation && subLocationIds.includes(loc.locationId)
          );

          return inMainLocation || inSubLocation;
        });
      }

      console.log(
        `Found ${locationProducts.length} products for ${locationDisplayName}`
      );
      setAvailableProducts(locationProducts);

      // Convert available products to adjustment items
      const adjustmentItems: StockAdjustmentItem[] = locationProducts.map(
        (product) => {
          // Calculate current quantity for this product at the selected location
          let currentQuantity = 0;

          if (selectedLocationId.startsWith("sub-")) {
            // For sub-location, get quantity specific to this sub-location
            const locationData = product.locations.find(
              (loc) =>
                loc.locationId === selectedLocationId && loc.isSubLocation
            );
            currentQuantity = locationData?.quantity || 0;
          } else {
            // For main location, sum quantities
            const subLocationIds = MOCK_SUB_LOCATIONS.filter(
              (sl) => sl.parentId === selectedLocationId
            ).map((sl) => sl.id);

            // Sum the quantities
            product.locations.forEach((loc) => {
              // If in the main location
              if (loc.locationId === selectedLocationId && !loc.isSubLocation) {
                currentQuantity += loc.quantity;
              }
              // If in a sub-location of this main location
              else if (
                loc.isSubLocation &&
                subLocationIds.includes(loc.locationId)
              ) {
                currentQuantity += loc.quantity;
              }
            });
          }

          return {
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            category: product.category,
            adjustmentType: "Add", // Default adjustment type for incoming items
            quantity: 0, // Default quantity (no adjustment yet)
            previousQuantity: currentQuantity,
            newQuantity: currentQuantity,
            reasonId: "", // No reason needed for incoming items
          };
        }
      );

      setSelectedItems(adjustmentItems);
      setFilteredItems(adjustmentItems);
      setIsLoading(false);
    }, 500);
  }, [selectedLocationId]);

  // Handle location selection
  const handleLocationSelect = (locationId: string) => {
    console.log("Location selected:", locationId);
    setSelectedLocationId(locationId);
  };

  // Toggle item selection in the table
  const toggleItemSelection = (productId: string) => {
    setCheckedItemIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Open add products modal
  const handleAddProducts = () => {
    if (!selectedLocationId) {
      showToast("Please select a location first", "error");
      return;
    }

    setAddProductsModalOpen(true);
  };

  // Handle adding a new product
  const handleAddNewProduct = () => {
    if (!selectedLocationId) {
      showToast("Please select a location first", "error");
      return;
    }

    setAddProductsModalOpen(false); // Close the add products modal first
    setTimeout(() => {
      setAddProductFormOpen(true); // Then open the add product form
    }, 100);
  };

  // Handle product creation
  const handleProductCreated = (productData: any) => {
    // In a real app, this would call an API to create the product
    // For this mock, we'll create a new product locally

    console.log("New product created:", productData);

    // Create a new mock product
    const newProduct: Product = {
      id: `prod-new-${Date.now()}`,
      name: productData.name,
      category: productData.category,
      image: productData.image,
      costPrice: productData.costPrice,
      wholesalePrice: productData.wholesalePrice,
      retailPrice: productData.retailPrice,
      retailPriceUSD: productData.retailPrice / 17.5, // Convert from ZMW to USD
      locations: [
        {
          locationId: productData.initialLocationId,
          quantity: productData.initialQuantity,
          isSubLocation: productData.initialLocationId.startsWith("sub-"),
        },
      ],
      reorderLevel: productData.reorderLevel,
      note: productData.note,
      createdAt: new Date().toISOString(),
    };

    // Create new adjustment item
    const newAdjustmentItem: StockAdjustmentItem = {
      productId: newProduct.id,
      productName: newProduct.name,
      productImage: newProduct.image,
      category: newProduct.category,
      adjustmentType: "Add",
      quantity: productData.initialQuantity,
      previousQuantity: 0,
      newQuantity: productData.initialQuantity,
      reasonId: "", // No reason needed for incoming items
    };

    // Add to available products and selected items
    setAvailableProducts((prev) => [...prev, newProduct]);
    setSelectedItems((prev) => [...prev, newAdjustmentItem]);
    setFilteredItems((prev) => [...prev, newAdjustmentItem]);

    // Auto-check the new item
    setCheckedItemIds((prev) => [...prev, newProduct.id]);

    showToast("New product added successfully", "success");
  };

  // Handle selection changes from the modal
  const handleSelectionChanged = (selectedProductIds: string[]) => {
    setCheckedItemIds(selectedProductIds);
    setAddProductsModalOpen(false);
  };

  // Open adjustment form for editing
  const handleEditItem = (productId: string) => {
    // Only allow editing checked items
    if (!checkedItemIds.includes(productId)) {
      showToast("Please select this item first", "warning");
      return;
    }

    setEditingProductId(productId);
    setAdjustmentFormOpen(true);
  };

  // Handle saving adjustment from form
  const handleAdjustmentSaved = (item: StockAdjustmentItem) => {
    const updatedItems = selectedItems.map((existingItem) =>
      existingItem.productId === item.productId ? item : existingItem
    );
    setSelectedItems(updatedItems);
    setFilteredItems(updatedItems);
    setAdjustmentFormOpen(false);
    setEditingProductId(null);
  };

  // Prepare to delete an item
  const handleDeleteItemClick = (productId: string) => {
    // Only allow deleting checked items
    if (!checkedItemIds.includes(productId)) {
      showToast("Please select this item first", "warning");
      return;
    }

    setItemToDelete(productId);
    setDeleteConfirmOpen(true);
  };

  // Confirm deletion of an item
  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      // Remove from checked items
      setCheckedItemIds((prev) => prev.filter((id) => id !== itemToDelete));

      // Remove from selected and filtered items
      setSelectedItems(
        selectedItems.filter((item) => item.productId !== itemToDelete)
      );
      setFilteredItems(
        filteredItems.filter((item) => item.productId !== itemToDelete)
      );

      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      showToast("Item removed from selection", "success");
    }
  };

  // Handle completing the incoming items process
  const handleComplete = () => {
    if (checkedItemIds.length === 0) {
      showToast("Please select at least one item", "error");
      return;
    }

    // Get only the checked items
    const itemsToProcess = selectedItems.filter((item) =>
      checkedItemIds.includes(item.productId)
    );

    // Check if all checked items have adjustments
    const invalidItems = itemsToProcess.filter((item) => item.quantity === 0);

    if (invalidItems.length > 0) {
      showToast("All selected items must have adjustment quantities", "error");
      return;
    }

    // Validate supplier selection
    if (!selectedSupplierId) {
      showToast("Please select a supplier", "error");
      return;
    }

    // Create the incoming items record
    const incomingItemsRecord = {
      id: `incoming-${Date.now()}`,
      locationId: selectedLocationId,
      locationName: locationName,
      supplierId: selectedSupplierId,
      supplierName:
        MOCK_SUPPLIERS.find((s) => s.id === selectedSupplierId)?.name || "",
      items: itemsToProcess,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: "completed",
      note: note,
    };

    console.log("Incoming items record:", incomingItemsRecord);

    // In a real app, we would store this in state/context or make an API call
    // For this demo, just go to the completed page
    router.push(`/incoming-items/completed?id=${incomingItemsRecord.id}`);
  };

  return (
    <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incoming Items</h1>
          <p className="text-gray-500">
            {locationName
              ? `Add new inventory to ${locationName}`
              : "Select a location to add new inventory"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-gray-200"
            onClick={() => router.push("/incoming-items/history")}
          >
            View History
          </Button>
          <Button
            onClick={handleAddProducts}
            disabled={!selectedLocationId || availableProducts.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" /> Add/Remove Products
          </Button>
        </div>
      </div>

      {/* Location Selector */}
      <div className="mb-6 max-w-xl">
        <LocationFilter
          selectedLocationId={selectedLocationId}
          onLocationSelect={handleLocationSelect}
          placeholder="Select a location to add inventory"
        />
      </div>

      {/* Product Filters */}
      <ProductFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Supplier Selection */}
      <div className="mt-4 mb-6 w-60">
        <Select
          value={selectedSupplierId}
          onValueChange={setSelectedSupplierId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Supplier" />
          </SelectTrigger>
          <SelectContent>
            {MOCK_SUPPLIERS.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Incoming Items Table */}
      <IncomingItemsTable
        items={filteredItems}
        checkedItemIds={checkedItemIds}
        isLoading={isLoading}
        onToggleItem={toggleItemSelection}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItemClick}
      />

      {/* Note Field */}
      <div className="mt-6">
        <textarea
          placeholder="Add notes about this incoming inventory..."
          className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="ghost"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          className="bg-green-500 hover:bg-green-600 text-white px-8"
          disabled={checkedItemIds.length === 0}
          onClick={handleComplete}
        >
          Complete Incoming Items
        </Button>
      </div>

      {/* Add Products Modal */}
      <IncomingItemsAddProductsModal
        open={addProductsModalOpen}
        onOpenChange={setAddProductsModalOpen}
        locationId={selectedLocationId}
        checkedItemIds={checkedItemIds}
        onSelectionChanged={handleSelectionChanged}
        availableProducts={availableProducts}
        onAddNewProduct={handleAddNewProduct}
      />

      {/* Add New Product Form */}
      <AddProductForm
        open={addProductFormOpen}
        onOpenChange={setAddProductFormOpen}
        onSubmit={handleProductCreated}
        initialData={
          selectedLocationId
            ? { initialLocationId: selectedLocationId }
            : undefined
        }
      />

      {/* Adjustment Form Modal */}
      <AdjustmentFormModal
        open={adjustmentFormOpen}
        onOpenChange={setAdjustmentFormOpen}
        item={
          selectedItems.find((item) => item.productId === editingProductId) ||
          null
        }
        onSave={handleAdjustmentSaved}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Remove Item"
        description="Are you sure you want to remove this item from the incoming list?"
        confirmText="Remove"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
};

export default IncomingItemsPage;
