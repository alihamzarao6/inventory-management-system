// components/transfers/TransferModule.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Trash2, Plus, Edit, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import LocationFilter from "./LocationFilter";
import AddItemsModal from "./AddItemsModal";
import EditQuantitiesModal from "./EditQuantitiesModal";
import TransferCompletedView from "./TransferCompletedView";
import { TransferFormData, TransferItem } from "@/types/transfers";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";
import { cn } from "@/utils";

const TransferModule: React.FC = () => {
  const router = useRouter();
  const [isAddItemsModalOpen, setIsAddItemsModalOpen] = useState(false);
  const [isEditQuantitiesModalOpen, setIsEditQuantitiesModalOpen] =
    useState(false);
  const [isTransferCompleted, setIsTransferCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [locationProducts, setLocationProducts] = useState<any[]>([]);
  const [transferData, setTransferData] = useState<TransferFormData>({
    sourceLocationIds: [],
    destinationLocationId: "",
    items: [],
    note: "",
  });

  // Load products from selected location when source changes
  useEffect(() => {
    if (transferData.sourceLocationIds.length > 0) {
      const sourceLocationId = transferData.sourceLocationIds[0];
      loadLocationProducts(sourceLocationId);
    } else {
      setLocationProducts([]);
    }
  }, [transferData.sourceLocationIds]);

  // Update destination quantities when destination changes
  useEffect(() => {
    if (transferData.destinationLocationId && transferData.items.length > 0) {
      updateDestinationQuantities(transferData.destinationLocationId);
    }
  }, [transferData.destinationLocationId]);

  // Load products from a location
  const loadLocationProducts = (locationId: string) => {
    const products: any[] = [];

    // Get all products that have stock in the location
    MOCK_PRODUCTS.forEach((product) => {
      const locationStock = product.locations.find(
        (loc) => loc.locationId === locationId
      );

      if (locationStock && locationStock.quantity > 0) {
        // Get destination quantity if destination is selected
        const destinationQuantity = transferData.destinationLocationId
          ? product.locations.find(
              (dLoc) => dLoc.locationId === transferData.destinationLocationId
            )?.quantity || 0
          : 0;

        products.push({
          product,
          sourceLocationId: locationId,
          sourceLocationName: getLocationName(locationId),
          sourceQuantity: locationStock.quantity,
          destinationQuantity,
        });
      }
    });

    setLocationProducts(products);
  };

  // Update destination quantities for all items
  const updateDestinationQuantities = (destinationLocationId: string) => {
    const currentItems = transferData.items;
    if (currentItems.length === 0) return;

    const updatedItems = currentItems.map((item) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
      const destinationQuantity =
        product?.locations.find(
          (loc) => loc.locationId === destinationLocationId
        )?.quantity || 0;

      return {
        ...item,
        destinationQuantity,
      };
    });

    setTransferData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Handle source location change
  const handleSourceLocationChange = (locationId: string) => {
    setTransferData((prev) => ({
      ...prev,
      sourceLocationIds: [locationId],
      // Clear items if source location changes
      items: [],
    }));
    setSelectedItems([]);
  };

  // Handle destination location change
  const handleDestinationLocationChange = (locationId: string) => {
    // First, save the current items to a variable so we can reference them
    const currentItems = transferData.items;

    setTransferData((prev) => ({
      ...prev,
      destinationLocationId: locationId,
    }));

    // Update destination quantities for items
    if (currentItems.length > 0) {
      const updatedItems = currentItems.map((item) => {
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
    const mainLocation = MOCK_LOCATIONS.find((loc) => loc.id === locationId);
    if (mainLocation) return mainLocation.name;

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

  // Add a single product to transfer
  const handleAddProduct = (productData: any) => {
    // Check if product already added
    const alreadyAdded = transferData.items.some(
      (item) =>
        item.productId === productData.product.id &&
        item.sourceLocationId === productData.sourceLocationId
    );

    if (alreadyAdded) return;

    const newItem: TransferItem = {
      productId: productData.product.id,
      productName: productData.product.name,
      productImage: productData.product.image,
      category: productData.product.category,
      sourceLocationId: productData.sourceLocationId,
      sourceLocationName: productData.sourceLocationName,
      sourceQuantity: productData.sourceQuantity,
      destinationQuantity: productData.destinationQuantity,
      quantity: 1, // Default quantity
    };

    setTransferData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Add multiple items from modal
  const handleAddItems = (newItems: TransferItem[]) => {
    setTransferData((prev) => ({
      ...prev,
      items: newItems,
    }));

    setIsAddItemsModalOpen(false);
  };

  // Update item quantities
  const handleUpdateQuantities = (updatedItems: TransferItem[]) => {
    setTransferData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
    setIsEditQuantitiesModalOpen(false);
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
  const getFilteredProducts = () => {
    // Filter either transfer items or location products based on if items exist
    if (transferData.items.length > 0) {
      return transferData.items.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sourceLocationName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    } else {
      return locationProducts.filter(
        (item) =>
          item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.product.category
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.sourceLocationName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }
  };

  // Complete transfer
  const handleCompleteTransfer = () => {
    // Would normally call API to save transfer
    const newTransfer = {
      id: `TR-${Date.now()}`,
      ...transferData,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: "completed" as const,
    };

    console.log("Transfer completed:", newTransfer);
    setIsTransferCompleted(true);
  };

  // Check if form is valid
  const isFormValid =
    transferData.sourceLocationIds.length > 0 &&
    transferData.destinationLocationId &&
    transferData.items.length > 0 &&
    transferData.sourceLocationIds.indexOf(
      transferData.destinationLocationId
    ) === -1;

  // If transfer is completed, show completion view
  if (isTransferCompleted) {
    return (
      <TransferCompletedView
        transfer={transferData as any}
        onBackToTransfers={() => router.push("/transfers")}
      />
    );
  }

  // Get the filtered products to display
  const filteredProducts = getFilteredProducts();
  const showingTransferItems = transferData.items.length > 0;

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-bold mb-6">Transfer</h1>

        {/* Location Selection */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <LocationFilter
              selectedLocationId={transferData.sourceLocationIds[0] || ""}
              onLocationSelect={handleSourceLocationChange}
              placeholder="Select source location"
              disabledLocationIds={
                transferData.destinationLocationId
                  ? [transferData.destinationLocationId]
                  : []
              }
            />
          </div>

          <div className="flex items-center justify-center text-gray-400 mt-10">
            <div className="hidden md:block w-10 h-0.5 bg-gray-200"></div>
            <ChevronDown className="hidden md:block -rotate-90 mx-2" />
            <div className="hidden md:block w-10 h-0.5 bg-gray-200"></div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <LocationFilter
              selectedLocationId={transferData.destinationLocationId}
              onLocationSelect={handleDestinationLocationChange}
              placeholder="Select destination location"
              disabledLocationIds={transferData.sourceLocationIds}
            />
          </div>
        </div>

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

            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => setIsEditQuantitiesModalOpen(true)}
              disabled={transferData.items.length === 0}
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => setIsAddItemsModalOpen(true)}
              disabled={transferData.sourceLocationIds.length === 0}
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </Button>
          </div>
        </div>

        {/* Items table */}
        <Card className="mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
                  <th className="pl-4 py-4 pr-2">
                    {showingTransferItems && (
                      <Checkbox
                        checked={
                          selectedItems.length === transferData.items.length &&
                          transferData.items.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                        className="rounded"
                      />
                    )}
                  </th>
                  <th className="px-4 py-4">Photo</th>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">
                    <div className="flex flex-col">
                      <span>Quantity</span>
                      <span className="text-xs font-normal uppercase">
                        {showingTransferItems
                          ? "From Location"
                          : "Available Quantity"}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4">
                    {showingTransferItems ? "Transfer Amount" : "Action"}
                  </th>
                  {showingTransferItems && (
                    <th className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>Quantity</span>
                        <span className="text-xs font-normal uppercase">
                          To Location
                        </span>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  showingTransferItems ? (
                    // Show transfer items
                    filteredProducts.map((item: TransferItem, index) => {
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
                                <span className="text-gray-500 mr-2">Old</span>
                                <span className="text-gray-900">
                                  {item.sourceQuantity}
                                </span>
                                <span className="text-gray-500 mx-2">→</span>
                                <span className="text-gray-900">
                                  {item.sourceQuantity - item.quantity}
                                </span>
                                <span className="text-gray-500 ml-2">New</span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                From: {item.sourceLocationName}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {item.quantity}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center">
                                <span className="text-gray-500 mr-2">Old</span>
                                <span className="text-gray-900">
                                  {item.destinationQuantity}
                                </span>
                                <span className="text-gray-500 mx-2">→</span>
                                <span className="text-gray-900">
                                  {item.destinationQuantity + item.quantity}
                                </span>
                                <span className="text-gray-500 ml-2">New</span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                To:{" "}
                                {getLocationName(
                                  transferData.destinationLocationId
                                ) || "Select destination location"}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    // Show location products
                    filteredProducts.map((item, index) => (
                      <tr
                        key={`${item.product.id}-${item.sourceLocationId}`}
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        }
                      >
                        <td className="pl-4 py-4 pr-2">
                          {/* Empty cell for checkbox column */}
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
                          <div>
                            <div className="text-gray-900 font-medium">
                              {item.product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.product.category}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-gray-900">
                              {item.sourceQuantity}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.sourceLocationName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handleAddProduct(item)}
                          >
                            Add
                          </Button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={showingTransferItems ? 6 : 5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {!transferData.sourceLocationIds.length
                        ? "Please select a source location to view products"
                        : "No items have been added to the transfer. Click the Add button to select items."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Note field */}
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

        {/* Action buttons */}
        <div className="flex justify-end">
          <Button
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-2.5 rounded-lg"
            onClick={handleCompleteTransfer}
            disabled={!isFormValid}
          >
            Complete Transfer
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
      />
    </div>
  );
};

export default TransferModule;
