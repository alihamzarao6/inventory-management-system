"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Share,
  ChevronDown,
  ArrowRight,
  Check,
  ChevronLeft,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import LocationFilters from "@/components/products/LocationFilters";
import AdjustmentFormModal from "@/components/stock-adjustment/AdjustmentFormModal";
import AddProductsModal from "@/components/stock-adjustment/AddProductsModal";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import ProductDetailModal from "@/components/products/ProductDetailModal";
import { Steps, Step } from "@/components/ui/steps";
import { createHandleExport } from "@/utils/pdfExport";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useToast from "@/hooks/useToast";
import { StockAdjustmentItem, StockAdjustment } from "@/types/stockAdjustment";
import { Product } from "@/types/products";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { ADJUSTMENT_REASONS } from "@/constants/mockStockAdjustments";
import { cn } from "@/utils";

const StockAdjustmentPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // State management
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [isLocationFilterOpen, setIsLocationFilterOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<StockAdjustmentItem[]>([]);
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // states to show product detail modal
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals
  const [addProductsModalOpen, setAddProductsModalOpen] = useState(false);
  const [adjustmentFormOpen, setAdjustmentFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Export functionality
  const handleExport = createHandleExport(
    // @ts-ignore
    printRef,
    "stock-adjustment",
    "report"
  );

  // Get location filter label
  const getLocationFilterLabel = () => {
    if (selectedLocationIds.length === 0) {
      return "Select Location";
    }

    if (selectedLocationIds.length === 1) {
      const locationId = selectedLocationIds[0];

      // Check if it's a main location
      const location = MOCK_LOCATIONS.find((loc) => loc.id === locationId);
      if (location) {
        return location.name;
      }

      // Must be a sub-location
      const subLocation = MOCK_SUB_LOCATIONS.find((sl) => sl.id === locationId);
      if (subLocation) {
        return subLocation.name;
      }

      return "Location Selected";
    }

    return `${selectedLocationIds.length} Locations`;
  };

  // Get location names for display
  const getLocationNames = () => {
    return selectedLocationIds
      .map((id) => {
        // Check if it's a main location
        const mainLocation = MOCK_LOCATIONS.find((loc) => loc.id === id);
        if (mainLocation) return mainLocation.name;

        // Check if it's a sublocation
        const subLocation = MOCK_SUB_LOCATIONS.find(
          (subloc) => subloc.id === id
        );
        if (subLocation) {
          const parent = MOCK_LOCATIONS.find(
            (loc) => loc.id === subLocation.parentId
          );
          return `${subLocation.name} (${parent?.name || "Unknown"})`;
        }

        return "Unknown Location";
      })
      .join(" / ");
  };

  // Load products when location is selected
  useEffect(() => {
    if (selectedLocationIds.length === 0) {
      setAvailableProducts([]);
      setSelectedItems([]);
      setCheckedItemIds([]);
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      let locationProducts: Product[] = [];
      const locationIds = selectedLocationIds;

      // First handle regular locations
      locationIds.forEach((locationId) => {
        // For main location: Get products in this location OR any of its sub-locations
        if (!locationId.startsWith("sub-")) {
          // Get sub-location IDs for this main location
          const subLocationIds = MOCK_SUB_LOCATIONS.filter(
            (sl) => sl.parentId === locationId
          ).map((sl) => sl.id);

          // Get products that are in this main location or any of its sub-locations
          const products = MOCK_PRODUCTS.filter((product) => {
            // Check if product is in the main location
            const inMainLocation = product.locations.some(
              (loc) => loc.locationId === locationId && !loc.isSubLocation
            );

            // Check if product is in any sub-location of this main location
            const inSubLocation = product.locations.some(
              (loc) =>
                loc.isSubLocation && subLocationIds.includes(loc.locationId)
            );

            return inMainLocation || inSubLocation;
          });

          locationProducts = [...locationProducts, ...products];
        } else {
          // For sub-location: Get only products in this specific sub-location
          const products = MOCK_PRODUCTS.filter((product) =>
            product.locations.some(
              (loc) => loc.locationId === locationId && loc.isSubLocation
            )
          );

          locationProducts = [...locationProducts, ...products];
        }
      });

      // Remove duplicates by ID
      locationProducts = locationProducts.filter(
        (product, index, self) =>
          index === self.findIndex((p) => p.id === product.id)
      );

      // Convert available products to adjustment items
      const adjustmentItems: StockAdjustmentItem[] = locationProducts.map(
        (product) => {
          // Calculate current quantity for this product at all selected locations
          let currentQuantity = 0;

          // Get quantity from all selected locations
          locationIds.forEach((locationId) => {
            if (locationId.startsWith("sub-")) {
              // For sub-location, get quantity specific to this sub-location
              const locationData = product.locations.find(
                (loc) => loc.locationId === locationId && loc.isSubLocation
              );
              if (locationData) {
                currentQuantity += locationData.quantity;
              }
            } else {
              // For main location, get quantity from main and all sub-locations
              const mainLocationData = product.locations.find(
                (loc) => loc.locationId === locationId && !loc.isSubLocation
              );
              if (mainLocationData) {
                currentQuantity += mainLocationData.quantity;
              }

              // Add quantities from all sub-locations of this main location
              const subLocationIds = MOCK_SUB_LOCATIONS.filter(
                (sl) => sl.parentId === locationId
              ).map((sl) => sl.id);

              product.locations.forEach((loc) => {
                if (
                  loc.isSubLocation &&
                  subLocationIds.includes(loc.locationId)
                ) {
                  currentQuantity += loc.quantity;
                }
              });
            }
          });

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

      setAvailableProducts(locationProducts);
      setSelectedItems(adjustmentItems);
      setIsLoading(false);
    }, 500);
  }, [selectedLocationIds]);

  // Filter items by search term
  const getFilteredItems = () => {
    // For step 4 (Review), only show items that were selected in previous steps
    if (currentStep === 4) {
      let items = selectedItems.filter((item) =>
        checkedItemIds.includes(item.productId)
      );

      // Apply search filter if needed
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        items = items.filter(
          (item) =>
            item.productName.toLowerCase().includes(term) ||
            item.category.toLowerCase().includes(term)
        );
      }

      return items;
    }

    // For other steps
    const shownItems =
      currentStep === 2
        ? selectedItems // Show all items in step 2
        : selectedItems.filter((item) =>
            checkedItemIds.includes(item.productId)
          ); // Show only checked items in step 3

    if (!searchTerm.trim()) {
      return shownItems;
    }

    const term = searchTerm.toLowerCase();
    return shownItems.filter(
      (item) =>
        item.productName.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
    );
  };

  // Handle location selection
  const handleLocationSelect = (locationIds: string[]) => {
    setSelectedLocationIds(locationIds);
  };

  // Toggle item selection in the table
  const toggleItemSelection = (productId: string) => {
    setCheckedItemIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle selection for all visible products
  const toggleSelectAll = () => {
    const displayedItems = getFilteredItems();

    if (displayedItems.length === 0) return;

    // Check if all currently displayed items are selected
    const allDisplayedSelected = displayedItems.every((item) =>
      checkedItemIds.includes(item.productId)
    );

    if (allDisplayedSelected) {
      // Unselect all displayed items
      setCheckedItemIds((prev) =>
        prev.filter(
          (id) => !displayedItems.some((item) => item.productId === id)
        )
      );
    } else {
      // Select all displayed items
      const displayedIds = displayedItems.map((item) => item.productId);
      setCheckedItemIds((prev) => {
        // Keep items that are already selected but not currently displayed
        const remainingSelected = prev.filter(
          (id) => !displayedItems.some((item) => item.productId === id)
        );

        // Add all displayed items
        return [...remainingSelected, ...displayedIds];
      });
    }
  };

  // Open add products modal for adding additional products
  const handleAddProducts = () => {
    if (selectedLocationIds.length === 0) {
      showToast("Please select at least one location first", "error");
      return;
    }

    if (availableProducts.length === 0) {
      showToast("No products available in this location", "warning");
      return;
    }

    setAddProductsModalOpen(true);
  };

  // Handle selection changes from add products modal
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
      locationId: selectedLocationIds[0] || "", // Use first location ID or empty string
      locationName: getLocationNames(),
      items: itemsToAdjust,
      createdAt: new Date().toISOString(),
      status: "pending",
      note: note,
    };

    // In a real app, this would be an API call
    console.log("Submitting adjustment:", adjustment);

    // Navigate to approval screen with query params
    router.push(`/stock-adjustment/approve?id=${adjustment.id}`);
  };

  // Check if current step is valid to proceed
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedLocationIds.length > 0;
      case 2:
        return checkedItemIds.length > 0;
      case 3:
        // Check if all selected items have both quantity and reason
        const itemsToCheck = selectedItems.filter((item) =>
          checkedItemIds.includes(item.productId)
        );
        return itemsToCheck.every(
          (item) => item.quantity > 0 && !!item.reasonId
        );
      case 4:
        // Already validated in step 3, so just return true
        return true;
      default:
        return false;
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteAdjustment();
    }
  };

  // Handle going back a step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleViewProductDetail = (productId: string) => {
    const product = availableProducts.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setProductDetailOpen(true);
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Adjust</h1>
          <p className="text-gray-500">
            {selectedLocationIds.length > 0
              ? `Adjust inventory for ${getLocationNames()}`
              : "Select a location to adjust inventory"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-1 border-gray-300 h-12 bg-white"
            onClick={() => router.push("/stock-adjustment/history")}
          >
            <Share className="h-4 w-4" />
            <span>View History</span>
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-6">
        <Steps currentStep={currentStep} className="w-full mb-4">
          <Step title="Select Location" />
          <Step title="Select Items" />
          <Step title="Set Adjustments" />
          <Step title="Review & Complete" />
        </Steps>
      </div>

      {/* Step 1: Location Selection */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Step 1: Select Location
          </h2>

          <div className="max-w-xl">
            <Popover
              open={isLocationFilterOpen}
              onOpenChange={setIsLocationFilterOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-12 px-4 border-gray-300 bg-white flex items-center justify-between w-full",
                    selectedLocationIds.length > 0 &&
                      "bg-blue-50 text-blue-600 border-blue-200"
                  )}
                >
                  <span>{getLocationFilterLabel()}</span>
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-0 max-h-[600px] overflow-y-auto"
                align="start"
              >
                <LocationFilters
                  selectedLocationIds={selectedLocationIds}
                  onLocationSelect={handleLocationSelect}
                  showCustomers={false} // Exclude customers
                  allowMultipleSelection={true}
                  placeholder="Select locations"
                />
              </PopoverContent>
            </Popover>
          </div>

          {selectedLocationIds.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Selected: {getLocationNames()}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Product Selection */}
      {currentStep === 2 && (
        <>
          {/* Search and actions */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Search items..."
                className="pl-10 h-12 border-gray-300 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <th className="pl-4 py-4 pr-2">
                      <Checkbox
                        checked={
                          filteredItems.length > 0 &&
                          filteredItems.every((item) =>
                            checkedItemIds.includes(item.productId)
                          )
                        }
                        onCheckedChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-4">Photo</th>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Current Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        Loading products...
                      </td>
                    </tr>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => {
                      const isSelected = checkedItemIds.includes(
                        item.productId
                      );
                      return (
                        <tr
                          key={item.productId}
                          className={cn(
                            "transition-colors border-t border-gray-100",
                            isSelected
                              ? "bg-blue-50"
                              : index % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50/30",
                            "hover:bg-gray-50"
                          )}
                          onClick={() => toggleItemSelection(item.productId)}
                        >
                          <td className="pl-4 py-4 pr-2">
                            <Checkbox
                              checked={isSelected}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <Avatar className="h-12 w-12 rounded-md">
                              <AvatarImage
                                src={item.productImage}
                                alt={item.productName}
                                className="object-cover"
                              />
                              <AvatarFallback>
                                {item.productName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900 font-medium">
                              {item.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.category}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 text-gray-900 text-center">
                            {item.previousQuantity}
                          </td>
                          <td className="px-4 py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProductDetail(item.productId);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        {searchTerm
                          ? "No products found matching your search"
                          : "No products available in these locations"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Step 3: Set Adjustments */}
      {currentStep === 3 && (
        <>
          {/* Search and actions */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Search items..."
                className="pl-10 h-12 border-gray-300 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-12 border-gray-300 flex items-center gap-1 bg-white"
                onClick={handleAddProducts}
              >
                <Plus className="h-4 w-4" />
                <span>Add/Remove Products</span>
              </Button>
            </div>
          </div>

          {/* Items Table for Adjustment */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <th className="px-4 py-4">Photo</th>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Current Quantity</th>
                    <th className="px-6 py-4">Adjustment</th>
                    <th className="px-6 py-4">New Quantity</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => (
                      <tr
                        key={item.productId}
                        className={cn(
                          "transition-colors border-t border-gray-100",
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                          "hover:bg-gray-50"
                        )}
                      >
                        <td className="px-4 py-4">
                          <Avatar className="h-12 w-12 rounded-md">
                            <AvatarImage
                              src={item.productImage}
                              alt={item.productName}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {item.productName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="text-gray-900 font-medium cursor-pointer hover:text-blue-600"
                            onClick={() =>
                              handleViewProductDetail(item.productId)
                            }
                          >
                            {item.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {item.previousQuantity}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {item.quantity > 0 ? (
                            item.adjustmentType === "Add" ? (
                              <span className="text-green-500">
                                +{item.quantity}
                              </span>
                            ) : (
                              <span className="text-red-500">
                                -{item.quantity}
                              </span>
                            )
                          ) : (
                            <span className="text-gray-400 italic">
                              Not set
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {item.quantity > 0
                            ? item.newQuantity
                            : item.previousQuantity}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {item.reasonId ? (
                            ADJUSTMENT_REASONS.find(
                              (r) => r.id === item.reasonId
                            )?.description ||
                            item.customReason ||
                            ""
                          ) : (
                            <span className="text-gray-400 italic">
                              Not set
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-8 text-gray-500 hover:text-gray-700"
                              onClick={() => handleEditItem(item.productId)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-8 text-red-500 hover:text-red-700"
                              onClick={() =>
                                handleDeleteItemClick(item.productId)
                              }
                              title="Remove from selection"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        {checkedItemIds.length === 0
                          ? "No items selected for adjustment"
                          : "No items found matching your criteria"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Step 4: Final Review */}
      {currentStep === 4 && (
        <>
          {/* Items Summary */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Review and Submit</h2>
              <p className="text-gray-500 mt-1">
                Review the adjustments before finalizing
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <th className="px-4 py-4">Photo</th>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Old Quantity</th>
                    <th className="px-6 py-4">Adjustment</th>
                    <th className="px-6 py-4">New Quantity</th>
                    <th className="px-6 py-4">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems
                    .filter((item) => checkedItemIds.includes(item.productId))
                    .map((item, index) => (
                      <tr
                        key={item.productId}
                        className={cn(
                          "transition-colors border-t border-gray-100",
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        )}
                      >
                        <td className="px-4 py-4">
                          <Avatar className="h-12 w-12 rounded-md">
                            <AvatarImage
                              src={item.productImage}
                              alt={item.productName}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {item.productName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="text-gray-900 font-medium cursor-pointer hover:text-blue-600"
                            onClick={() =>
                              handleViewProductDetail(item.productId)
                            }
                          >
                            {item.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {item.previousQuantity}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {item.adjustmentType === "Add" ? (
                            <span className="text-green-500">
                              +{item.quantity}
                            </span>
                          ) : (
                            <span className="text-red-500">
                              -{item.quantity}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {item.newQuantity}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {ADJUSTMENT_REASONS.find(
                            (r) => r.id === item.reasonId
                          )?.description ||
                            item.customReason ||
                            ""}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Location and Notes Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-medium text-lg mb-2">Location Information</h3>
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Location:</span>{" "}
                {getLocationNames()}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Items to Adjust:</span>{" "}
                {checkedItemIds.length}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-medium text-lg mb-2">Notes (Optional)</h3>
              <Textarea
                placeholder="Add notes about this adjustment..."
                className="min-h-[100px] resize-none border-gray-300"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {/* Navigation buttons */}
      <div className="mt-6 flex justify-between">
        {currentStep > 1 ? (
          <Button
            variant="outline"
            className="border-gray-300 flex items-center gap-1"
            onClick={handlePreviousStep}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        )}

        {currentStep < 4 ? (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
            disabled={!isStepValid()}
            onClick={handleNextStep}
          >
            {currentStep === 1 && (
              <>
                Continue to Select Products
                <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
            {currentStep === 2 && (
              <>
                Continue to Set Adjustments
                <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
            {currentStep === 3 && (
              <>
                Review & Complete
                <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button
            className="bg-green-500 hover:bg-green-600 text-white px-8 flex items-center gap-1"
            onClick={handleCompleteAdjustment}
          >
            <Check className="h-4 w-4 mr-2" />
            Submit Stock Adjustment
          </Button>
        )}
      </div>

      {/* Add Products Modal */}
      <AddProductsModal
        open={addProductsModalOpen}
        onOpenChange={setAddProductsModalOpen}
        locationIds={selectedLocationIds}
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

      {/* Printable content for export - hidden */}
      <div className="hidden">
        <div ref={printRef} className="p-8 bg-white">
          <h1 className="text-2xl font-bold mb-6">Stock Adjustment</h1>
          <div className="mb-4">
            <p className="text-gray-600">
              <span className="font-medium">Date:</span>{" "}
              {new Date().toLocaleDateString()}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Location:</span>{" "}
              {getLocationNames()}
            </p>
          </div>

          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="border-b border-t">
                <th className="py-2 text-left">Item Name</th>
                <th className="py-2 text-left">Category</th>
                <th className="py-2 text-right">Previous Qty</th>
                <th className="py-2 text-right">Adjustment</th>
                <th className="py-2 text-right">New Qty</th>
                <th className="py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems
                .filter((item) => checkedItemIds.includes(item.productId))
                .map((item) => (
                  <tr key={item.productId} className="border-b">
                    <td className="py-2">{item.productName}</td>
                    <td className="py-2">{item.category}</td>
                    <td className="py-2 text-right">{item.previousQuantity}</td>
                    <td className="py-2 text-right">
                      {item.adjustmentType === "Add" ? (
                        <span className="text-green-600">+{item.quantity}</span>
                      ) : (
                        <span className="text-red-600">-{item.quantity}</span>
                      )}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {item.newQuantity}
                    </td>
                    <td className="py-2">
                      {ADJUSTMENT_REASONS.find((r) => r.id === item.reasonId)
                        ?.description ||
                        item.customReason ||
                        ""}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {note && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Notes:</h3>
              <p className="text-gray-700">{note}</p>
            </div>
          )}
        </div>
      </div>
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          open={productDetailOpen}
          onOpenChange={setProductDetailOpen}
          viewOnly={true}
        />
      )}
    </div>
  );
};

export default StockAdjustmentPage;
