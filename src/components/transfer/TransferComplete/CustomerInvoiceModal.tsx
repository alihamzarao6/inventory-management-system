"use client";
import React, { useRef } from "react";
import { Share, Printer, User, Phone, Mail, MapPin } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransferFormData } from "@/types/transfers";
import { MOCK_CUSTOMERS } from "@/constants/mockCustomers";
import { MOCK_PRODUCTS } from "@/constants/mockProducts";

interface CustomerInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: TransferFormData & { isCustomerDestination?: boolean };
  sourceLocationName: string;
  destinationLocationName: string;
}

export const CustomerInvoiceModal: React.FC<CustomerInvoiceModalProps> = ({
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
    return `Z-CI-${year}/${month}${Math.floor(Math.random() * 9000 + 1000)}`;
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

  // Get product prices and calculate totals
  const getInvoiceData = () => {
    let subtotal = 0;
    let totalDiscount = 0;

    const items = transfer.items.map((item) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);

      // First check if customer has special pricing relationship
      const customerProducts: any = []; // This would come from your API or mock data
      const customerProduct = customerProducts.find(
        (cp: any) =>
          cp.productId === item.productId &&
          cp.customerId === transfer.destinationLocationId
      );

      let price = product?.retailPrice || 0; // Default to retail price
      let discount = 0;

      // Apply customer-specific pricing if available
      if (customerProduct) {
        if (customerProduct.specialPrice) {
          price = customerProduct.specialPrice;
        } else if (customerProduct.discount) {
          discount =
            (product?.retailPrice || 0) * (customerProduct.discount / 100);
          price = (product?.retailPrice || 0) - discount;
        }
      }

      const itemDiscount = discount * item.quantity;
      const amount = price * item.quantity;

      subtotal += amount + itemDiscount;
      totalDiscount += itemDiscount;

      return {
        ...item,
        price,
        discount: discount,
        amount,
      };
    });

    const tax = subtotal * 0.16; // 16% tax
    const totalAmount = subtotal - totalDiscount + tax;

    return {
      items,
      subtotal,
      totalDiscount,
      tax,
      totalAmount,
    };
  };

  const invoiceData = getInvoiceData();

  // Print document
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Invoice</title>
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
    console.log("Export customer invoice");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] bg-gray-100 p-0 overflow-hidden flex flex-col h-[90vh]">
        <div className="flex justify-between items-center p-4 bg-white border-b">
          <div className="font-semibold flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-500" />
            Customer Invoice
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
              <div className="text-2xl font-bold text-blue-600">INVOICE</div>
              <div className="text-sm text-gray-500">
                Invoice #: {generateInvoiceId()}
              </div>
              <div className="text-sm text-gray-500">Date: {formatDate()}</div>
            </div>

            {customer && (
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Billed From:
                  </h3>
                  <div className="font-medium">{sourceLocationName}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Billed To:
                  </h3>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-gray-600 text-sm">
                    {customer.address}
                    <br />
                    {customer.city}, {customer.country}
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Phone className="h-3 w-3 mr-1" /> {customer.phone}
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <Mail className="h-3 w-3 mr-1" /> {customer.email}
                  </div>
                </div>
              </div>
            )}

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b border-t">
                  <th className="py-3 text-left">Item</th>
                  <th className="py-3 text-center">Quantity</th>
                  <th className="py-3 text-right">Unit Price</th>
                  <th className="py-3 text-right">Discount</th>
                  <th className="py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr
                    key={`${item.productId}-${item.sourceLocationId}`}
                    className="border-b"
                  >
                    <td className="py-3">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-xs text-gray-500">
                        {item.category}
                      </div>
                    </td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">
                      K {item.price.toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      {item.discount > 0
                        ? `K ${(item.discount * item.quantity).toFixed(2)}`
                        : "-"}
                    </td>
                    <td className="py-3 text-right font-medium">
                      K {item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-8">
              <div className="w-1/2">
                <div className="flex justify-between py-2 text-gray-600">
                  <span>Subtotal:</span>
                  <span>K {invoiceData.subtotal.toFixed(2)}</span>
                </div>
                {invoiceData.totalDiscount > 0 && (
                  <div className="flex justify-between py-2 text-gray-600">
                    <span>Discount:</span>
                    <span>- K {invoiceData.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-gray-600">
                  <span>Tax (16%):</span>
                  <span>K {invoiceData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-300 font-medium text-lg">
                  <span>Total Amount:</span>
                  <span>K {invoiceData.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {transfer.note && (
              <div className="mb-8 border p-4 rounded-md bg-gray-50">
                <h3 className="font-medium mb-1">Notes:</h3>
                <p className="text-gray-700 text-sm">{transfer.note}</p>
              </div>
            )}

            <div className="mb-8 text-sm text-gray-500">
              <p className="font-medium mb-1">Payment Terms:</p>
              <p>
                Payment due within 30 days. Please make checks payable to Your
                Company Name.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-8">
              <div>
                <div className="h-px w-full bg-gray-300 mb-2"></div>
                <div className="text-center text-sm text-gray-500">
                  Authorized Signature
                </div>
              </div>
              <div>
                <div className="h-px w-full bg-gray-300 mb-2"></div>
                <div className="text-center text-sm text-gray-500">
                  Customer Signature
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
