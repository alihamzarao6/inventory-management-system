"use client";
import React, { useState, useEffect } from "react";
import { Search, ArrowLeft, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { MOCK_CUSTOMERS } from "@/constants/mockCustomers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface LocationOption {
  id: string;
  name: string;
  type: string;
  isSubLocation?: boolean;
  parentId?: string;
}

interface LocationFiltersProps {
  selectedLocationIds?: string[];
  onLocationSelect: (locationIds: string[], isCustomer?: boolean) => void;
  showCustomers?: boolean;
  allowMultipleSelection?: boolean; // New prop to control multiple selection
  placeholder?: string;
}

const LocationFilters: React.FC<LocationFiltersProps> = ({
  selectedLocationIds = [],
  onLocationSelect,
  showCustomers = true,
  allowMultipleSelection = true, // Default to true (multiple selection)
  placeholder = "Search...",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMainLocation, setSelectedMainLocation] = useState<
    string | null
  >(null);
  const [viewMode, setViewMode] = useState<
    "locations" | "sublocations" | "customers"
  >("locations");
  const [selectedLocations, setSelectedLocations] = useState<LocationOption[]>(
    []
  );

  // Initialize selected locations from props
  useEffect(() => {
    const initialLocations: LocationOption[] = [];

    selectedLocationIds.forEach((id) => {
      // Check if it's a warehouse or store
      const mainLocation = MOCK_LOCATIONS.find((loc) => loc.id === id);
      if (mainLocation) {
        initialLocations.push({
          id: mainLocation.id,
          name: mainLocation.name,
          type: mainLocation.type,
        });
        return;
      }

      // Check if it's a sublocation
      const subLocation = MOCK_SUB_LOCATIONS.find((sub) => sub.id === id);
      if (subLocation) {
        const parent = MOCK_LOCATIONS.find(
          (loc) => loc.id === subLocation.parentId
        );
        initialLocations.push({
          id: subLocation.id,
          name: subLocation.name,
          type: subLocation.type,
          isSubLocation: true,
          parentId: subLocation.parentId,
        });
        return;
      }

      // Check if it's a customer
      const customer = MOCK_CUSTOMERS.find((cust) => cust.id === id);
      if (customer) {
        initialLocations.push({
          id: customer.id,
          name: customer.name,
          type: "Customer",
        });
      }
    });

    setSelectedLocations(initialLocations);
  }, [selectedLocationIds]);

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle main location selection to show sublocations
  const handleMainLocationSelect = (locationId: string) => {
    setSelectedMainLocation(locationId);
    setViewMode("sublocations");
  };

  // Toggle location selection
  const toggleLocationSelection = (location: LocationOption) => {
    if (!allowMultipleSelection) {
      // For single selection, replace the entire selection with just this one
      setSelectedLocations([location]);
      onLocationSelect([location.id], location.type === "Customer");
      return;
    }

    setSelectedLocations((prev) => {
      const isSelected = prev.some((loc) => loc.id === location.id);

      // Remove if already selected
      if (isSelected) {
        return prev.filter((loc) => loc.id !== location.id);
      }

      // Add if not already selected
      return [...prev, location];
    });

    // Update parent component with selected IDs
    const updatedIds = selectedLocations.some((loc) => loc.id === location.id)
      ? selectedLocations
          .filter((loc) => loc.id !== location.id)
          .map((loc) => loc.id)
      : [...selectedLocations.map((loc) => loc.id), location.id];

    onLocationSelect(updatedIds, location.type === "Customer");
  };

  // Select all locations in a warehouse
  const selectAllInWarehouse = (warehouseId: string) => {
    if (!allowMultipleSelection) {
      // For single selection, just select the warehouse itself
      const warehouse = MOCK_LOCATIONS.find((loc) => loc.id === warehouseId);
      if (warehouse) {
        setSelectedLocations([
          {
            id: warehouse.id,
            name: warehouse.name,
            type: warehouse.type,
          },
        ]);
        onLocationSelect([warehouse.id]);
      }
      return;
    }

    // Get all sublocations for this warehouse
    const sublocations = MOCK_SUB_LOCATIONS.filter(
      (sub) => sub.parentId === warehouseId
    ).map((sub) => ({
      id: sub.id,
      name: sub.name,
      type: sub.type,
      isSubLocation: true,
      parentId: sub.parentId,
    }));

    // Add the main warehouse
    const warehouse = MOCK_LOCATIONS.find((loc) => loc.id === warehouseId);
    const allLocations = warehouse
      ? [
          { id: warehouse.id, name: warehouse.name, type: warehouse.type },
          ...sublocations,
        ]
      : sublocations;

    // Combine with existing selections (excluding this warehouse and its subs)
    const existingOtherLocations = selectedLocations.filter(
      (loc) => loc.id !== warehouseId && loc.parentId !== warehouseId
    );

    const newSelections = [...existingOtherLocations, ...allLocations];
    setSelectedLocations(newSelections);
    onLocationSelect(newSelections.map((loc) => loc.id));
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
    setSelectedLocations([]);
    onLocationSelect([]);
    setSearchQuery("");
    setSelectedMainLocation(null);
    setViewMode("locations");
  };

  // Check if location is selected
  const isLocationSelected = (id: string) => {
    return selectedLocations.some((loc) => loc.id === id);
  };

  // Remove a single selection
  const removeSelection = (id: string) => {
    const newSelections = selectedLocations.filter((loc) => loc.id !== id);
    setSelectedLocations(newSelections);
    onLocationSelect(newSelections.map((loc) => loc.id));
  };

  return (
    <div className="py-2">
      {/* Back Navigation for sublocations view */}
      {viewMode === "sublocations" && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center text-sm mb-2 mx-3"
          onClick={() => setViewMode("locations")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Locations
        </Button>
      )}

      {/* Search Input */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Input
            type="search"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-8 py-2 h-10 text-sm"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>

      {/* Selected Locations Display */}
      {selectedLocations.length > 0 && (
        <div className="px-4 mb-3">
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedLocations.map((location) => (
              <Badge
                key={location.id}
                variant="secondary"
                className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                {location.name}
                <button
                  className="ml-1 rounded-full hover:bg-blue-200"
                  onClick={() => removeSelection(location.id)}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

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
          {showCustomers && (
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
          )}
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
                {getFilteredLocations().warehouses.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex justify-between items-center px-2 py-2 rounded-md hover:bg-gray-100"
                  >
                    <div
                      className="flex items-center flex-1 gap-2 cursor-pointer"
                      onClick={() => handleMainLocationSelect(loc.id)}
                    >
                      {loc.name}
                    </div>
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
                {getFilteredLocations().stores.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex justify-between items-center px-2 py-2 rounded-md hover:bg-gray-100"
                  >
                    <div
                      className="flex items-center flex-1 gap-2 cursor-pointer"
                      onClick={() => handleMainLocationSelect(loc.id)}
                    >
                      {loc.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sub-locations List */}
        {viewMode === "sublocations" && selectedMainLocation && (
          <div className="px-2">
            <div className="flex flex-row justify-between items-center">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-2">
                {MOCK_LOCATIONS.find((loc) => loc.id === selectedMainLocation)
                  ?.name || "Selected Location"}
              </h3>
              {allowMultipleSelection && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs px-2 py-1 text-gray-600 hover:text-gray-900 h-7"
                  onClick={() => selectAllInWarehouse(selectedMainLocation)}
                >
                  Select All
                </Button>
              )}
            </div>

            {/* Parent location option */}
            <div
              className="px-3 py-2.5 rounded-md bg-gray-50 border border-gray-100 mb-3 cursor-pointer"
              onClick={() => {
                const location = MOCK_LOCATIONS.find(
                  (loc) => loc.id === selectedMainLocation
                );
                if (location) {
                  toggleLocationSelection({
                    id: location.id,
                    name: location.name,
                    type: location.type,
                  });
                }
              }}
            >
              <div className="flex items-center">
                <Checkbox
                  checked={isLocationSelected(selectedMainLocation)}
                  onCheckedChange={() => {
                    const location = MOCK_LOCATIONS.find(
                      (loc) => loc.id === selectedMainLocation
                    );
                    if (location) {
                      toggleLocationSelection({
                        id: location.id,
                        name: location.name,
                        type: location.type,
                      });
                    }
                  }}
                  className="rounded mr-2"
                />
                <div>
                  <div className="font-medium">
                    All in{" "}
                    {MOCK_LOCATIONS.find(
                      (loc) => loc.id === selectedMainLocation
                    )?.name || "Selected Location"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Select the main location
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              {getSubLocations().map((subloc) => (
                <div
                  key={subloc.id}
                  className="flex items-center px-3 py-2.5 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    toggleLocationSelection({
                      id: subloc.id,
                      name: subloc.name,
                      type: subloc.type,
                      isSubLocation: true,
                      parentId: subloc.parentId,
                    })
                  }
                >
                  <Checkbox
                    checked={isLocationSelected(subloc.id)}
                    onCheckedChange={() =>
                      toggleLocationSelection({
                        id: subloc.id,
                        name: subloc.name,
                        type: subloc.type,
                        isSubLocation: true,
                        parentId: subloc.parentId,
                      })
                    }
                    className="rounded mr-2"
                  />
                  {subloc.name}
                </div>
              ))}
            </div>

            {/* No sub-locations */}
            {getSubLocations().length === 0 && (
              <div className="py-3 text-center text-gray-500 text-sm">
                No sub-locations found
              </div>
            )}
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
                  className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    toggleLocationSelection({
                      id: customer.id,
                      name: customer.name,
                      type: "Customer",
                    })
                  }
                >
                  <Checkbox
                    checked={isLocationSelected(customer.id)}
                    onCheckedChange={() =>
                      toggleLocationSelection({
                        id: customer.id,
                        name: customer.name,
                        type: "Customer",
                      })
                    }
                    className="rounded mr-2"
                  />
                  {customer.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedLocations.length > 0 && (
          <div className="px-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50 mb-2"
              onClick={clearFilters}
            >
              Clear All Selections
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default LocationFilters;
