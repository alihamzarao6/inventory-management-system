"use client";
import React, { useRef } from "react";
import { Share, Printer } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransferFormData } from "@/types/transfers";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";
import { createHandleExport } from "@/utils/pdfExport";

interface RetailInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: TransferFormData;
  sourceLocationName: string;
  destinationLocationName: string;
}

const RetailInvoiceModal: React.FC<RetailInvoiceModalProps> = ({
  open,
  onOpenChange,
  transfer,
  sourceLocationName,
  destinationLocationName,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  // Generate invoice ID
  const generateInvoiceId = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `Z-R-${year}/${month}${Math.floor(Math.random() * 9000 + 1000)}`;
  };

  // Format date
  const formatDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = now.toLocaleString("default", { month: "short" });
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Get product prices and calculate totals
  const getInvoiceData = () => {
    let totalAmount = 0;
    let vatAmount = 0;
    const vatRate = 0.16; // 16% VAT

    const items = transfer.items.map((item) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
      const price = product?.retailPrice || 0; // Use retail price for ZMW
      const discount = 0; // Could be dynamic
      const amount = price * item.quantity;

      totalAmount += amount;

      return {
        ...item,
        price,
        discount,
        amount,
      };
    });

    // Calculate VAT - in retail invoices we often include VAT
    vatAmount = totalAmount * vatRate;
    const grandTotal = totalAmount + vatAmount;

    return {
      items,
      subtotal: totalAmount,
      vatRate,
      vatAmount,
      grandTotal,
    };
  };

  const invoiceData = getInvoiceData();

  // Create export handler using our utility function
  const handleExport = createHandleExport(
    // @ts-ignore
    printRef,
    "retail-invoice",
    destinationLocationName.replace(/\s+/g, "-").toLowerCase()
  );

  // Print document
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Retail Invoice</title>
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
            ref={printRef}
            className="bg-white p-8 shadow-md max-w-4xl mx-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="text-sm text-gray-500">Page: 1/1</div>
              <div className="text-sm text-gray-500">
                #: {generateInvoiceId()}
              </div>
              <div className="text-sm text-gray-500">Date: {formatDate()}</div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-8">
              Retail Invoice
            </h1>

            <div className="mb-6 flex justify-center">
              <div>
                <div className="text-gray-500 mb-1">
                  Select Invoice Location ↓
                </div>
                <div className="font-medium">
                  Bill To: {destinationLocationName}
                </div>
              </div>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b border-t">
                  <th className="py-2 text-left">Item Name</th>
                  <th className="py-2 text-right">Quantity</th>
                  <th className="py-2 text-right">Price (ZMW)</th>
                  <th className="py-2 text-right">Discount</th>
                  <th className="py-2 text-right">Amount (ZMW)</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr
                    key={`${item.productId}-${item.sourceLocationId}`}
                    className="border-b"
                  >
                    <td className="py-2">{item.productName}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">
                      K {item.price.toFixed(2)}
                    </td>
                    <td className="py-2 text-right">
                      K {item.discount.toFixed(2)}
                    </td>
                    <td className="py-2 text-right">
                      K {item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-8">
              <div className="w-1/3 bg-gray-100 p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>K {invoiceData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT ({(invoiceData.vatRate * 100).toFixed(0)}%)</span>
                  <span>K {invoiceData.vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Amount</span>
                  <span>K {invoiceData.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-8">
              <div>
                <div className="h-px w-full bg-gray-300 mb-2"></div>
                <div className="text-center text-sm text-gray-500">
                  Authorized By (Signature)
                </div>
              </div>
              <div>
                <div className="h-px w-full bg-gray-300 mb-2"></div>
                <div className="text-center text-sm text-gray-500">
                  Customer (Signature)
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RetailInvoiceModal;
