"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Search,
  ArrowRight,
  User,
  Store,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Steps, Step } from "@/components/ui/steps";
import LocationFilters from "@/components/products/LocationFilters";
import TransferCompletedView from "./TransferCompletedView";
import { TransferFormData, TransferItem } from "@/types/transfers";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";
import {
  MOCK_CUSTOMERS,
  MOCK_CUSTOMER_PRODUCTS,
  getProductsByCustomerId,
} from "@/constants/mockCustomers";
import { cn } from "@/utils";
import useToast from "@/hooks/useToast";

export const TransferModule: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [isTransferCompleted, setIsTransferCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCustomerDestination, setIsCustomerDestination] = useState(false);
  const [isCustomerSource, setIsCustomerSource] = useState(false);

  const [transferData, setTransferData] = useState<TransferFormData>({
    sourceLocationIds: [],
    destinationLocationId: "",
    items: [],
    note: "",
  });

  // Available products based on source locations
  const [availableProducts, setAvailableProducts] = useState<
    {
      product: any;
      sourceLocationId: string;
      sourceLocationName: string;
      quantity: number;
    }[]
  >([]);

  // Load available products when source location changes
  useEffect(() => {
    if (transferData.sourceLocationIds.length > 0) {
      const products = getAvailableProducts();
      setAvailableProducts(products);
    } else {
      setAvailableProducts([]);
    }
  }, [transferData.sourceLocationIds]);

  // Get products available at the source locations
  const getAvailableProducts = () => {
    const availableProducts: {
      product: any;
      sourceLocationId: string;
      sourceLocationName: string;
      quantity: number;
    }[] = [];

    // Handle customer as source
    if (isCustomerSource) {
      // Get the customer ID (assuming only one customer can be selected as source)
      const customerId = transferData.sourceLocationIds[0];
      const customer = MOCK_CUSTOMERS.find((c) => c.id === customerId);

      // Get products associated with this customer
      const customerProducts = getProductsByCustomerId(customerId);

      // Add customer products to available products
      customerProducts.forEach((product) => {
        // For a customer source, we'll assume they have the full quantity available
        // In a real app, we'd have actual customer inventory records
        const customerProduct = MOCK_CUSTOMER_PRODUCTS.find(
          (cp) => cp.customerId === customerId && cp.productId === product.id
        );

        if (customerProduct) {
          availableProducts.push({
            product,
            sourceLocationId: customerId,
            sourceLocationName: customer?.name || "Unknown Customer",
            quantity: 10, // Mock quantity - in a real app we'd use actual customer inventory
          });
        }
      });

      return availableProducts;
    }

    // Handle regular locations as source (warehouses/stores)
    MOCK_PRODUCTS.forEach((product) => {
      product.locations.forEach((loc) => {
        if (
          transferData.sourceLocationIds.includes(loc.locationId) &&
          loc.quantity > 0
        ) {
          // Get location name
          let locationName = "Unknown";
          if (loc.isSubLocation) {
            const subLoc = MOCK_SUB_LOCATIONS.find(
              (sl) => sl.id === loc.locationId
            );
            if (subLoc) {
              const parentLoc = MOCK_LOCATIONS.find(
                (l) => l.id === subLoc.parentId
              );
              locationName = `${subLoc.name} (${parentLoc?.name || "Unknown"})`;
            }
          } else {
            const mainLoc = MOCK_LOCATIONS.find((l) => l.id === loc.locationId);
            locationName = mainLoc?.name || "Unknown";
          }

          availableProducts.push({
            product,
            sourceLocationId: loc.locationId,
            sourceLocationName: locationName,
            quantity: loc.quantity,
          });
        }
      });
    });

    // Sort by product name
    return availableProducts.sort((a, b) =>
      a.product.name.localeCompare(b.product.name)
    );
  };

  // Handle source location change
  const handleSourceLocationSelect = (
    locationIds: string[],
    isCustomer = false
  ) => {
    // Check if destination is included in source
    if (
      transferData.destinationLocationId &&
      locationIds.includes(transferData.destinationLocationId)
    ) {
      showToast("A location cannot be both source and destination", "error");
      return;
    }

    setIsCustomerSource(isCustomer);
    setTransferData((prev) => ({
      ...prev,
      sourceLocationIds: locationIds,
      // Clear items if source location changes
      items: [],
    }));
    setSelectedItems([]);
  };

  // Handle destination location change
  const handleDestinationLocationSelect = (
    locationIds: string[],
    isCustomer = false
  ) => {
    // We only care about the first location ID since we only allow one destination
    const locationId = locationIds[0];

    // Don't allow selecting a location that's already in sourceLocationIds
    if (transferData.sourceLocationIds.includes(locationId)) {
      showToast("A location cannot be both source and destination", "error");
      return;
    }

    setIsCustomerDestination(isCustomer);
    setTransferData((prev) => ({
      ...prev,
      destinationLocationId: locationId,
    }));

    // Update destination quantities for existing items - customers start with 0
    if (transferData.items.length > 0) {
      const updatedItems = transferData.items.map((item) => {
        // Customers always have 0 initial quantity
        if (isCustomer) {
          return {
            ...item,
            destinationQuantity: 0,
          };
        }

        // For warehouses/stores, look up current quantity
        const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
        const destinationQuantity =
          product?.locations.find((loc) => loc.locationId === locationId)
            ?.quantity || 0;

        return {
          ...item,
          destinationQuantity,
        };
      });

      setTransferData((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    }
  };

  // Get location name by ID
  const getLocationName = (locationId: string): string => {
    // Check if it's a customer
    const customer = MOCK_CUSTOMERS.find((cust) => cust.id === locationId);
    if (customer) return `${customer.name} (Customer)`;

    // Check if it's a main location
    const mainLocation = MOCK_LOCATIONS.find((loc) => loc.id === locationId);
    if (mainLocation) return mainLocation.name;

    // Check if it's a sublocation
    const subLocation = MOCK_SUB_LOCATIONS.find(
      (subloc) => subloc.id === locationId
    );
    if (subLocation) {
      const parent = MOCK_LOCATIONS.find(
        (loc) => loc.id === subLocation.parentId
      );
      return `${subLocation.name} (${parent?.name || "Unknown"})`;
    }

    return "Unknown Location";
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

  // Toggle item selection in Step 2
  const toggleProductSelection = (productId: string, locationId: string) => {
    // Create a unique key that combines product ID and source location ID
    const itemKey = `${productId}-${locationId}`;

    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(itemKey)) {
        // If already selected, remove it
        return prevSelectedItems.filter((key) => key !== itemKey);
      } else {
        // If not selected, add it
        return [...prevSelectedItems, itemKey];
      }
    });
  };

  // Toggle select all products in Step 2
  const toggleSelectAll = () => {
    if (currentStep === 2) {
      // Check if all are selected
      const allSelected = filteredAvailableProducts.every((item) =>
        selectedItems.includes(`${item.product.id}-${item.sourceLocationId}`)
      );

      if (allSelected) {
        console.log("All selected, clearing selection");
        setSelectedItems([]);
      } else {
        const allItemKeys = filteredAvailableProducts.map(
          (item) => `${item.product.id}-${item.sourceLocationId}`
        );
        setSelectedItems(allItemKeys);
      }
    } else if (currentStep === 3) {
      // Similar logic for step 3
      const allSelected = transferData.items.every((item) =>
        selectedItems.includes(`${item.productId}-${item.sourceLocationId}`)
      );

      if (allSelected) {
        setSelectedItems([]);
      } else {
        setSelectedItems(
          transferData.items.map(
            (item) => `${item.productId}-${item.sourceLocationId}`
          )
        );
      }
    }
  };

  // Move to Step 3 with selected products
  const moveToQuantityStep = () => {
    // Check if any products are selected
    if (selectedItems.length === 0) {
      showToast("Please select at least one product", "error");
      return;
    }

    // Create transfer items directly from selected items
    const transferItems: TransferItem[] = selectedItems
      .map((itemKey) => {
        // Find the corresponding product in available products
        const productData = availableProducts.find(
          (item) => `${item.product.id}-${item.sourceLocationId}` === itemKey
        );

        // If no product data found, return a fallback item
        if (!productData) {
          console.error(`No product data found for key: ${itemKey}`);
          return null;
        }

        // Create transfer item with full product details
        return {
          productId: productData.product.id,
          productName: productData.product.name,
          productImage: productData.product.image,
          category: productData.product.category,
          sourceLocationId: productData.sourceLocationId,
          sourceLocationName: productData.sourceLocationName,
          sourceQuantity: productData.quantity,
          destinationQuantity: 0, // Will be updated in next step
          quantity: 1, // Default transfer quantity
        };
      })
      .filter((item) => item !== null); // Remove any null items

    // If no valid transfer items, show error
    if (transferItems.length === 0) {
      showToast("Unable to process selected items", "error");
      return;
    }

    // Update transfer data with the new items
    setTransferData((prev) => ({
      ...prev,
      items: transferItems,
    }));

    // Keep the selected items for the next step
    setSelectedItems(
      transferItems.map((item) => `${item.productId}-${item.sourceLocationId}`)
    );

    // Move to next step
    setCurrentStep(3);
  };

  // Update quantity for a product in Step 3
  const handleQuantityChange = (
    productId: string,
    sourceLocationId: string,
    newQuantity: string
  ) => {
    const quantity = parseInt(newQuantity) || 0;

    const updatedItems = transferData.items.map((item) => {
      if (
        item.productId === productId &&
        item.sourceLocationId === sourceLocationId
      ) {
        // Limit quantity to available stock
        const validQuantity = Math.max(
          0,
          Math.min(quantity, item.sourceQuantity)
        );

        return {
          ...item,
          quantity: validQuantity,
        };
      }
      return item;
    });

    setTransferData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Remove selected items
  const handleRemoveSelectedItems = () => {
    if (currentStep === 2) {
      // In step 2, we're removing from available products selection
      setSelectedItems([]);
    } else if (currentStep === 3) {
      // In step 3, we're removing from transfer items
      setTransferData((prev) => ({
        ...prev,
        items: prev.items.filter(
          (item) =>
            !selectedItems.includes(
              `${item.productId}-${item.sourceLocationId}`
            )
        ),
      }));
      setSelectedItems([]);
    }
  };

  // Filter available products by search term
  const filteredAvailableProducts = availableProducts.filter(
    (item) =>
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sourceLocationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter transfer items by search term
  const filteredTransferItems = transferData.items.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sourceLocationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Complete transfer
  const handleCompleteTransfer = () => {
    // Would normally call API to save transfer
    const newTransfer = {
      id: `TR-${Date.now()}`,
      ...transferData,
      isCustomerDestination,
      isCustomerSource,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: "completed" as const,
    };

    console.log("Transfer completed:", newTransfer);
    setIsTransferCompleted(true);
  };

  // Check if current step is valid to proceed
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          transferData.sourceLocationIds.length > 0 &&
          transferData.destinationLocationId
        );
      case 2:
        return selectedItems.length > 0;
      case 3:
        return (
          transferData.items.length > 0 &&
          transferData.items.every((item) => item.quantity > 0)
        );
      case 4:
        return true; // Review step is always valid to proceed
      default:
        return false;
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Added debug logging
      console.log("Next Step clicked in Step 2");
      console.log("Selected Items:", selectedItems);
      console.log("Available Products Length:", availableProducts.length);
      console.log("Available Products:", availableProducts);

      // Directly call moveToQuantityStep
      moveToQuantityStep();
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      handleCompleteTransfer();
    }
  };

  // If transfer is completed, show completion view
  if (isTransferCompleted) {
    return (
      <TransferCompletedView
        transfer={{ ...transferData, isCustomerDestination, isCustomerSource }}
        onBackToTransfers={() => router.push("/transfer")}
      />
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Transfer</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <Steps currentStep={currentStep} className="mb-4">
          <Step title="Select Locations" />
          <Step title="Select Items" />
          <Step title="Set Quantities" />
          <Step title="Review & Complete" />
        </Steps>
      </div>

      {/* Step 1: Location Selection */}
      <div className={currentStep === 1 ? "block" : "hidden"}>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="mb-2 flex justify-between">
              <label className="block text-sm font-medium text-gray-700">
                From
              </label>
              <div className="text-sm text-gray-500">
                {transferData.sourceLocationIds.length > 0 &&
                  `${transferData.sourceLocationIds.length} location(s) selected`}
              </div>
            </div>

            <Card className="p-4 bg-white">
              <LocationFilters
                selectedLocationIds={transferData.sourceLocationIds}
                onLocationSelect={handleSourceLocationSelect}
                showCustomers={true} // Allow customers as sources now
                allowMultipleSelection={true} // Allow multiple selection for source
              />

              {/* Show selected locations as badges */}
              {transferData.sourceLocationIds.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {transferData.sourceLocationIds.map((id) => (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="px-3 py-1 flex items-center"
                    >
                      {getLocationIcon(id)}
                      {getLocationName(id)}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="flex items-center justify-center text-gray-400 mt-10">
            <div className="hidden md:block w-10 h-0.5 bg-gray-200"></div>
            <ArrowRight className="hidden md:block mx-2" />
            <div className="hidden md:block w-10 h-0.5 bg-gray-200"></div>
          </div>

          <div className="flex-1">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                To
              </label>
            </div>

            <Card className="p-4 bg-white">
              <LocationFilters
                selectedLocationIds={
                  transferData.destinationLocationId
                    ? [transferData.destinationLocationId]
                    : []
                }
                onLocationSelect={handleDestinationLocationSelect}
                showCustomers={true} // Allow customers as destinations
                allowMultipleSelection={false} // Only allow single selection for destination
              />

              {/* Show selected destination as badge */}
              {transferData.destinationLocationId && (
                <div className="mt-4">
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 flex items-center"
                  >
                    {getLocationIcon(transferData.destinationLocationId)}
                    {getLocationName(transferData.destinationLocationId)}
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
              onClick={handleRemoveSelectedItems}
              disabled={selectedItems.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Selection</span>
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
                        selectedItems.length ===
                          filteredAvailableProducts.length &&
                        filteredAvailableProducts.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-4">Photo</th>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>Available Quantity</span>
                      <span className="text-xs font-normal uppercase">
                        From Location
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAvailableProducts.length > 0 ? (
                  filteredAvailableProducts.map((item, index) => {
                    const isSelected = selectedItems.includes(
                      `${item.product.id}-${item.sourceLocationId}`
                    );

                    return (
                      <tr
                        key={`${item.product.id}-${item.sourceLocationId}`}
                        className={cn(
                          "transition-colors border-t border-gray-100",
                          isSelected
                            ? "bg-blue-50"
                            : index % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50/30",
                          "hover:bg-gray-50 cursor-pointer"
                        )}
                        onClick={() => {
                          console.log(
                            "Row clicked for:",
                            item.product.id,
                            item.sourceLocationId
                          );
                          toggleProductSelection(
                            item.product.id,
                            item.sourceLocationId
                          );
                        }}
                      >
                        <td
                          className="pl-4 py-4 pr-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            // Use the more explicit form that passes the checked state
                            onCheckedChange={(checked) => {
                              // Only toggle if there's an actual change
                              if (checked !== isSelected) {
                                console.log(
                                  "Checkbox toggled for:",
                                  item.product.id,
                                  item.sourceLocationId,
                                  "New state:",
                                  checked
                                );
                                toggleProductSelection(
                                  item.product.id,
                                  item.sourceLocationId
                                );
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <Avatar className="h-12 w-12 rounded-md">
                            <AvatarImage
                              src={item.product.image}
                              alt={item.product.name}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {item.product.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 font-medium">
                            {item.product.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            {item.product.category}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-gray-900 font-medium">
                              {item.quantity}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {item.sourceLocationName}
                            </div>
                          </div>
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
                        : isCustomerSource
                        ? "No products available for the selected customer"
                        : "No products available in the selected locations"}
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

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-1 bg-white"
              onClick={handleRemoveSelectedItems}
              disabled={selectedItems.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              <span>Remove Selected Items</span>
            </Button>
          </div>
        </div>

        {/* Destination type indicator for customer transfers */}
        {isCustomerDestination && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-blue-700">
                <span className="font-medium">Customer Transfer:</span> Items
                will be transferred to{" "}
                {getLocationName(transferData.destinationLocationId)}
              </p>
            </div>
          </div>
        )}

        {/* Items table with quantity inputs */}
        <Card className="mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
                  <th className="pl-4 py-4 pr-2">
                    <Checkbox
                      checked={
                        selectedItems.length === transferData.items.length &&
                        transferData.items.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-4">Photo</th>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>Quantity</span>
                      <span className="text-xs font-normal uppercase">
                        From Location
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Transfer Amount</th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex flex-col">
                      <span>Quantity</span>
                      <span className="text-xs font-normal uppercase">
                        To {isCustomerDestination ? "Customer" : "Location"}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransferItems.length > 0 ? (
                  filteredTransferItems.map((item, index) => {
                    const isItemSelected = selectedItems.includes(
                      `${item.productId}-${item.sourceLocationId}`
                    );

                    return (
                      <tr
                        key={`${item.productId}-${item.sourceLocationId}`}
                        className={cn(
                          "transition-colors border-t border-gray-100",
                          isItemSelected
                            ? "bg-blue-50"
                            : index % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50/30",
                          "hover:bg-gray-50"
                        )}
                      >
                        <td className="pl-4 py-4 pr-2">
                          <Checkbox
                            checked={isItemSelected}
                            onCheckedChange={() =>
                              toggleProductSelection(
                                item.productId,
                                item.sourceLocationId
                              )
                            }
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
                          <div>
                            <div className="text-gray-900 font-medium">
                              {item.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.category}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center">
                              <span className="text-gray-900">
                                {item.sourceQuantity}
                              </span>
                              <span className="text-gray-500 mx-2">→</span>
                              <span className="text-gray-900">
                                {item.sourceQuantity - item.quantity}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              From: {item.sourceLocationName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Input
                            type="number"
                            min="1"
                            max={item.sourceQuantity}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.productId,
                                item.sourceLocationId,
                                e.target.value
                              )
                            }
                            className="w-24 text-center mx-auto"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {item.sourceQuantity - item.quantity} will remain
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div>
                            <div className="flex items-center justify-center">
                              <span className="text-gray-900">
                                {item.destinationQuantity}
                              </span>
                              <span className="text-gray-500 mx-2">→</span>
                              <span className="text-gray-900 font-medium">
                                {item.destinationQuantity + item.quantity}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              To:{" "}
                              {getLocationName(
                                transferData.destinationLocationId
                              )}
                            </div>
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
                      No items have been added to the transfer
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Review Transfer Details
          </h2>

          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">From</p>
                <div className="flex flex-wrap gap-2">
                  {transferData.sourceLocationIds.map((id) => (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="px-3 py-1 flex items-center"
                    >
                      {getLocationIcon(id)}
                      {getLocationName(id)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex items-center">
                <ArrowRight className="text-gray-400 mx-4 hidden md:block" />
              </div>

              <div className="mt-4 md:mt-0">
                <p className="text-sm text-gray-500 mb-1">To</p>
                <Badge
                  variant="secondary"
                  className="px-3 py-1 flex items-center"
                >
                  {getLocationIcon(transferData.destinationLocationId)}
                  {getLocationName(transferData.destinationLocationId)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Products summary */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Items to Transfer</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3 text-center">Transfer Quantity</th>
                    <th className="px-4 py-3">To</th>
                  </tr>
                </thead>
                <tbody>
                  {transferData.items.map((item, index) => (
                    <tr
                      key={`${item.productId}-${item.sourceLocationId}`}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
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
                            <div className="font-medium">
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
                          <div>{item.sourceLocationName}</div>
                          <div className="text-gray-500">
                            Available: {item.sourceQuantity}
                          </div>
                          <div className="text-gray-500">
                            Remaining: {item.sourceQuantity - item.quantity}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div>
                            {getLocationName(
                              transferData.destinationLocationId
                            )}
                          </div>
                          <div className="text-gray-500">
                            Current: {item.destinationQuantity}
                          </div>
                          <div className="text-gray-500">
                            After: {item.destinationQuantity + item.quantity}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Note field */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Note (Optional)
            </label>
            <Textarea
              placeholder="Add a note for this transfer..."
              className="min-h-[100px] resize-none"
              value={transferData.note || ""}
              onChange={(e) =>
                setTransferData((prev) => ({ ...prev, note: e.target.value }))
              }
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="bg-white"
          >
            Back
          </Button>
        )}
        <Button
          className={
            currentStep === 4
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-white"
          }
          onClick={handleNextStep}
          disabled={!isStepValid()}
          variant={currentStep < 4 ? "outline" : "default"}
        >
          {currentStep === 1
            ? "Select Items"
            : currentStep === 2
            ? "Set Quantities"
            : currentStep === 3
            ? "Review & Complete"
            : "Complete Transfer"}
        </Button>
      </div>
    </div>
  );
};

export default TransferModule;
