"use client";
import React from "react";
import { User, DollarSign, Box, Wallet } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransferFormData } from "@/types/transfers";
import WholesaleInvoiceModal from "./WholesaleInvoiceModal";
import RetailInvoiceModal from "./RetailInvoiceModal";
import { CustomerInvoiceModal } from "./CustomerInvoiceModal";

interface InvoiceOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: TransferFormData & { isCustomerDestination?: boolean };
  sourceLocationName: string;
  destinationLocationName: string;
  isCustomerDestination?: boolean;
}

const InvoiceOptionsModal: React.FC<InvoiceOptionsModalProps> = ({
  open,
  onOpenChange,
  transfer,
  sourceLocationName,
  destinationLocationName,
  isCustomerDestination,
}) => {
  const [invoiceType, setInvoiceType] = React.useState<
    "wholesale" | "retail" | "customer" | null
  >(null);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setInvoiceType(null);
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] bg-gray-100 p-0 overflow-hidden flex flex-col">
          <div className="p-6 bg-white border-b">
            <h2 className="text-xl font-semibold">Generate Invoice</h2>
            <p className="text-sm text-gray-500 mt-1">Select invoice type</p>
          </div>

          <div className="p-6 flex flex-col gap-4">
            {isCustomerDestination ? (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg flex justify-between items-center"
                onClick={() => setInvoiceType("customer")}
              >
                <span className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Invoice
                </span>
                <Box className="h-5 w-5 opacity-70" />
              </Button>
            ) : (
              <>
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white py-6 text-lg flex justify-between items-center"
                  onClick={() => setInvoiceType("wholesale")}
                >
                  <span className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Wholesale Invoice (USD)
                  </span>
                  <Box className="h-5 w-5 opacity-70" />
                </Button>

                <Button
                  className="bg-green-600 hover:bg-green-700 text-white py-6 text-lg flex justify-between items-center"
                  onClick={() => setInvoiceType("retail")}
                >
                  <span className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    Retail Invoice (ZMW)
                  </span>
                  <Box className="h-5 w-5 opacity-70" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Wholesale Invoice Modal */}
      <WholesaleInvoiceModal
        open={invoiceType === "wholesale"}
        onOpenChange={(open) => {
          if (!open) setInvoiceType(null);
        }}
        transfer={transfer}
        sourceLocationName={sourceLocationName}
        destinationLocationName={destinationLocationName}
      />

      {/* Retail Invoice Modal */}
      <RetailInvoiceModal
        open={invoiceType === "retail"}
        onOpenChange={(open) => {
          if (!open) setInvoiceType(null);
        }}
        transfer={transfer}
        sourceLocationName={sourceLocationName}
        destinationLocationName={destinationLocationName}
      />

      {/* Customer Invoice Modal */}
      <CustomerInvoiceModal
        open={invoiceType === "customer"}
        onOpenChange={(open: any) => {
          if (!open) setInvoiceType(null);
        }}
        transfer={transfer}
        sourceLocationName={sourceLocationName}
        destinationLocationName={destinationLocationName}
      />
    </>
  );
};

export default InvoiceOptionsModal;
