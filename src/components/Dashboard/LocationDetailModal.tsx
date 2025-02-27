import React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";
import { Location, SubLocation } from "@/types/locations";
import { SubLocationCard } from "./SubLocationCard";
import AddSubLocationDialog from "./AddSubLocationDialog";
import AddLocationDialog from "./AddLocationDialog";
import ConfirmationDialog from "../shared/ConfirmationDialog";

interface LocationDetailModalProps {
  location: Location;
  open: boolean;
  onClose: () => void;
  onAddSubLocation?: (
    parentLocation: Location,
    subLocation: SubLocation
  ) => void;
  onUpdateLocation?: (updatedLocation: Location) => void;
  onUpdateSubLocation?: (
    parentLocationId: string,
    updatedSubLocation: SubLocation
  ) => void;
  onDeleteSubLocation?: (
    parentLocationId: string,
    subLocationId: string
  ) => void;
  onViewProducts?: (subLocation: SubLocation) => void;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  location,
  open,
  onClose,
  onAddSubLocation = () => {},
  onUpdateLocation = () => {},
  onUpdateSubLocation = () => {},
  onDeleteSubLocation = () => {},
  onViewProducts = () => {},
}) => {
  const router = useRouter();
  const [addSubLocationDialogOpen, setAddSubLocationDialogOpen] =
    React.useState(false);
  const [editLocationDialogOpen, setEditLocationDialogOpen] =
    React.useState(false);
  const [editSubLocationDialogOpen, setEditSubLocationDialogOpen] =
    React.useState(false);
  const [selectedSubLocation, setSelectedSubLocation] =
    React.useState<SubLocation | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] =
    React.useState(false);
  const [subLocationToDelete, setSubLocationToDelete] =
    React.useState<SubLocation | null>(null);

  const handleAddSubLocation = (data: any) => {
    const newSubLocation: SubLocation = {
      id: `sub-${Date.now()}`,
      parentId: location.id,
      type: location.type,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
      note: data.note,
      image: data.image,
    };

    onAddSubLocation(location, newSubLocation);
  };

  const handleUpdateLocation = (data: any) => {
    const updatedLocation: Location = {
      ...location,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
      note: data.note,
      image: data.image,
    };

    onUpdateLocation(updatedLocation);
  };

  const handleEditSubLocation = (subLocation: SubLocation) => {
    setSelectedSubLocation(subLocation);
    setEditSubLocationDialogOpen(true);
  };

  const handleUpdateSubLocation = (data: any) => {
    if (selectedSubLocation) {
      const updatedSubLocation: SubLocation = {
        ...selectedSubLocation,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        note: data.note,
        image: data.image,
      };

      onUpdateSubLocation(location.id, updatedSubLocation);
    }
  };

  const handleDeleteSubLocation = (subLocation: SubLocation) => {
    setSubLocationToDelete(subLocation);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteSubLocation = () => {
    if (subLocationToDelete) {
      onDeleteSubLocation(location.id, subLocationToDelete.id);
    }
  };

  // Handle navigation to location's products page
  const navigateToLocationProducts = () => {
    router.push(`/products/${location.id}`);
    onClose();
  };

  // Handle navigation to sublocation's products page
  const navigateToSubLocationProducts = (subLocation: SubLocation) => {
    router.push(`/products/${subLocation.id}`);
    onClose();
  };

  return (
    <>
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
                      <Button
                        className="flex-1 bg-black hover:bg-gray-800 text-white rounded-[10px]"
                        onClick={navigateToLocationProducts}
                      >
                        Products
                      </Button>
                      <Button
                        variant="outline"
                        className="flex gap-2 items-center rounded-[10px]"
                        onClick={() => setEditLocationDialogOpen(true)}
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
                  onClick={() => setAddSubLocationDialogOpen(true)}
                  className="gap-2 rounded-[10px]"
                >
                  Add New
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {location.subLocations && location.subLocations.length > 0 ? (
                  location.subLocations.map((subLocation) => (
                    <SubLocationCard
                      key={subLocation.id}
                      subLocation={subLocation}
                      onViewProducts={() =>
                        navigateToSubLocationProducts(subLocation)
                      }
                      onEdit={handleEditSubLocation}
                      onDelete={handleDeleteSubLocation}
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

      {/* Add Sub-Location Dialog */}
      <AddSubLocationDialog
        parentLocation={location}
        open={addSubLocationDialogOpen}
        onOpenChange={setAddSubLocationDialogOpen}
        onSubmit={handleAddSubLocation}
      />

      {/* Edit Location Dialog */}
      <AddLocationDialog
        type={location.type === "Warehouse" ? "Warehouse" : "Store"}
        open={editLocationDialogOpen}
        onOpenChange={setEditLocationDialogOpen}
        onSubmit={handleUpdateLocation}
        initialData={{
          name: location.name,
          email: location.email,
          phone: location.phone,
          address: location.address,
          city: location.city,
          country: location.country,
          note: location.note || "",
          image: location.image,
        }}
      />

      {/* Edit Sub-Location Dialog */}
      {selectedSubLocation && (
        <AddSubLocationDialog
          parentLocation={location}
          open={editSubLocationDialogOpen}
          onOpenChange={setEditSubLocationDialogOpen}
          onSubmit={handleUpdateSubLocation}
          initialData={{
            name: selectedSubLocation.name,
            email: selectedSubLocation.email,
            phone: selectedSubLocation.phone,
            address: selectedSubLocation.address,
            city: selectedSubLocation.city,
            country: selectedSubLocation.country,
            note: selectedSubLocation.note || "",
            image: selectedSubLocation.image,
            parentId: selectedSubLocation.parentId,
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        onOpenChange={setDeleteConfirmationOpen}
        onConfirm={confirmDeleteSubLocation}
        title="Delete Sub-location"
        description={`Are you sure you want to delete ${subLocationToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  );
};

export default LocationDetailModal;
