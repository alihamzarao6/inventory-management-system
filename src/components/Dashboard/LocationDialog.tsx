import React from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Zod Schema
const locationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  note: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationDialogProps {
  type: "warehouse" | "store";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LocationFormData) => void;
}

export const LocationDialog: React.FC<LocationDialogProps> = ({
  type,
  open,
  onOpenChange,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      note: "",
    },
  });

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white p-0 overflow-hidden flex flex-col h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Add New {type}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form
            id="locationForm"
            onSubmit={onFormSubmit}
            className="p-6 space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Name *
              </Label>
              <Input
                id="name"
                placeholder={`Enter ${type} name`}
                {...register("name")}
                className={cn(
                  "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                  errors.name &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  {...register("email")}
                  className={cn(
                    "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                    errors.email &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700">
                  Phone *
                </Label>
                <Input
                  id="phone"
                  placeholder="Phone number"
                  {...register("phone")}
                  className={cn(
                    "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                    errors.phone &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700">
                Address *
              </Label>
              <Input
                id="address"
                placeholder="Street address"
                {...register("address")}
                className={cn(
                  "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                  errors.address &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700">
                  City *
                </Label>
                <Input
                  id="city"
                  placeholder="City"
                  {...register("city")}
                  className={cn(
                    "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                    errors.city &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.city && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-gray-700">
                  Country *
                </Label>
                <Input
                  id="country"
                  placeholder="Country"
                  {...register("country")}
                  className={cn(
                    "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                    errors.country &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.country && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.country.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-gray-700">
                Note (Optional)
              </Label>
              <Textarea
                id="note"
                placeholder="Add any additional notes..."
                {...register("note")}
                className="border-gray-200 focus:border-gray-300 focus:ring-gray-300 min-h-[100px] rounded-xl"
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50">
          <Button
            type="submit"
            form="locationForm"
            className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white py-2.5 rounded-[10px] transition-colors duration-200"
          >
            Create {type}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDialog;
