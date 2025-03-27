"use client";
import React, { useRef } from "react";
import { Share, Printer, User, Phone, Mail, MapPin } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransferFormData } from "@/types/transfers";
import { MOCK_CUSTOMERS } from "@/constants/mockCustomers";

interface CustomerDeliveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: TransferFormData & { isCustomerDestination?: boolean };
  sourceLocationName: string;
  destinationLocationName: string;
}

const CustomerDeliveryModal: React.FC<CustomerDeliveryModalProps> = ({
  open,
  onOpenChange,
  transfer,
  sourceLocationName,
  destinationLocationName,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  // Generate delivery note ID
  const generateDeliveryNoteId = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `Z-CD-${year}/${month}${Math.floor(Math.random() * 9000 + 1000)}`;
  };

  // Format date
  const formatDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = now.toLocaleString("default", { month: "short" });
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Get customer details
  const getCustomerDetails = () => {
    if (!transfer.destinationLocationId) return null;

    return MOCK_CUSTOMERS.find(
      (customer) => customer.id === transfer.destinationLocationId
    );
  };

  const customer = getCustomerDetails();

  // Print document
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Delivery Note</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Export document
  const handleExport = () => {
    // In a real app, this would generate a PDF
    console.log("Export customer delivery note");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] bg-gray-100 p-0 overflow-hidden flex flex-col h-[90vh]">
        <div className="flex justify-between items-center p-4 bg-white border-b">
          <div className="font-semibold flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-500" />
            Customer Delivery Note
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleExport}
              className="rounded-full"
            >
              <Share className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrint}
              className="rounded-full"
            >
              <Printer className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div
            ref={printRef}
            className="bg-white p-8 shadow-md max-w-4xl mx-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="text-sm text-gray-500">Page: 1/1</div>
              <div className="text-sm text-gray-500">
                Customer Delivery #: {generateDeliveryNoteId()}
              </div>
              <div className="text-sm text-gray-500">Date: {formatDate()}</div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-6">
              Customer Delivery Note
            </h1>

            {customer && (
              <div className="mb-8 border p-4 rounded-md bg-blue-50">
                <h3 className="font-medium text-blue-700 mb-2 flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer Name:</p>
                    <p className="font-medium">{customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Info:</p>
                    <p className="flex items-center mt-1">
                      <Phone className="h-3 w-3 mr-1 text-gray-500" />
                      {customer.phone}
                    </p>
                    <p className="flex items-center mt-1">
                      <Mail className="h-3 w-3 mr-1 text-gray-500" />
                      {customer.email}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Delivery Address:</p>
                    <p className="flex items-start mt-1">
                      <MapPin className="h-3 w-3 mr-1 mt-1 text-gray-500" />
                      <span>
                        {customer.address}, {customer.city}, {customer.country}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="flex justify-between mb-4">
                <div>
                  <div className="text-gray-500 mb-1">
                    Delivered From Location:
                  </div>
                  <div className="font-medium">{sourceLocationName}</div>
                </div>
              </div>

              <div className="border-t border-b py-2 grid grid-cols-8">
                <div className="col-span-4 font-medium">Item Name</div>
                <div className="col-span-2 font-medium">Category</div>
                <div className="col-span-2 text-right font-medium">
                  Quantity
                </div>
              </div>

              {transfer.items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.sourceLocationId}`}
                  className="border-b py-2 grid grid-cols-8"
                >
                  <div className="col-span-4">{item.productName}</div>
                  <div className="col-span-2 text-gray-600">
                    {item.category}
                  </div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                </div>
              ))}
            </div>

            {transfer.note && (
              <div className="mb-8 border p-4 rounded-md bg-gray-50">
                <h3 className="font-medium mb-2">Delivery Notes:</h3>
                <p className="text-gray-700">{transfer.note}</p>
              </div>
            )}

            <div className="mt-16 grid grid-cols-2 gap-8">
              <div>
                <div className="h-px w-full bg-gray-300 mb-2"></div>
                <div className="text-center text-sm text-gray-500">
                  Delivered By (Signature)
                </div>
              </div>
              <div>
                <div className="h-px w-full bg-gray-300 mb-2"></div>
                <div className="text-center text-sm text-gray-500">
                  Received By (Signature)
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDeliveryModal;
