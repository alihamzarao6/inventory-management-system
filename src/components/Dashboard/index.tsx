import React from "react";
import { LocationCard } from "./LocationCard";
import { AddLocationCard } from "./AddLocationCard";
import { MOCK_LOCATIONS } from "@/constants/mockLocations";
import { Location } from "@/types/locations";
import { LocationFormData } from "@/types/forms";
import { LocationDialog } from "./LocationDialog";

const Dashboard = () => {
  const [locations, setLocations] = React.useState<Location[]>(MOCK_LOCATIONS);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<"warehouse" | "store">(
    "warehouse"
  );

  const handleLocationClick = (location: Location) => {
    console.log("Location clicked:", location);
  };

  const handleAddLocation = (type: "warehouse" | "store") => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleSubmit = (formData: LocationFormData) => {
    const newLocation: Location = {
        id: String(Date.now()),
        type: dialogType,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBIDNT6JGHMHbuLbZMMG87ytyXnIPBnvsZgw&s",
        ...formData,
        subLocations: []
    };
    setLocations([...locations, newLocation]);
    setDialogOpen(false);
  };

  const warehouses = locations.filter((loc) => loc.type === "warehouse");
  const stores = locations.filter((loc) => loc.type === "store");

  return (
    <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Warehouses Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Warehouses</h2>
            <p className="text-gray-500 mt-1">
              Manage your warehouse locations
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Additional header actions can go here */}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {warehouses.map((warehouse) => (
            <LocationCard
              key={warehouse.id}
              location={warehouse}
              onClick={handleLocationClick}
            />
          ))}
          <AddLocationCard
            type="warehouse"
            onClick={() => handleAddLocation("warehouse")}
          />
        </div>
      </section>

      {/* Stores Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Stores</h2>
            <p className="text-gray-500 mt-1">Manage your store locations</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Additional header actions can go here */}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {stores.map((store) => (
            <LocationCard
              key={store.id}
              location={store}
              onClick={handleLocationClick}
            />
          ))}
          <AddLocationCard
            type="store"
            onClick={() => handleAddLocation("store")}
          />
        </div>
      </section>

      <LocationDialog
        type={dialogType}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Dashboard;
