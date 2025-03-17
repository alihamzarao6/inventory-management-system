"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationFilter from "./LocationFilter"; // Using dedicated component
import StockAdjustmentTable from "@/components/stock-adjustment/StockAdjustmentTable";
import AddProductsModal from "@/components/stock-adjustment/AddProductsModal";
import AdjustmentFormModal from "@/components/stock-adjustment/AdjustmentFormModal";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import useToast from "@/hooks/useToast";
import { StockAdjustment, StockAdjustmentItem } from "@/types/stockAdjustment";
import { Product } from "@/types/products";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";

const StockAdjustmentPage = () => {
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

  // Modals
  const [addProductsModalOpen, setAddProductsModalOpen] = useState(false);
  const [adjustmentFormOpen, setAdjustmentFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Load products when location is selected
  useEffect(() => {
    if (!selectedLocationId) {
      setAvailableProducts([]);
      setLocationName("");
      setSelectedItems([]);
      setCheckedItemIds([]);
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
            adjustmentType: "Add", // Default adjustment type
            quantity: 0, // Default quantity (no adjustment yet)
            previousQuantity: currentQuantity,
            newQuantity: currentQuantity,
            reasonId: "", // No reason selected yet
          };
        }
      );

      setSelectedItems(adjustmentItems);
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

    if (availableProducts.length === 0) {
      showToast("No products available in this location", "warning");
      return;
    }

    setAddProductsModalOpen(true);
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

      // Remove from selected items if needed
      // Optionally keep the item in selectedItems but just uncheck it
      // If you want to fully remove it:
      // setSelectedItems(selectedItems.filter(item => item.productId !== itemToDelete));

      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      showToast("Item removed from selection", "success");
    }
  };

  // Handle completing adjustment
  const handleCompleteAdjustment = () => {
    if (checkedItemIds.length === 0) {
      showToast("Please select at least one item to adjust", "error");
      return;
    }

    // Get only the checked items
    const itemsToAdjust = selectedItems.filter((item) =>
      checkedItemIds.includes(item.productId)
    );

    // Check if all checked items have adjustments and reasons
    const invalidItems = itemsToAdjust.filter(
      (item) => item.quantity === 0 || !item.reasonId
    );

    if (invalidItems.length > 0) {
      showToast(
        "All selected items must have adjustments and reasons",
        "error"
      );
      return;
    }

    // Create the adjustment object with only checked items
    const adjustment: StockAdjustment = {
      id: `adj-${Date.now()}`,
      locationId: selectedLocationId,
      locationName: locationName,
      items: itemsToAdjust,
      createdAt: new Date().toISOString(),
      status: "pending",
      note: note,
    };

    // We would store this in state/context in a real app
    // For now, just navigate to approval screen with query params
    router.push(`/stock-adjustment/approve?id=${adjustment.id}`);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Adjust</h1>
          <p className="text-gray-500">
            {locationName
              ? `Adjust inventory for ${locationName}`
              : "Select a location to adjust inventory"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-gray-200"
            onClick={() => router.push("/stock-adjustment/history")}
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

      {/* Location Selector using dedicated LocationFilter component */}
      <div className="mb-6 max-w-xl">
        <LocationFilter
          selectedLocationId={selectedLocationId}
          onLocationSelect={handleLocationSelect}
          placeholder="Select a location to adjust inventory"
        />
      </div>

      {/* Adjustment Items Table */}
      <StockAdjustmentTable
        items={selectedItems}
        checkedItemIds={checkedItemIds}
        isLoading={isLoading}
        onToggleItem={toggleItemSelection}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItemClick}
      />

      {/* Note Field */}
      <div className="mt-6">
        <textarea
          placeholder="Add notes about this adjustment..."
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
          onClick={handleCompleteAdjustment}
        >
          Complete Stock Adjust
        </Button>
      </div>

      {/* Add Products Modal */}
      <AddProductsModal
        open={addProductsModalOpen}
        onOpenChange={setAddProductsModalOpen}
        locationId={selectedLocationId}
        checkedItemIds={checkedItemIds}
        onSelectionChanged={handleSelectionChanged}
        availableProducts={availableProducts}
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
        description="Are you sure you want to remove this item from the adjustment?"
        confirmText="Remove"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
};

export default StockAdjustmentPage;
