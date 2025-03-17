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
import { cn } from "@/utils";
import { Upload, X } from "lucide-react";
import { Location, SubLocation } from "@/types/locations";

// Zod Schema
const subLocationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().min(8, "Phone number must be at least 8 characters"),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  country: z.string().trim().min(1, "Country is required"),
  note: z.string().optional(),
});

type SubLocationFormData = z.infer<typeof subLocationSchema>;

interface SubLocationFormDataWithImage extends SubLocationFormData {
  image: string | null;
  parentId: string;
}

interface AddSubLocationDialogProps {
  parentLocation: Location;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SubLocationFormDataWithImage) => void;
  initialData?: SubLocationFormDataWithImage;
}

export const AddSubLocationDialog: React.FC<AddSubLocationDialogProps> = ({
  parentLocation,
  open,
  onOpenChange,
  onSubmit,
  initialData,
}) => {
  const [image, setImage] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubLocationFormData>({
    resolver: zodResolver(subLocationSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: parentLocation.city, // Pre-fill with parent location city
      country: parentLocation.country, // Pre-fill with parent location country
      note: "",
    },
  });

  // Set initial image if provided
  React.useEffect(() => {
    if (initialData?.image) {
      setImage(initialData.image);
    }
  }, [initialData]);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      if (!isEditMode) {
        reset();
        setImage(null);
      }
      setImageError(null);
    } else if (open && isEditMode && initialData) {
      reset(initialData);
      setImage(initialData.image);
    }
  }, [open, reset, isEditMode, initialData]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
      // Clear the input value to ensure the change event fires even if the same file is selected again
      e.target.value = "";
    }
  };

  const handleFile = (file: File) => {
    // Validate file is an image
    if (!file.type.match("image.*")) {
      setImageError("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size should be less than 5MB");
      return;
    }

    setImageError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target && typeof e.target.result === "string") {
        setImage(e.target.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onFormSubmit = handleSubmit((data) => {
    onSubmit({
      ...data,
      image,
      parentId: initialData?.parentId || parentLocation.id,
    });
    onOpenChange(false);
  });

  const subType =
    parentLocation.type === "Warehouse" ? "Sub Warehouse" : "Sub Store";
  const titleText = isEditMode
    ? `Edit ${subType}`
    : `Add New ${subType} to ${parentLocation.name}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white p-0 overflow-hidden flex flex-col h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            {titleText}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form
            id="subLocationForm"
            onSubmit={onFormSubmit}
            className="p-6 pt-0 space-y-6"
          >
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-gray-700">
                Thumbnail Image(Optional)
              </Label>

              {!image ? (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400",
                    imageError && "border-red-500 bg-red-50"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="rounded-full bg-gray-100 p-3">
                      <Upload className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-0">
                        PNG, JPG or JPEG (max. 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gray-900 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-100 transition-colors"
                      title="Change image"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-gray-900 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-100 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {imageError && (
                <p className="text-sm text-red-500 mt-0">{imageError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Name
              </Label>
              <Input
                id="name"
                placeholder={`${subType} Name`}
                {...register("name")}
                className={cn(
                  "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                  errors.name &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-0">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={`${subType} Email`}
                  {...register("email")}
                  className={cn(
                    "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                    errors.email &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-0">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700">
                  Phone
                </Label>
                <Input
                  id="phone"
                  placeholder={`${subType} Phone Number`}
                  {...register("phone")}
                  className={cn(
                    "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                    errors.phone &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-0">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700">
                Address
              </Label>
              <Input
                id="address"
                placeholder={`${subType} Street Address`}
                {...register("address")}
                className={cn(
                  "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                  errors.address &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-0">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700">
                  City
                </Label>
                <Input
                  id="city"
                  placeholder={`${subType} City`}
                  {...register("city")}
                  className={cn(
                    "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                    errors.city &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.city && (
                  <p className="text-sm text-red-500 mt-0">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-gray-700">
                  Country
                </Label>
                <Input
                  id="country"
                  placeholder={`${subType} Country`}
                  {...register("country")}
                  className={cn(
                    "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                    errors.country &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.country && (
                  <p className="text-sm text-red-500 mt-0">
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
            form="subLocationForm"
            className="w-full bg-gray-900 hover:bg-opacity-80 text-white py-2.5 rounded-[10px] transition-colors duration-200"
          >
            {isEditMode ? `Update ${subType}` : `Create ${subType}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubLocationDialog;
