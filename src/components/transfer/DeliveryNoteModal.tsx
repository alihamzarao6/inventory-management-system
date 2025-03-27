"use client";
import React, { useRef } from "react";
import { Share, Printer } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransferFormData } from "@/types/transfers";
import { createHandleExport } from "@/utils/pdfExport";

interface DeliveryNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: TransferFormData;
  sourceLocationName: string;
  destinationLocationName: string;
}

const DeliveryNoteModal: React.FC<DeliveryNoteModalProps> = ({
  open,
  onOpenChange,
  transfer,
  sourceLocationName,
  destinationLocationName,
}) => {
  const printRef = useRef<HTMLElement | null>(null);

  // Generate delivery note ID - retained from original component
  const generateDeliveryNoteId = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `Z-D-${year}/${month}${Math.floor(Math.random() * 9000 + 1000)}`;
  };

  // Format date - retained from original component
  const formatDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = now.toLocaleString("default", { month: "short" });
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Create export handler using our utility function
  const handleExport = createHandleExport(
    // @ts-ignore
    printRef,
    "delivery-note",
    destinationLocationName.replace(/\s+/g, "-").toLowerCase()
  );

  // Print document - retained from original component
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Delivery Note</title>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] bg-gray-100 p-0 overflow-hidden flex flex-col h-[90vh]">
        <div className="flex justify-between items-center p-4 bg-white border-b">

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
            // @ts-ignore
            ref={printRef}
            className="bg-white p-8 shadow-md max-w-4xl mx-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="text-sm text-gray-500">Page: 1/1</div>
              <div className="text-sm text-gray-500">
                Delivery #: {generateDeliveryNoteId()}
              </div>
              <div className="text-sm text-gray-500">Date: {formatDate()}</div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-8">
              Delivery Note
            </h1>

            <div className="mb-8">
              <div className="flex justify-between mb-4">
                <div>
                  <div className="text-gray-500 mb-1">
                    Select Deliver From Location ↓
                  </div>
                  <div className="font-medium">{sourceLocationName}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Deliver To:</div>
                  <div className="font-medium">{destinationLocationName}</div>
                </div>
              </div>

              <div className="border-t border-b py-2 grid grid-cols-7">
                <div className="col-span-5 font-medium">Item Name</div>
                <div className="col-span-2 text-right font-medium">
                  Quantity
                </div>
              </div>

              {transfer.items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.sourceLocationId}`}
                  className="border-b py-2 grid grid-cols-7"
                >
                  <div className="col-span-5">{item.productName}</div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                </div>
              ))}
            </div>

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

export default DeliveryNoteModal;
