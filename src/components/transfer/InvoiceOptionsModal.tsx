"use client"
import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransferFormData } from "@/types/transfers";
import WholesaleInvoiceModal from "./WholesaleInvoiceModal";
import RetailInvoiceModal from "./RetailInvoiceModal";

interface InvoiceOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: TransferFormData;
  sourceLocationName: string;
  destinationLocationName: string;
}

const InvoiceOptionsModal: React.FC<InvoiceOptionsModalProps> = ({
  open,
  onOpenChange,
  transfer,
  sourceLocationName,
  destinationLocationName,
}) => {
  const [invoiceType, setInvoiceType] = React.useState<
    "wholesale" | "retail" | null
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

          <div className="p-10 flex flex-col gap-6">
            <Button
              className="bg-black hover:bg-gray-800 text-white py-6 text-lg"
              onClick={() => setInvoiceType("wholesale")}
            >
              Generate Wholesale Invoice
            </Button>

            <Button
              className="bg-black hover:bg-gray-800 text-white py-6 text-lg"
              onClick={() => setInvoiceType("retail")}
            >
              Generate Retail Invoice
            </Button>
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
    </>
  );
};

export default InvoiceOptionsModal;
