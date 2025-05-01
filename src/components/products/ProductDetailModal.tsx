"use client";
import React, { useState } from "react";
import { Edit, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types/products";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import { getTotalProductQuantity } from "@/constants/mockProducts";

interface ProductDetailModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewOnly?: boolean;
  onEdit?: (product: Product) => void;
  onTransfer?: (product: Product, locationId: string) => void;
  onStockAdjust?: (product: Product, locationId: string) => void;
  onIncomingItems?: (product: Product, locationId: string) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  open,
  onOpenChange,
  viewOnly = false,
  onEdit,
  onTransfer,
  onStockAdjust,
  onIncomingItems,
}) => {
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const [actionType, setActionType] = useState<
    "transfer" | "adjust" | "incoming" | null
  >(null);

  // Format currency
  const formatCurrency = (amount: number, currency: string = "$") => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  // Get location name from ID
  const getLocationName = (locationId: string, isSubLocation: boolean) => {
    if (isSubLocation) {
      const subLocation = MOCK_SUB_LOCATIONS.find((sl) => sl.id === locationId);
      return subLocation?.name || "Unknown Sub-location";
    } else {
      const location = MOCK_LOCATIONS.find((l) => l.id === locationId);
      return location?.name || "Unknown Location";
    }
  };

  // Handle action button clicks
  const handleAction = (
    type: "transfer" | "adjust" | "incoming",
    locationId: string
  ) => {
    if (viewOnly) return; // Don't perform actions in view-only mode

    setSelectedLocationId(locationId);
    setActionType(type);

    switch (type) {
      case "transfer":
        onTransfer && onTransfer(product, locationId);
        break;
      case "adjust":
        onStockAdjust && onStockAdjust(product, locationId);
        break;
      case "incoming":
        onIncomingItems && onIncomingItems(product, locationId);
        break;
    }
  };

  // Calculate profit margins
  const wholesaleMargin =
    ((product.wholesalePrice - product.costPrice) / product.wholesalePrice) *
    100;
  const retailMargin =
    ((product.retailPriceUSD - product.wholesalePrice) /
      product.retailPriceUSD) *
    100;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1000px] bg-white p-0 overflow-x-hidden overflow-y-autoflex flex-col max-h-[90vh]">
          <DialogHeader className="px-6 py-4 border-b flex justify-between items-center">
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              {product.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs
            defaultValue="details"
            className="flex-1 overflow-hidden rounded-xl bg-gray-50 shadow-lg"
          >
            <div className="border-b px-6">
              <TabsList className="flex gap-3 p-3 rounded-xl shadow-lg">
                <TabsTrigger value="details">Details</TabsTrigger>
                {!viewOnly && (
                  <TabsTrigger value="history">History</TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent
              value="details"
              className="flex-1 overflow-auto p-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <div className="divide-y">
                {/* Product Overview */}
                <div className="p-6">
                  <div className="flex gap-8">
                    {/* Image */}
                    <div className="w-1/3">
                      <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <div>
                              <h2 className="text-xl font-semibold text-gray-900">
                                {product.name}
                              </h2>
                              <p className="text-sm text-gray-500">
                                Category: {product.category}
                              </p>
                            </div>
                            {/* <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => onEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </Button> */}
                          </div>

                          <p className="text-sm">
                            <span className="text-gray-500">
                              Total Quantity:
                            </span>{" "}
                            <span className="font-medium">
                              {getTotalProductQuantity(product)}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">
                              Reorder Level:
                            </span>{" "}
                            <span className="font-medium">
                              {product.reorderLevel}
                            </span>
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-2">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Cost Price</p>
                            <p className="text-lg font-semibold">
                              {formatCurrency(product.costPrice)}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">
                              Wholesale Price
                            </p>
                            <p className="text-lg font-semibold">
                              {formatCurrency(product.wholesalePrice)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Margin: {wholesaleMargin.toFixed(1)}%
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">
                              Retail Price
                            </p>
                            <p className="text-lg font-semibold">
                              K {product.retailPrice.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(product.retailPriceUSD)} |{" "}
                              {retailMargin.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {product.note && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 font-medium mb-1">
                              Note
                            </p>
                            <p className="text-sm">{product.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Locations Section */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Locations ({product.locations.length})
                  </h3>

                  <div className="space-y-6">
                    {product.locations.map((location) => {
                      const locationName = getLocationName(
                        location.locationId,
                        location.isSubLocation
                      );

                      return (
                        <div
                          key={location.locationId}
                          className="bg-white border border-gray-200 rounded-xl p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {locationName}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Quantity: {location.quantity}
                              </p>
                            </div>
                            {/* <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-200 hover:bg-gray-50"
                                onClick={() =>
                                  handleAction("transfer", location.locationId)
                                }
                              >
                                Transfer
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-200 hover:bg-gray-50"
                                onClick={() =>
                                  handleAction("adjust", location.locationId)
                                }
                              >
                                Stock Adjust
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-200 hover:bg-gray-50"
                                onClick={() =>
                                  handleAction("incoming", location.locationId)
                                }
                              >
                                Incoming Items
                              </Button>
                            </div> */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-auto">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Product History
                  </h3>

                  <div className="text-center py-8 text-gray-500">
                    Product history will be implemented in future updates
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog - Will be used when implementing delete functionality */}
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        onOpenChange={setDeleteConfirmationOpen}
        onConfirm={() => {
          // Delete functionality would go here
          setDeleteConfirmationOpen(false);
        }}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  );
};

export default ProductDetailModal;
