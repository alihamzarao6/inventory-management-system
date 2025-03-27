"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Trash2,
  Plus,
  Edit,
  Edit2,
  Check,
  X,
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
import AddItemsModal from "./AddItemsModal";
import EditQuantitiesModal from "./EditQuantitiesModal";
import TransferCompletedView from "./TransferCompletedView";
import { TransferFormData, TransferItem } from "@/types/transfers";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";
import { MOCK_CUSTOMERS } from "@/constants/mockCustomers";
import { cn } from "@/utils";
import useToast from "@/hooks/useToast";

const TransferModule: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [isAddItemsModalOpen, setIsAddItemsModalOpen] = useState(false);
  const [isEditQuantitiesModalOpen, setIsEditQuantitiesModalOpen] =
    useState(false);
  const [isTransferCompleted, setIsTransferCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCustomerDestination, setIsCustomerDestination] = useState(false);
  const [transferData, setTransferData] = useState<TransferFormData>({
    sourceLocationIds: [],
    destinationLocationId: "",
    items: [],
    note: "",
  });

  // States for inline quantity editing
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(0);

  // Handle source location change
  const handleSourceLocationSelect = (locationIds: string[]) => {
    // Check if destination is included in source
    if (
      transferData.destinationLocationId &&
      locationIds.includes(transferData.destinationLocationId)
    ) {
      showToast("A location cannot be both source and destination", "error");
      return;
    }

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

  // Add items from modal
  const handleAddItems = (newItems: TransferItem[]) => {
    setTransferData((prev) => ({
      ...prev,
      items: [...prev.items, ...newItems],
    }));

    setIsAddItemsModalOpen(false);

    // If we have items and this is the first time adding, move to next step
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  // Update item quantities
  const handleUpdateQuantities = (updatedItems: TransferItem[]) => {
    setTransferData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
    setIsEditQuantitiesModalOpen(false);

    // If this is the first time updating quantities, move to next step
    if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  // Remove selected items
  const handleRemoveSelectedItems = () => {
    setTransferData((prev) => ({
      ...prev,
      items: prev.items.filter(
        (item) =>
          !selectedItems.includes(`${item.productId}-${item.sourceLocationId}`)
      ),
    }));
    setSelectedItems([]);
  };

  // Toggle item selection
  const toggleItemSelection = (productId: string, sourceLocationId: string) => {
    const itemKey = `${productId}-${sourceLocationId}`;
    setSelectedItems((prev) =>
      prev.includes(itemKey)
        ? prev.filter((id) => id !== itemKey)
        : [...prev, itemKey]
    );
  };

  // Toggle select all items
  const toggleSelectAll = () => {
    if (selectedItems.length === transferData.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        transferData.items.map(
          (item) => `${item.productId}-${item.sourceLocationId}`
        )
      );
    }
  };

  // Filter items by search term
  const getFilteredItems = () => {
    return transferData.items.filter(
      (item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sourceLocationName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Handle edit item quantity
  const handleEditItemQuantity = (
    productId: string,
    sourceLocationId: string,
    quantity: number
  ) => {
    setEditingItemKey(`${productId}-${sourceLocationId}`);
    setEditingQuantity(quantity);
  };

  // Handle save item quantity
  const handleSaveItemQuantity = (
    productId: string,
    sourceLocationId: string
  ) => {
    if (editingQuantity <= 0) {
      showToast("Quantity must be greater than zero", "error");
      return;
    }

    // Find the item in the transfer items
    const updatedItems = transferData.items.map((item) => {
      if (
        item.productId === productId &&
        item.sourceLocationId === sourceLocationId
      ) {
        // Make sure quantity doesn't exceed available quantity
        const validQuantity = Math.min(editingQuantity, item.sourceQuantity);

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

    // Clear editing state
    setEditingItemKey(null);
    setEditingQuantity(0);

    showToast("Item quantity updated", "success");
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingItemKey(null);
    setEditingQuantity(0);
  };

  // Complete transfer
  const handleCompleteTransfer = () => {
    // Would normally call API to save transfer
    const newTransfer = {
      id: `TR-${Date.now()}`,
      ...transferData,
      isCustomerDestination,
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
        return transferData.items.length > 0;
      case 3:
        return transferData.items.every((item) => item.quantity > 0);
      default:
        return false;
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 1) {
      setIsAddItemsModalOpen(true);
    } else if (currentStep === 2) {
      setIsEditQuantitiesModalOpen(true);
    } else if (currentStep === 3) {
      handleCompleteTransfer();
    }
  };

  // If transfer is completed, show completion view
  if (isTransferCompleted) {
    return (
      <TransferCompletedView
        transfer={{ ...transferData, isCustomerDestination }}
        onBackToTransfers={() => router.push("/transfer")}
      />
    );
  }

  // Get the filtered items to display
  const filteredItems = getFilteredItems();

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-bold mb-6">Transfer</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <Steps currentStep={currentStep} className="mb-4">
            <Step title="Select Locations" />
            <Step title="Select Items" />
            <Step title="Set Quantities" />
            <Step title="Complete" />
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

              <Card className="p-4">
                <LocationFilters
                  selectedLocationIds={transferData.sourceLocationIds}
                  onLocationSelect={handleSourceLocationSelect}
                  showCustomers={false}
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

              <Card className="p-4">
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

        {/* Steps 2-3: Items Table */}
        <div className={currentStep > 1 ? "block" : "hidden"}>
          {/* Search and actions */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Search items..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={handleRemoveSelectedItems}
                disabled={selectedItems.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove</span>
              </Button>

              {currentStep === 2 && (
                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => setIsAddItemsModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add More Items</span>
                </Button>
              )}
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

          {/* Items table */}
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
                    <th className="px-6 py-4 text-center">Edit Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => {
                      const isItemSelected = selectedItems.includes(
                        `${item.productId}-${item.sourceLocationId}`
                      );
                      const isEditing =
                        editingItemKey ===
                        `${item.productId}-${item.sourceLocationId}`;

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
                                toggleItemSelection(
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
                            {isEditing ? (
                              <Input
                                type="number"
                                min="1"
                                max={item.sourceQuantity}
                                value={editingQuantity}
                                onChange={(e) =>
                                  setEditingQuantity(
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-24 text-center mx-auto"
                                autoFocus
                              />
                            ) : (
                              <div className="font-medium text-gray-900">
                                {item.quantity}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div>
                              <div className="flex items-center justify-center">
                                <span className="text-gray-900">
                                  {item.destinationQuantity}
                                </span>
                                <span className="text-gray-500 mx-2">→</span>
                                <span className="text-gray-900">
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
                          <td className="px-6 py-4 text-center">
                            {isEditing ? (
                              <div className="flex gap-1 justify-center">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() =>
                                    handleSaveItemQuantity(
                                      item.productId,
                                      item.sourceLocationId
                                    )
                                  }
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() =>
                                  handleEditItemQuantity(
                                    item.productId,
                                    item.sourceLocationId,
                                    item.quantity
                                  )
                                }
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7} // Updated column span to include the new column
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        {currentStep === 2
                          ? "Click 'Add More Items' to select items for transfer"
                          : "No items have been added to the transfer"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Note field - shown in step 3 */}
        {currentStep === 3 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <Textarea
              placeholder="Add a note for this transfer..."
              className="min-h-[100px]"
              value={transferData.note || ""}
              onChange={(e) =>
                setTransferData((prev) => ({ ...prev, note: e.target.value }))
              }
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              Back
            </Button>
          )}
          <Button
            className={
              currentStep === 3
                ? "bg-green-500 hover:bg-green-600 text-white"
                : ""
            }
            onClick={handleNextStep}
            disabled={!isStepValid()}
            variant={currentStep < 3 ? "outline" : "default"}
          >
            {currentStep === 1
              ? "Select Items"
              : currentStep === 2
              ? "Set Quantities"
              : "Complete Transfer"}
          </Button>
        </div>
      </div>

      {/* Add Items Modal */}
      <AddItemsModal
        open={isAddItemsModalOpen}
        onOpenChange={setIsAddItemsModalOpen}
        onAddItems={handleAddItems}
        sourceLocationIds={transferData.sourceLocationIds}
        existingItems={transferData.items}
        destinationLocationId={transferData.destinationLocationId}
      />

      {/* Edit Quantities Modal */}
      <EditQuantitiesModal
        open={isEditQuantitiesModalOpen}
        onOpenChange={setIsEditQuantitiesModalOpen}
        items={transferData.items}
        onUpdateQuantities={handleUpdateQuantities}
        destinationLocationId={transferData.destinationLocationId}
        isCustomerDestination={isCustomerDestination}
      />
    </div>
  );
};

export default TransferModule;

// The TransferModule component is the main component that handles the transfer process. It has four steps:

// Select Locations
// Select Items
// Set Quantities
// Complete Transfer

// The component uses the  LocationFilters  component from the Products module to select source and destination locations. It also uses the  AddItemsModal  and  EditQuantitiesModal  components to add items and edit quantities respectively.
// The component uses a lot of local state to manage the transfer data and UI interactions. It also uses the  useToast  hook to show toast messages.
// The  TransferCompletedView  component is shown when the transfer is completed. It shows the transfer details and allows the user to go back to the transfers page.
