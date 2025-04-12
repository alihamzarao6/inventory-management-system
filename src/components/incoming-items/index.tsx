"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Share,
  Printer,
  ChevronDown,
  ArrowRight,
  Check,
  ChevronLeft,
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
import IncomingItemsTable from "@/components/incoming-items/IncomingItemsTable";
import AdjustmentFormModal from "@/components/incoming-items/AdjustmentFormModal";
import AddProductsModal from "@/components/incoming-items/AddProductsModal";
import EditQuantitiesModal from "@/components/incoming-items/EditQuantitiesModal";
import AddProductForm from "@/components/products/AddProductForm";
import CreateSupplierForm from "@/components/incoming-items/CreateSupplierForm";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import ProductSelectionModal from "@/components/incoming-items/ProductSelectionModal";
import { Steps, Step } from "@/components/ui/steps";
import { createHandleExport } from "@/utils/pdfExport";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useToast from "@/hooks/useToast";
import { StockAdjustmentItem } from "@/types/stockAdjustment";
import { Product } from "@/types/products";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { MOCK_CUSTOMERS } from "@/constants/mockCustomers";
import { cn } from "@/utils";

// Mock suppliers data
const MOCK_SUPPLIERS = [
  { id: "sup-1", name: "ABC Suppliers" },
  { id: "sup-2", name: "XYZ Distributors" },
  { id: "sup-3", name: "Global Trade Partners" },
  { id: "sup-4", name: "Quality Imports Ltd" },
  { id: "sup-5", name: "Prime Vendors Inc" },
];

