"use client";
import React, { useState } from "react";
import { Search, ArrowLeft, Printer, FileText, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import DeliveryNoteModal from "./DeliveryNoteModal";
import InvoiceOptionsModal from "./InvoiceOptionsModal";
import { TransferFormData } from "@/types/transfers";
import { cn } from "@/utils";

interface TransferCompletedViewProps {
  transfer: TransferFormData & {
    id?: string;
    isCustomerSource?: boolean;
    isCustomerDestination?: boolean;
  };
  onBackToTransfers: () => void;
}

const TransferCompletedView: React.FC<TransferCompletedViewProps> = ({
  transfer,
  onBackToTransfers,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeliveryNoteOpen, setIsDeliveryNoteOpen] = useState(false);
  const [isInvoiceOptionsOpen, setIsInvoiceOptionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("items");

  // Get location names
  const getSourceLocationNames = () => {
    return transfer.sourceLocationIds
      .map((id) => {
        // Check if it's a customer
        if (id.startsWith("cust-")) {
          return "Customer"; // This would be replaced with actual customer name in real app
        }

        const mainLocation = MOCK_LOCATIONS.find((loc) => loc.id === id);
        if (mainLocation) return mainLocation.name;

        const subLocation = MOCK_SUB_LOCATIONS.find(
          (subloc) => subloc.id === id
        );
        if (subLocation) {
          const parentLocation = MOCK_LOCATIONS.find(
            (loc) => loc.id === subLocation.parentId
          );
          return `${subLocation.name} (${parentLocation?.name || "Unknown"})`;
        }

        return "Unknown Location";
      })
      .join(" / ");
  };

  const getDestinationLocationName = () => {
    // Check if it's a customer
    if (transfer.destinationLocationId.startsWith("cust-")) {
      return "Customer"; // This would be replaced with actual customer name in real app
    }

    const mainLocation = MOCK_LOCATIONS.find(
      (loc) => loc.id === transfer.destinationLocationId
    );
    if (mainLocation) return mainLocation.name;

    const subLocation = MOCK_SUB_LOCATIONS.find(
      (subloc) => subloc.id === transfer.destinationLocationId
    );
    if (subLocation) {
      const parentLocation = MOCK_LOCATIONS.find(
        (loc) => loc.id === subLocation.parentId
      );
      return `${subLocation.name} (${parentLocation?.name || "Unknown"})`;
    }

    return "Unknown Location";
  };

  // Filter items by search term
  const filteredItems = transfer.items.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sourceLocationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = now.toLocaleString("default", { month: "short" });
    const year = now.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  // Mock transfer history data - would come from API in real app
  const transferHistory = [
    {
      id: "log-1",
      action: "Transfer Created",
      user: "John Doe",
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      details: "Transfer initiated with locations selected",
    },
    {
      id: "log-2",
      action: "Items Selected",
      user: "John Doe",
      timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 min ago
      details: `Selected ${transfer.items.length} items for transfer`,
    },
    {
      id: "log-3",
      action: "Quantities Set",
      user: "John Doe",
      timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
      details: "Set transfer quantities for selected items",
    },
    {
      id: "log-4",
      action: "Transfer Completed",
      user: "John Doe",
      timestamp: new Date().toISOString(), // now
      details: "Transfer completed successfully",
    },
  ];

  return (
    <div className="p-4 min-h-screen">
      <div className="max-w-[1200px] mx-auto">
        {/* <div className="flex items-center mb-6 gap-4">
          <Button onClick={onBackToTransfers} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Transfer
          </Button>
        </div> */}

        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Transfer Details</h1>

              <h2 className="text-xl font-bold text-green-500 mb-1">
                Transfer #{transfer.id || "New"}
              </h2>
              <div className="text-gray-600">
                <p>
                  <span className="font-medium">Status:</span> Completed
                </p>
                <p>
                  <span className="font-medium">From:</span>{" "}
                  {getSourceLocationNames()}
                </p>
                <p>
                  <span className="font-medium">To:</span>{" "}
                  {getDestinationLocationName()}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-600">
                <span className="font-medium">Date:</span> {formatDate()}
              </p>
              <div className="flex gap-4 mt-2">
                <Button
                  variant="outline"
                  className="gap-2 bg-white"
                  onClick={() => setIsDeliveryNoteOpen(true)}
                >
                  <FileText className="h-4 w-4" />
                  Delivery Note
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 bg-white"
                  onClick={() => setIsInvoiceOptionsOpen(true)}
                >
                  <Box className="h-4 w-4" />
                  Invoice
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs for Items and History */}
          <Tabs
            defaultValue="items"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant={activeTab === "items" ? "default" : "outline"}
                onClick={() => setActiveTab("items")}
                className={cn(
                  "px-6 py-2 rounded-lg",
                  activeTab === "items"
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                )}
              >
                Items
              </Button>
              <Button
                variant={activeTab === "history" ? "default" : "outline"}
                onClick={() => setActiveTab("history")}
                className={cn(
                  "px-6 py-2 rounded-lg",
                  activeTab === "history"
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                )}
              >
                History
              </Button>
            </div>
            <TabsContent value="items" className="space-y-4">
              <div className="relative max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Search items..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
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
                      <th className="px-6 py-4">Transfer Amount</th>
                      <th className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>Quantity</span>
                          <span className="text-xs font-normal uppercase">
                            To Location
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item, index) => (
                        <tr
                          key={`${item.productId}-${item.sourceLocationId}`}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                          }
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
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {item.quantity}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center">
                                <span className="text-gray-900">
                                  {item.destinationQuantity}
                                </span>
                                <span className="text-gray-500 mx-2">→</span>
                                <span className="text-gray-900">
                                  {item.destinationQuantity + item.quantity}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                To: {getDestinationLocationName()}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No items found matching your search
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {transfer.note && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-base font-semibold mb-2">Note:</h3>
                  <p className="text-gray-700">{transfer.note}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                {transferHistory.map((event) => (
                  <div key={event.id} className="border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{event.action}</h3>
                        <p className="text-sm text-gray-500">{event.details}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{event.user}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Delivery Note Modal */}
      <DeliveryNoteModal
        open={isDeliveryNoteOpen}
        onOpenChange={setIsDeliveryNoteOpen}
        transfer={transfer}
        sourceLocationName={getSourceLocationNames()}
        destinationLocationName={getDestinationLocationName()}
      />

      {/* Invoice Options Modal */}
      <InvoiceOptionsModal
        open={isInvoiceOptionsOpen}
        onOpenChange={setIsInvoiceOptionsOpen}
        transfer={transfer}
        sourceLocationName={getSourceLocationNames()}
        destinationLocationName={getDestinationLocationName()}
        isCustomerDestination={transfer.isCustomerDestination}
      />
    </div>
  );
};

export default TransferCompletedView;
