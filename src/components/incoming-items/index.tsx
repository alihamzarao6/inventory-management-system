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
  User,
  Warehouse,
  Store,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LocationFilters from "@/components/products/LocationFilters";
import AddProductForm from "@/components/products/AddProductForm";
import ProductDetailModal from "@/components/products/ProductDetailModal";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import CreateSupplierForm from "@/components/incoming-items/CreateSupplierForm";
import { Steps, Step } from "@/components/ui/steps";
import { createHandleExport } from "@/utils/pdfExport";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useToast from "@/hooks/useToast";
import { StockAdjustmentItem } from "@/types/stockAdjustment";
import { Product } from "@/types/products";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { MOCK_CUSTOMERS } from "@/constants/mockCustomers";
import { cn } from "@/utils";
import { ScrollArea } from "../ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { MOCK_SUPPLIERS } from "@/constants/mockSupplier";

export const IncomingItemsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // State management
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [isLocationFilterOpen, setIsLocationFilterOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [reviewSelectedItems, setReviewSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<StockAdjustmentItem[]>([]);
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isBatchEditMode, setIsBatchEditMode] = useState(false);
  const [addProductFormOpen, setAddProductFormOpen] = useState(false);
  const [createSupplierFormOpen, setCreateSupplierFormOpen] = useState(false);

  // States to show product details modal
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  // Get location icon based on type
  const getLocationIcon = (locationId: string) => {
    // Check if it's a customer
    const customer = MOCK_CUSTOMERS.find((cust) => cust.id === locationId);
    if (customer) return <User className="h-4 w-4 mr-1 text-blue-500" />;

    // Check if it's a main location
    const mainLocation = MOCK_LOCATIONS.find((loc) => loc.id === locationId);
    if (mainLocation) {
      if (mainLocation.type === "Warehouse") {
        return <Warehouse className="h-4 w-4 mr-1 text-amber-500" />;
      } else {
        return <Store className="h-4 w-4 mr-1 text-green-500" />;
      }
    }

    // Check if it's a sublocation
    const subLocation = MOCK_SUB_LOCATIONS.find(
      (subloc) => subloc.id === locationId
    );
    if (subLocation) {
      if (subLocation.type === "Warehouse") {
        return <Warehouse className="h-4 w-4 mr-1 text-amber-500" />;
      } else {
        return <Store className="h-4 w-4 mr-1 text-green-500" />;
      }
    }

    return null;
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

  // Initialize reviewSelectedItems when entering Step 4
  useEffect(() => {
    if (currentStep === 4) {
      // When entering review step, initially select all items
      setReviewSelectedItems([...checkedItemIds]);
    }
  }, [currentStep, checkedItemIds]);

  // Filter items by search term
  const getFilteredItems = () => {
    // For Step 4 (Review), only show items that were selected in previous steps
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

    // For other steps, use regular filtering
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

  // Toggle batch edit mode
  const toggleBatchEditMode = () => {
    setIsBatchEditMode(!isBatchEditMode);
  };

  // Add a separate toggle function for the review step
  const toggleReviewItemSelection = (productId: string) => {
    setReviewSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Add a separate toggle all function for the review step
  const toggleReviewSelectAll = () => {
    const displayedItems = getFilteredItems();

    if (displayedItems.length === 0) return;

    const allDisplayedSelected = displayedItems.every((item) =>
      reviewSelectedItems.includes(item.productId)
    );

    if (allDisplayedSelected) {
      // Unselect all displayed items
      setReviewSelectedItems((prev) =>
        prev.filter(
          (id) => !displayedItems.some((item) => item.productId === id)
        )
      );
    } else {
      // Select all displayed items
      const displayedIds = displayedItems.map((item) => item.productId);
      setReviewSelectedItems((prev) => {
        // Keep items that are already selected but not currently displayed
        const remainingSelected = prev.filter(
          (id) => !displayedItems.some((item) => item.productId === id)
        );

        // Add all displayed items
        return [...remainingSelected, ...displayedIds];
      });
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

  // Handle product creation
  const handleProductCreated = (productData: any) => {
    // In a real app, this would call an API to create the product
    // For this mock, we'll create a new product locally

    // Create a new mock product
    const newProduct: Product = {
      id: `prod-new-${Date.now()}`,
      name: productData.name,
      category: productData.category,
      image: productData.image || "https://via.placeholder.com/150",
      costPrice: productData.costPrice,
      wholesalePrice: productData.wholesalePrice,
      retailPrice: productData.retailPrice,
      retailPriceUSD: productData.retailPrice / 17.5, // Convert from ZMW to USD
      locations: [
        {
          locationId: productData.initialLocationId || selectedLocationIds[0],
          quantity: productData.initialQuantity || 0,
          isSubLocation: (
            productData.initialLocationId || selectedLocationIds[0]
          ).startsWith("sub-"),
        },
      ],
      reorderLevel: productData.reorderLevel || 5,
      note: productData.note || "",
      createdAt: new Date().toISOString(),
    };

    // Create new adjustment item
    const newAdjustmentItem: StockAdjustmentItem = {
      productId: newProduct.id,
      productName: newProduct.name,
      productImage: newProduct.image,
      category: newProduct.category,
      adjustmentType: "Add",
      quantity: productData.initialQuantity || 1,
      previousQuantity: 0,
      newQuantity: productData.initialQuantity || 1,
      reasonId: "", // No reason needed for incoming items
    };

    // Add to available products and selected items
    setAvailableProducts((prev) => [...prev, newProduct]);
    setSelectedItems((prev) => [...prev, newAdjustmentItem]);

    // Auto-check the new item
    setCheckedItemIds((prev) => [...prev, newProduct.id]);

    showToast("New product added successfully", "success");
    setAddProductFormOpen(false);
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

  // Delete all selected items
  const handleDeleteSelected = () => {
    if (checkedItemIds.length > 0) {
      // Remove all selected items
      setSelectedItems(
        selectedItems.filter((item) => !checkedItemIds.includes(item.productId))
      );

      // Clear selection
      setCheckedItemIds([]);

      showToast(
        `${checkedItemIds.length} item(s) removed from selection`,
        "success"
      );
    }
  };

  // Handle creating a new supplier
  const handleCreateSupplier = (supplierData: any) => {
    // In a real app, this would call an API to create the supplier
    // For this mock, we'll just pretend it was created
    const newSupplierId = `sup-new-${Date.now()}`;

    // Mock adding the new supplier to the list (in a real app this would update the server)
    const newSupplier = {
      id: newSupplierId,
      name: supplierData.name,
    };

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
    const invalidItems = itemsToProcess.filter((item) => item.quantity <= 0);

    if (invalidItems.length > 0) {
      showToast(
        "All selected items must have adjustment quantities greater than 0",
        "error"
      );
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
        return checkedItemIds.length > 0;
      case 3:
        return selectedItems
          .filter((item) => checkedItemIds.includes(item.productId))
          .every((item) => item.quantity > 0);
      case 4:
        return true; // Review step is always valid
      default:
        return false;
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
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

  const handleViewProductDetail = (productId: string) => {
    const product = availableProducts.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setProductDetailOpen(true);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incoming Items</h1>
        </div>
        <div className="flex gap-3">
          {/* {currentStep === 4 && (
            <Button
              variant="outline"
              className="flex items-center gap-1 border-gray-300 h-12 bg-white"
              onClick={toggleBatchEditMode}
            >
              <Edit className="h-4 w-4" />
              <span>{isBatchEditMode ? "Done Editing" : "Batch Edit"}</span>
            </Button>
          )} */}
          {/* <Button
            variant="outline"
            className="flex items-center gap-1 border-gray-300 h-12 bg-white"
            onClick={() => router.push("/incoming-items/history")}
          >
            <Share className="h-4 w-4" />
            <span>View History</span>
          </Button> */}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <Steps currentStep={currentStep} className="mb-4">
          <Step title="Select Locations" />
          <Step title="Select Items" />
          <Step title="Set Quantities" />
          <Step title="Review & Complete" />
        </Steps>
      </div>

      {/* Step 1: Location & Supplier Selection */}
      <div className={currentStep === 1 ? "block" : "hidden"}>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Location
              </label>
            </div>

            <Card className="p-4 bg-white">
              <LocationFilters
                selectedLocationIds={selectedLocationIds}
                onLocationSelect={handleLocationSelect}
                showCustomers={true}
                allowMultipleSelection={true}
              />

              {/* Show selected locations as badges */}
              {selectedLocationIds.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedLocationIds.map((id) => (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="px-3 py-1 flex items-center"
                    >
                      {getLocationIcon(id)}
                      {getLocationNames()}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="flex-1">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Supplier
              </label>
            </div>

            <Card className="p-4 bg-white">
              <div className="mb-2">
                <div className="text-sm text-gray-500">
                  {selectedSupplierId
                    ? `Selected: ${
                        MOCK_SUPPLIERS.find((s) => s.id === selectedSupplierId)
                          ?.name
                      }`
                    : "No supplier selected"}
                </div>
              </div>

              <ScrollArea className="max-h-[390px] overflow-y-auto">
                <RadioGroup
                  value={selectedSupplierId}
                  onValueChange={handleSupplierChange}
                >
                  {MOCK_SUPPLIERS.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="flex items-center space-x-2 py-2 px-1 hover:bg-gray-50 rounded-md"
                    >
                      <RadioGroupItem value={supplier.id} id={supplier.id} />
                      <label
                        htmlFor={supplier.id}
                        className="text-sm font-medium leading-none cursor-pointer flex-1"
                      >
                        {supplier.name}
                      </label>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2">
                    <div
                      className="flex items-center space-x-2 py-2 px-1 hover:bg-blue-50 rounded-md text-blue-600 font-medium"
                      onClick={() => setCreateSupplierFormOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="cursor-pointer">
                        Create New Supplier
                      </span>
                    </div>
                  </div>
                </RadioGroup>
              </ScrollArea>

              {/* Show selected supplier as badge */}
              {selectedSupplierId && (
                <div className="mt-4">
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 flex items-center"
                  >
                    {MOCK_SUPPLIERS.find((s) => s.id === selectedSupplierId)
                      ?.name || "Unknown Supplier"}
                  </Badge>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Step 2: Product Selection */}
      <div className={currentStep === 2 ? "block" : "hidden"}>
        {/* Search and actions */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="Search items..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-1 bg-white"
              onClick={() => setAddProductFormOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add New Product</span>
            </Button>
          </div>
        </div>

        {/* Products table for selection */}
        <Card className="mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
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
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading products...
                    </td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => {
                    const isSelected = checkedItemIds.includes(item.productId);

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
                          "hover:bg-gray-50 cursor-pointer"
                        )}
                        onClick={() => toggleItemSelection(item.productId)}
                      >
                        <td className="pl-4 py-4 pr-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(e) => {
                              // @ts-ignore
                              e.preventDefault();
                              // @ts-ignore
                              e.stopPropagation();
                              toggleItemSelection(item.productId);
                            }}
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
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            {item.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-gray-900">
                            {item.previousQuantity}
                          </div>
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
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "No items found matching your search"
                        : "No products available for the selected location"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Step 3: Set Quantities */}
      <div className={currentStep === 3 ? "block" : "hidden"}>
        {/* Search and actions */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="Search items..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Items Table with Quantity Inputs */}
        <Card className="mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
                  {/* <th className="pl-4 py-4 pr-2">
                    <Checkbox
                      checked={
                        filteredItems.filter((item) =>
                          checkedItemIds.includes(item.productId)
                        ).length > 0 &&
                        filteredItems.filter((item) =>
                          checkedItemIds.includes(item.productId)
                        ).length === filteredItems.length
                      }
                      onCheckedChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th> */}
                  <th className="px-4 py-4">Photo</th>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Current Quantity</th>
                  <th className="px-6 py-4 text-center">Incoming Quantity</th>
                  <th className="px-6 py-4">New Quantity</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.filter((item) =>
                  checkedItemIds.includes(item.productId)
                ).length > 0 ? (
                  filteredItems
                    .filter((item) => checkedItemIds.includes(item.productId))
                    .map((item, index) => {
                      return (
                        <tr
                          key={item.productId}
                          className={cn(
                            "transition-colors border-t border-gray-100",
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                            "hover:bg-gray-50"
                          )}
                        >
                          {/* <td className="pl-4 py-4 pr-2">
                            <Checkbox
                              checked={true}
                              onCheckedChange={() =>
                                toggleItemSelection(item.productId)
                              }
                              className="rounded"
                            />
                          </td> */}
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
                          <td className="px-6 py-4">
                            <div className="text-gray-900">
                              {item.previousQuantity}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity || ""}
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value) || 0;
                                handleQuantityChange(item.productId, quantity);
                              }}
                              className="w-24 text-center mx-auto"
                              placeholder="Enter qty"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900 font-medium">
                              {item.previousQuantity + (item.quantity || 0)}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "No items found matching your search"
                        : "No products selected. Please go back and select products first."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Step 4: Review & Complete */}
      <div className={currentStep === 4 ? "block" : "hidden"}>
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Review Incoming Items</h2>

          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <div className="flex flex-wrap gap-2">
                {selectedLocationIds.map((id) => (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="px-3 py-1 flex items-center"
                  >
                    {getLocationIcon(id)}
                    {getLocationNames()}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-500 mb-1">Supplier</p>
              <Badge
                variant="secondary"
                className="px-3 py-1 flex items-center"
              >
                {MOCK_SUPPLIERS.find((s) => s.id === selectedSupplierId)
                  ?.name || "Unknown Supplier"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Products summary */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Items to Add</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-9 border-gray-300 flex items-center gap-1 bg-white"
                onClick={toggleBatchEditMode}
                disabled={reviewSelectedItems.length === 0}
              >
                <Edit className="h-4 w-4" />
                <span>{isBatchEditMode ? "Done Editing" : "Batch Edit"}</span>
              </Button>
              <Button
                variant="outline"
                className="h-9 border-gray-300 flex items-center gap-1 bg-white text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  // Only remove items that are in reviewSelectedItems
                  setCheckedItemIds((prev) =>
                    prev.filter((id) => !reviewSelectedItems.includes(id))
                  );
                  setReviewSelectedItems([]);
                }}
                disabled={reviewSelectedItems.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove Selected</span>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  <th className="px-4 py-3">
                    <Checkbox
                      checked={
                        getFilteredItems().length > 0 &&
                        getFilteredItems().every((item) =>
                          reviewSelectedItems.includes(item.productId)
                        )
                      }
                      onCheckedChange={toggleReviewSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Old Quantity</th>
                  <th className="px-4 py-3 text-center">Incoming Quantity</th>
                  <th className="px-4 py-3">New Quantity</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredItems().length > 0 ? (
                  getFilteredItems().map((item, index) => (
                    <tr
                      key={item.productId}
                      className={cn(
                        index % 2 === 0 ? "bg-white" : "bg-gray-50",
                        reviewSelectedItems.includes(item.productId) &&
                          isBatchEditMode
                          ? "bg-blue-50/50"
                          : ""
                      )}
                    >
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={reviewSelectedItems.includes(item.productId)}
                          onCheckedChange={() =>
                            toggleReviewItemSelection(item.productId)
                          }
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 rounded-md mr-3">
                            <AvatarImage
                              src={item.productImage}
                              alt={item.productName}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {item.productName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
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
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">
                            {item.previousQuantity}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {isBatchEditMode &&
                        reviewSelectedItems.includes(item.productId) ? (
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const quantity = parseInt(e.target.value) || 0;
                              handleQuantityChange(item.productId, quantity);
                            }}
                            className="w-24 text-center mx-auto"
                          />
                        ) : (
                          <span className="font-medium text-green-500">
                            +{item.quantity}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">
                            {item.newQuantity}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "No items found matching your search"
                        : "No products selected. Please go back and select products."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Note field */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <Textarea
            placeholder="Add notes about these incoming items..."
            className="min-h-[100px] resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation buttons */}
      <div
        className={`mt-6 flex ${
          currentStep === 1 ? "justify-end" : "justify-between"
        }`}
      >
        {currentStep > 1 && (
          <Button
            variant="outline"
            className="border-gray-300 flex items-center gap-1"
            onClick={handlePreviousStep}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}

        <Button
          className={cn(
            "flex items-center gap-1",
            currentStep === 4
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
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
              Set Quantities
              <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
          {currentStep === 3 && (
            <>
              Review & Complete
              <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
          {currentStep === 4 && (
            <>
              <Check className="h-4 w-4" />
              Complete Incoming Items
            </>
          )}
        </Button>
      </div>

      {/* Modals and Dialogs */}

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

      {/* Create Supplier Form Modal */}
      <CreateSupplierForm
        open={createSupplierFormOpen}
        onOpenChange={setCreateSupplierFormOpen}
        onSubmit={handleCreateSupplier}
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

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          open={productDetailOpen}
          onOpenChange={setProductDetailOpen}
          viewOnly={true}
        />
      )}

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