export const IncomingItemsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { title: "Select Locations", description: "Choose locations and supplier" },
    { title: "Select Products", description: "Choose products to add" },
    { title: "Set Quantities", description: "Set incoming quantities" },
    { title: "Complete", description: "Finalize and complete" },
  ];

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
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isBatchEditMode, setIsBatchEditMode] = useState(false);

  // Modals
  const [productSelectionModalOpen, setProductSelectionModalOpen] =
    useState(false);
  const [addProductsModalOpen, setAddProductsModalOpen] = useState(false);
  const [adjustmentFormOpen, setAdjustmentFormOpen] = useState(false);
  const [editQuantitiesModalOpen, setEditQuantitiesModalOpen] = useState(false);
  const [addProductFormOpen, setAddProductFormOpen] = useState(false);
  const [createSupplierFormOpen, setCreateSupplierFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Export functionality
  const handleExport = createHandleExport(
    // @ts-ignore
    printRef,
    "incoming-items",
    selectedSupplierId
      ? MOCK_SUPPLIERS.find((s) => s.id === selectedSupplierId)
          ?.name.replace(/\s+/g, "-")
          .toLowerCase()
      : "report"
  );

  // Get location filter label
  const getLocationFilterLabel = () => {
    if (selectedLocationIds.length === 0) {
      return "Select Location";
    }

    if (selectedLocationIds.length === 1) {
      const locationId = selectedLocationIds[0];
      // Check if it's a customer
      const customer = MOCK_CUSTOMERS.find((c) => c.id === locationId);
      if (customer) {
        return `Customer: ${customer.name}`;
      }

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
        // Check if it's a customer
        const customer = MOCK_CUSTOMERS.find((cust) => cust.id === id);
        if (customer) return `${customer.name} (Customer)`;

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
      const customerIds = selectedLocationIds.filter((id) =>
        MOCK_CUSTOMERS.some((cust) => cust.id === id)
      );
      const locationIds = selectedLocationIds.filter(
        (id) => !MOCK_CUSTOMERS.some((cust) => cust.id === id)
      );

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

      // Then handle customers (in a real app, this would be products associated with customers)
      if (customerIds.length > 0) {
        // For demo purposes, just show some random products for customers
        const customerProducts = MOCK_PRODUCTS.slice(0, 5); // First 5 products
        locationProducts = [...locationProducts, ...customerProducts];
      }

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

          // Get quantity from all selected locations (excluding customers)
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
            adjustmentType: "Add", // Default adjustment type for incoming items
            quantity: 0, // Default quantity (no adjustment yet)
            previousQuantity: currentQuantity,
            newQuantity: currentQuantity,
            reasonId: "", // No reason needed for incoming items
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
    if (!searchTerm.trim()) {
      return selectedItems;
    }

    const term = searchTerm.toLowerCase();
    return selectedItems.filter(
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

  // Toggle batch edit mode
  const toggleBatchEditMode = () => {
    setIsBatchEditMode(!isBatchEditMode);
  };

  // Open edit quantities modal
  const handleOpenEditQuantities = () => {
    // Make sure there are selected items
    if (checkedItemIds.length === 0) {
      showToast("Please select at least one item first", "warning");
      return;
    }

    setEditQuantitiesModalOpen(true);
  };

  // Update quantities from modal
  const handleUpdateQuantities = (updatedItems: StockAdjustmentItem[]) => {
    setSelectedItems((prevItems) => {
      return prevItems.map((item) => {
        const updatedItem = updatedItems.find(
          (updated) => updated.productId === item.productId
        );
        return updatedItem || item;
      });
    });

    setEditQuantitiesModalOpen(false);

    // If we're in step 2, automatically proceed to step 3 after setting quantities
    if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  // Update quantity directly in table
  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity,
            newQuantity: item.previousQuantity + quantity,
          };
        }
        return item;
      });
    });
  };

  // Open add products modal
  const handleAddProducts = () => {
    if (selectedLocationIds.length === 0) {
      showToast("Please select at least one location first", "error");
      return;
    }

    setAddProductsModalOpen(true);
  };

  // Handle adding a new product
  const handleAddNewProduct = () => {
    if (selectedLocationIds.length === 0) {
      showToast("Please select at least one location first", "error");
      return;
    }

    setAddProductsModalOpen(false); // Close the add products modal first
    setProductSelectionModalOpen(false); // Close the product selection modal if open

    setTimeout(() => {
      setAddProductFormOpen(true); // Then open the add product form
    }, 100);
  };

  // Handle product creation
  const handleProductCreated = (productData: any) => {
    // In a real app, this would call an API to create the product
    // For this mock, we'll create a new product locally

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

    // Auto-check the new item
    setCheckedItemIds((prev) => [...prev, newProduct.id]);

    showToast("New product added successfully", "success");
  };

  // Handle selection changes from the add products modal
  const handleProductsSelected = (selectedProductIds: string[]) => {
    // Mark selected products as checked
    setCheckedItemIds(selectedProductIds);
    setAddProductsModalOpen(false);
  };

  // Handle products selection from the product selection modal
  const handleProductSelectionCompleted = (
    selectedItems: StockAdjustmentItem[]
  ) => {
    setSelectedItems(selectedItems);
    // Check all items by default
    setCheckedItemIds(selectedItems.map((item) => item.productId));
    setProductSelectionModalOpen(false);

    // Move to step 2 now that we have items selected
    setCurrentStep(2);
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

      // Remove from selected items
      setSelectedItems(
        selectedItems.filter((item) => item.productId !== itemToDelete)
      );

      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      showToast("Item removed from selection", "success");
    }
  };

  // Handle creating a new supplier
  const handleCreateSupplier = (supplierData: any) => {
    // In a real app, this would call an API to create the supplier
    // For this mock, we'll just pretend it was created

    const newSupplierId = `sup-new-${Date.now()}`;
    showToast("Supplier created successfully", "success");

    // Set the new supplier as selected
    setSelectedSupplierId(newSupplierId);
    setCreateSupplierFormOpen(false);
  };

  // Handle supplier selection
  const handleSupplierChange = (value: string) => {
    if (value === "create-new") {
      // Open create supplier form
      setCreateSupplierFormOpen(true);
    } else {
      setSelectedSupplierId(value);
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
      locationIds: selectedLocationIds,
      locationNames: getLocationNames(),
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

  // Check if current step is valid to proceed
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedLocationIds.length > 0 && !!selectedSupplierId;
      case 2:
        return (
          selectedItems.length > 0 &&
          selectedItems.some((item) => item.quantity > 0)
        );
      case 3:
        return selectedItems
          .filter((item) => checkedItemIds.includes(item.productId))
          .every((item) => item.quantity > 0);
      default:
        return false;
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 1) {
      // Make sure availableProducts is loaded before opening the modal
      if (isLoading) {
        showToast("Loading products, please wait...", "info");
        return;
      }

      if (availableProducts.length === 0) {
        showToast("No products found for the selected location", "warning");
        return;
      }

      // Now open the modal with products available
      setProductSelectionModalOpen(true);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleComplete();
    }
  };

  // Handle going back a step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incoming Items</h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-1 border-gray-300 h-12 bg-white"
            onClick={toggleBatchEditMode}
            disabled={
              currentStep !== 2 ||
              selectedLocationIds.length === 0 ||
              selectedItems.length === 0
            }
          >
            <Edit className="h-4 w-4" />
            <span>{isBatchEditMode ? "Done Editing" : "Batch Edit"}</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-1 border-gray-300 h-12 bg-white"
            onClick={() => router.push("/incoming-items/history")}
          >
            <Share className="h-4 w-4" />
            <span>View History</span>
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-6">
        <Steps currentStep={currentStep} className="w-full mb-4">
          <Step
            title="Select Locations"
            // description="Choose locations and supplier"
          />
          <Step
            title="Select Products"
            // description="Choose products to add"
          />
          <Step
            title="Set Quantities"
            // description="Set incoming quantities"
          />
          <Step
            title="Complete"
            // description="Finalize and complete"
          />
        </Steps>
      </div>

      {/* Step 1: Location Selection */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Step 1: Select Locations and Supplier
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Locations
                {/* <span className="text-red-500">*</span> */}
              </label>
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
                    showCustomers={true}
                    allowMultipleSelection={true}
                  />
                </PopoverContent>
              </Popover>

              {/* Display selected locations */}
              {selectedLocationIds.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  Selected: {getLocationNames()}
                </div>
              )}
            </div>

            {/* Supplier Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
                {/* <span className="text-red-500">*</span> */}
              </label>
              <Select
                value={selectedSupplierId}
                onValueChange={handleSupplierChange}
              >
                <SelectTrigger className="w-full h-12 border-gray-300">
                  <SelectValue placeholder="Select a Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_SUPPLIERS.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                  <SelectItem
                    value="create-new"
                    className="text-blue-600 font-medium"
                  >
                    + Create New Supplier
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add info text about what supplier means in this context */}
          <div className="text-sm text-gray-500 italic mt-2">
            The selected supplier will be recorded as the source of these
            incoming items.
          </div>
        </div>
      )}

      {/* Step 2 & 3: Products and Quantities */}
      {(currentStep === 2 || currentStep === 3) && (
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
              {currentStep === 2 && (
                <>
                  <Button
                    variant="outline"
                    className="h-12 border-gray-300 flex items-center gap-1 bg-white"
                    onClick={handleOpenEditQuantities}
                    disabled={checkedItemIds.length === 0}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Quantities</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 border-gray-300 flex items-center gap-1 bg-white"
                    onClick={() => setProductSelectionModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Products</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Items Table */}
          <IncomingItemsTable
            items={filteredItems}
            checkedItemIds={checkedItemIds}
            isLoading={isLoading}
            onToggleItem={toggleItemSelection}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItemClick}
            isBatchEditMode={isBatchEditMode}
            onQuantityChange={handleQuantityChange}
          />

          {/* Note Field - only show in step 3 */}
          {currentStep === 3 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                placeholder="Add notes about this incoming inventory..."
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}
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
              Review & Complete
              <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
          {currentStep === 3 && (
            <>
              <Check className="h-4 w-4" />
              Complete Incoming Items
            </>
          )}
        </Button>
      </div>

      {/* Create Supplier Form Modal */}
      <CreateSupplierForm
        open={createSupplierFormOpen}
        onOpenChange={setCreateSupplierFormOpen}
        onSubmit={handleCreateSupplier}
      />

      {/* Product Selection Modal for Step 1->2 */}
      <ProductSelectionModal
        open={productSelectionModalOpen}
        onOpenChange={setProductSelectionModalOpen}
        onProductsSelected={handleProductSelectionCompleted}
        selectedLocationIds={selectedLocationIds}
        availableProducts={availableProducts}
        existingItems={selectedItems}
        onAddNewProduct={handleAddNewProduct}
      />

      {/* Add Products Modal for adding more products in Step 2 */}
      <AddProductsModal
        open={addProductsModalOpen}
        onOpenChange={setAddProductsModalOpen}
        onProductsSelected={handleProductsSelected}
        selectedLocationIds={selectedLocationIds}
        availableProducts={availableProducts}
        checkedItemIds={checkedItemIds}
        onAddNewProduct={handleAddNewProduct}
      />

      {/* Edit Quantities Modal */}
      <EditQuantitiesModal
        open={editQuantitiesModalOpen}
        onOpenChange={setEditQuantitiesModalOpen}
        items={selectedItems.filter((item) =>
          checkedItemIds.includes(item.productId)
        )}
        onUpdateQuantities={handleUpdateQuantities}
      />

      {/* Add New Product Form */}
      <AddProductForm
        open={addProductFormOpen}
        onOpenChange={setAddProductFormOpen}
        onSubmit={handleProductCreated}
        initialData={
          selectedLocationIds.length > 0
            ? { initialLocationId: selectedLocationIds[0] }
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

      {/* Printable content for PDF export - hidden */}
      <div className="hidden">
        <div ref={printRef} className="p-8 bg-white">
          <h1 className="text-2xl font-bold mb-6">Incoming Items</h1>
          <div className="mb-4">
            <p className="text-gray-600">
              <span className="font-medium">Date:</span>{" "}
              {new Date().toLocaleDateString()}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Location:</span>{" "}
              {getLocationNames()}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Supplier:</span>{" "}
              {MOCK_SUPPLIERS.find((s) => s.id === selectedSupplierId)?.name ||
                "Not specified"}
            </p>
          </div>

          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="border-b border-t">
                <th className="py-2 text-left">Item Name</th>
                <th className="py-2 text-left">Category</th>
                <th className="py-2 text-right">Previous Qty</th>
                <th className="py-2 text-right">Added Qty</th>
                <th className="py-2 text-right">New Qty</th>
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
                    <td className="py-2 text-right text-green-600">
                      +{item.quantity}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {item.newQuantity}
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
    </div>
  );
};
