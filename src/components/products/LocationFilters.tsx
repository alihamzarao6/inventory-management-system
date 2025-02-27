import React, { useState, useEffect } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { MOCK_CUSTOMERS } from "@/constants/mockProducts";
import { Button } from "@/components/ui/button";

interface LocationFiltersProps {
  selectedLocationId?: string;
  onLocationSelect: (locationId: string, isCustomer?: boolean) => void;
}

const LocationFilters: React.FC<LocationFiltersProps> = ({
  selectedLocationId,
  onLocationSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMainLocation, setSelectedMainLocation] = useState<
    string | null
  >(null);
  const [viewMode, setViewMode] = useState<
    "locations" | "sublocations" | "customers"
  >("locations");

  // Reset to locations view when component is mounted
  useEffect(() => {
    setViewMode("locations");
  }, []);

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle main location selection
  const handleMainLocationSelect = (locationId: string) => {
    setSelectedMainLocation(locationId);
    setViewMode("sublocations");
  };

  // Handle selecting a warehouse/store to view all its products
  const handleViewAllProducts = (locationId: string) => {
    onLocationSelect(locationId);
  };

  // Handle selecting a sublocation to view its products
  const handleSubLocationSelect = (subLocationId: string) => {
    onLocationSelect(subLocationId);
  };

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    onLocationSelect(customerId, true);
  };

  // Get selected location name
  const getSelectedLocationName = () => {
    if (selectedMainLocation) {
      return (
        MOCK_LOCATIONS.find((loc) => loc.id === selectedMainLocation)?.name ||
        "Selected Location"
      );
    }
    return "";
  };

  // Filter locations based on search
  const getFilteredLocations = () => {
    const warehouses = MOCK_LOCATIONS.filter((loc) => loc.type === "Warehouse");
    const stores = MOCK_LOCATIONS.filter((loc) => loc.type === "Store");

    if (!searchQuery) {
      return { warehouses, stores };
    }

    const query = searchQuery.toLowerCase();
    return {
      warehouses: warehouses.filter((w) =>
        w.name.toLowerCase().includes(query)
      ),
      stores: stores.filter((s) => s.name.toLowerCase().includes(query)),
    };
  };

  // Get sub-locations for a main location
  const getSubLocations = () => {
    if (!selectedMainLocation) return [];

    return MOCK_SUB_LOCATIONS.filter(
      (sub) => sub.parentId === selectedMainLocation
    );
  };

  // Filter customers based on search
  const getFilteredCustomers = () => {
    if (!searchQuery) {
      return MOCK_CUSTOMERS;
    }

    const query = searchQuery.toLowerCase();
    return MOCK_CUSTOMERS.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
    );
  };

    const clearFilters = () => {
      onLocationSelect("");
      setSearchQuery("");
      setSelectedMainLocation("");
      setViewMode("locations");
    };

  return (
    <div className="py-2">
      {/* Back Navigation for sublocations view */}
      {viewMode === "sublocations" && (
        <button
          className="flex items-center text-sm mb-3 px-3 py-1 hover:bg-gray-100 rounded-md font-medium"
          onClick={() => setViewMode("locations")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Locations
        </button>
      )}

      {/* Search Input */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-8 py-2 h-9 text-sm"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>

      {/* Nav Tabs - Only show in main view */}
      {viewMode !== "sublocations" && (
        <div className="flex border-b mb-3">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              viewMode === "locations"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500"
            }`}
            onClick={() => setViewMode("locations")}
          >
            Locations
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              viewMode === "customers"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500"
            }`}
            onClick={() => setViewMode("customers")}
          >
            Customers
          </button>
        </div>
      )}

      {/* Location List */}
      <ScrollArea className="max-h-[300px] overflow-y-auto">
        {viewMode === "locations" && (
          <div className="px-2">
            {/* Warehouses */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-2">
                Warehouses
              </h3>
              <div className="space-y-1">
                {getFilteredLocations().warehouses.map((warehouse) => (
                  <div
                    key={warehouse.id}
                    className="flex justify-between items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  >
                    <div
                      className="flex-1"
                      onClick={() => handleMainLocationSelect(warehouse.id)}
                    >
                      {warehouse.name}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs px-2 py-1 text-gray-600 hover:text-gray-900 h-7"
                      onClick={() => handleViewAllProducts(warehouse.id)}
                    >
                      All
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-3" />

            {/* Stores */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-2">
                Stores
              </h3>
              <div className="space-y-1">
                {getFilteredLocations().stores.map((store) => (
                  <div
                    key={store.id}
                    className="flex justify-between items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  >
                    <div
                      className="flex-1"
                      onClick={() => handleMainLocationSelect(store.id)}
                    >
                      {store.name}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs px-2 py-1 text-gray-600 hover:text-gray-900 h-7"
                      onClick={() => handleViewAllProducts(store.id)}
                    >
                      All
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sub-locations List */}
        {viewMode === "sublocations" && selectedMainLocation && (
          <div className="px-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-2">
              {getSelectedLocationName()}
            </h3>

            {/* Parent location option */}
            <div
              className="px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer bg-gray-50 border border-gray-100 mb-2"
              onClick={() => handleViewAllProducts(selectedMainLocation)}
            >
              <div className="font-medium">
                All in {getSelectedLocationName()}
              </div>
              <div className="text-xs text-gray-500">
                View all items in this location
              </div>
            </div>

            <div className="space-y-1">
              {getSubLocations().map((sublocation) => (
                <div
                  key={sublocation.id}
                  className="px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSubLocationSelect(sublocation.id)}
                >
                  {sublocation.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customers List */}
        {viewMode === "customers" && (
          <div className="px-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-2">
              Customers
            </h3>
            <div className="space-y-1">
              {getFilteredCustomers().map((customer) => (
                <div
                  key={customer.id}
                  className="px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleCustomerSelect(customer.id)}
                >
                  {customer.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50 mb-2"
            onClick={clearFilters}
          >
            Clear All Filters
          </Button>
        </>
      </ScrollArea>
    </div>
  );
};

export default LocationFilters;
