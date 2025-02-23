import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";
import { Location, SubLocation } from "@/types/locations";
import { SubLocationCard } from "./SubLocationCard";

interface LocationDetailModalProps {
  location: Location;
  open: boolean;
  onClose: () => void;
  onAddSubLocation: (parentLocation: Location) => void;
  onViewProducts: (subLocation: SubLocation) => void;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  location,
  open,
  onClose,
  onAddSubLocation,
  onViewProducts,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1100px] bg-white p-0 overflow-y-auto max-h-[90vh]">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">
            {location.name}
          </h2>
        </div>

        <div className="divide-y">
          {/* Location Details Section */}
          <div className="p-6">
            <div className="flex gap-8">
              {/* Image */}
              <div className="w-1/3">
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500">
                        {location.type} Email:
                      </span>{" "}
                      {location.email}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Phone Number:</span>{" "}
                      {location.phone}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Address:</span>{" "}
                      {location.address}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">City:</span>{" "}
                      {location.city}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Country:</span>{" "}
                      {location.country}
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button className="flex-1 bg-black hover:bg-gray-800 text-white rounded-[10px]">
                      Products
                    </Button>
                    <Button
                      variant="outline"
                      className="flex gap-2 items-center rounded-[10px]"
                      onClick={() => console.log("Edit clicked")}
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-locations Section */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Sub {location.type}s
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage sub-locations for {location.name}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => onAddSubLocation(location)}
                className="gap-2 rounded-[10px]"
              >
                Add New
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {location.subLocations.length > 0 ? (
                location.subLocations.map((subLocation) => (
                  <SubLocationCard
                    key={subLocation.id}
                    subLocation={subLocation}
                    onViewProducts={onViewProducts}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">
                    No sub-{location.type}s found. Add one to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDetailModal;
