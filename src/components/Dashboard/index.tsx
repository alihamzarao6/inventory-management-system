import React from "react";
import { LocationCard } from "./LocationCard";
import { AddLocationCard } from "./AddLocationCard";
import { MOCK_LOCATIONS } from "@/constants/mockLocations";
import { Location } from "@/types/locations";
import { LocationFormData } from "@/types/forms";
import { AddLocationDialog } from "./AddLocationDialog";

const Dashboard = () => {
  const [locations, setLocations] = React.useState<Location[]>(MOCK_LOCATIONS);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<"Warehouse" | "Store">(
    "Warehouse"
  );

  const handleAddLocation = (type: "Warehouse" | "Store") => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleSubmit = (formData: LocationFormData) => {
    const newLocation: Location = {
      id: String(Date.now()),
      type: dialogType,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBIDNT6JGHMHbuLbZMMG87ytyXnIPBnvsZgw&s",
      ...formData,
      subLocations: [],
    };
    setLocations([...locations, newLocation]);
    setDialogOpen(false);
  };

  const warehouses = locations.filter((loc) => loc.type === "Warehouse");
  const stores = locations.filter((loc) => loc.type === "Store");

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Warehouses Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Warehouses</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Additional header actions can go here */}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {warehouses.map((warehouse) => (
            <div key={warehouse.id} className="h-full">
              <LocationCard location={warehouse} />
            </div>
          ))}
          <div className="h-full">
            <AddLocationCard
              type="Warehouse"
              onClick={() => handleAddLocation("Warehouse")}
            />
          </div>
        </div>
      </section>

      {/* Stores Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Stores</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Additional header actions can go here */}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {stores.map((store) => (
            <div key={store.id} className="h-full">
              <LocationCard location={store} />
            </div>
          ))}
          <div className="h-full">
            <AddLocationCard
              type="Store"
              onClick={() => handleAddLocation("Store")}
            />
          </div>
        </div>
      </section>

      <AddLocationDialog
        type={dialogType}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Dashboard;
