import React, { useState, useRef } from "react";
import { X, Upload, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils";
import { ProductFormData } from "@/types/products";
import { PRODUCT_CATEGORIES } from "@/constants/mockProducts";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";

// Form validation schema
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  initialQuantity: z.coerce
    .number()
    .int()
    .min(0, "Quantity must be 0 or greater"),
  reorderLevel: z.coerce
    .number()
    .int()
    .min(0, "Reorder level must be 0 or greater"),
  initialLocationId: z.string().min(1, "Initial location is required"),
  costPrice: z.coerce.number().min(0, "Cost price must be 0 or greater"),
  wholesalePrice: z.coerce
    .number()
    .min(0, "Wholesale price must be 0 or greater"),
  retailPrice: z.coerce.number().min(0, "Retail price must be 0 or greater"),
  note: z.string().optional(),
});

interface AddProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData & { image: string }) => void;
  initialData?: Partial<ProductFormData & { image: string }>;
  similarNameWarning?: string | null;
}

const AddProductForm: React.FC<AddProductFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  similarNameWarning,
}) => {
  const [image, setImage] = useState<string | null>(initialData?.image || null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!initialData?.name;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<Omit<ProductFormData, "image">>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? (({ image, ...rest }) => rest)(initialData)
      : {
          name: "",
          category: "",
          initialQuantity: 0,
          reorderLevel: 5,
          initialLocationId: "",
          costPrice: 0,
          wholesalePrice: 0,
          retailPrice: 0,
          note: "",
        },
  });

  // Watch for the cost and wholesale price to calculate retail
  const costPrice = watch("costPrice");
  const wholesalePrice = watch("wholesalePrice");

  // Calculate suggested retail price in USD from wholesale price (30% markup)
  const suggestedRetailUSD = wholesalePrice * 1.3;

  // Convert USD to ZMW (assuming 1 USD = 17.5 ZMW)
  const suggestedRetailZMW = suggestedRetailUSD * 17.5;

  // Reset form when closed or in edit mode
  React.useEffect(() => {
    if (!open) {
      if (!isEditMode) {
        reset();
        setImage(null);
      }
      setImageError(null);
    } else if (open && isEditMode && initialData) {
      reset(initialData);
      if (initialData.image) {
        setImage(initialData.image);
      }
    }
  }, [open, reset, isEditMode, initialData]);

  // File drag and drop handlers
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
    if (!image) {
      setImageError("Please upload an image");
      return;
    }

    onSubmit({
      ...data,
      image: image,
    });
    onOpenChange(false);
  });

  // Get flat list of all locations (main + sub)
  const getAllLocations = () => {
    const mainLocations = MOCK_LOCATIONS.map((loc) => ({
      id: loc.id,
      name: loc.name,
      type: loc.type,
      isSubLocation: false,
    }));

    const subLocations = MOCK_SUB_LOCATIONS.map((subloc) => {
      const parentLocation = MOCK_LOCATIONS.find(
        (loc) => loc.id === subloc.parentId
      );
      return {
        id: subloc.id,
        name: `${subloc.name} (${parentLocation?.name || "Unknown"})`,
        type: subloc.type,
        isSubLocation: true,
      };
    });

    return [...mainLocations, ...subLocations].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "Warehouse" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white p-0 overflow-hidden flex flex-col h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            {isEditMode ? "Edit Item" : "New Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form
            id="productForm"
            onSubmit={onFormSubmit}
            className="p-6 pt-4 space-y-6"
          >
            {/* Image Upload */}
            <div className="space-y-2">
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
                      className="bg-gray-900 hover:bg-opacity-70 text-white rounded-full p-1 transition-colors"
                      title="Change image"
                    >
                      <Upload className="h-4 w-4 text-white z-40" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-gray-900 hover:bg-opacity-70 text-white rounded-full p-1 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-4 w-4 text-white z-40" />
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

            <div className="space-y-4">
              {/* Item Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Item Name
                </Label>
                <Input
                  id="name"
                  placeholder="Item Name"
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

                {similarNameWarning && (
                  <div className="flex items-center mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    <p className="text-xs text-yellow-700">
                      {similarNameWarning}
                    </p>
                  </div>
                )}
              </div>

              {/* Item Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-700">
                  Item Category
                </Label>
                <Select
                  defaultValue={initialData?.category}
                  onValueChange={(value) => setValue("category", value)}
                >
                  <SelectTrigger
                    className={cn(
                      "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                      errors.category &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-0">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Quantity and Reorder Level */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialQuantity" className="text-gray-700">
                    Initial Quantity
                  </Label>
                  <Input
                    id="initialQuantity"
                    type="number"
                    placeholder="0"
                    {...register("initialQuantity")}
                    className={cn(
                      "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                      errors.initialQuantity &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.initialQuantity && (
                    <p className="text-sm text-red-500 mt-0">
                      {errors.initialQuantity.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorderLevel" className="text-gray-700">
                    Reorder Alert Quantity
                  </Label>
                  <Input
                    id="reorderLevel"
                    type="number"
                    placeholder="5"
                    {...register("reorderLevel")}
                    className={cn(
                      "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                      errors.reorderLevel &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.reorderLevel && (
                    <p className="text-sm text-red-500 mt-0">
                      {errors.reorderLevel.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Initial Location */}
              <div className="space-y-2">
                <Label htmlFor="initialLocationId" className="text-gray-700">
                  Initial Location
                </Label>
                <Select
                  defaultValue={initialData?.initialLocationId}
                  onValueChange={(value) =>
                    setValue("initialLocationId", value)
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                      errors.initialLocationId &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  >
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="" disabled>
                      Select a location
                    </SelectItem>
                    {getAllLocations().map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.initialLocationId && (
                  <p className="text-sm text-red-500 mt-0">
                    {errors.initialLocationId.message}
                  </p>
                )}
              </div>

              {/* Cost Price */}
              <div className="space-y-2">
                <Label htmlFor="costPrice" className="text-gray-700">
                  Item Cost Price (USD)
                </Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("costPrice")}
                  className={cn(
                    "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                    errors.costPrice &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.costPrice && (
                  <p className="text-sm text-red-500 mt-0">
                    {errors.costPrice.message}
                  </p>
                )}
              </div>

              {/* Wholesale Price */}
              <div className="space-y-2">
                <Label htmlFor="wholesalePrice" className="text-gray-700">
                  Item Wholesale Price (USD)
                </Label>
                <Input
                  id="wholesalePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("wholesalePrice")}
                  className={cn(
                    "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                    errors.wholesalePrice &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.wholesalePrice && (
                  <p className="text-sm text-red-500 mt-0">
                    {errors.wholesalePrice.message}
                  </p>
                )}

                {costPrice > 0 && wholesalePrice > 0 && (
                  <p className="text-xs text-gray-500">
                    Margin:{" "}
                    {(
                      ((wholesalePrice - costPrice) / wholesalePrice) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                )}
              </div>

              {/* Retail Price */}
              <div className="space-y-2">
                <Label htmlFor="retailPrice" className="text-gray-700">
                  Item Retail Price (ZMW)
                </Label>
                <Input
                  id="retailPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("retailPrice")}
                  className={cn(
                    "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                    errors.retailPrice &&
                      "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.retailPrice && (
                  <p className="text-sm text-red-500 mt-0">
                    {errors.retailPrice.message}
                  </p>
                )}

                {wholesalePrice > 0 && (
                  <p className="text-xs text-gray-500">
                    Suggested: K {suggestedRetailZMW.toFixed(2)} ($
                    {suggestedRetailUSD.toFixed(2)})
                  </p>
                )}
              </div>

              {/* Note */}
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
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50">
          <Button
            type="submit"
            form="productForm"
            className="w-full bg-gray-900 hover:bg-opacity-80 text-white py-2.5 rounded-[10px] transition-colors duration-200"
          >
            {isEditMode ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductForm;
