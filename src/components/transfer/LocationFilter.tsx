"use client"
import React, { useState, useEffect } from "react";
import { ChevronDown, X, ArrowLeft, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "@/constants/mockLocations";
import { cn } from "@/utils";

interface LocationFilterProps {
  selectedLocationId?: string;
  onLocationSelect?: (locationId: string) => void;
  placeholder?: string;
  disabledLocationIds?: string[];
}

const LocationFilter: React.FC<LocationFilterProps> = ({
  selectedLocationId,
  onLocationSelect,
  placeholder = "Select a location",
  disabledLocationIds = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMainLocation, setSelectedMainLocation] = useState<
    string | null
  >(null);
  const [viewMode, setViewMode] = useState<"main" | "sub">("main");

  // Reset view mode when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setViewMode("main");
      setSearchTerm("");
    }
  }, [isOpen]);

  // Update view when selecting a main location
  useEffect(() => {
    if (selectedMainLocation) {
      setViewMode("sub");
    }
  }, [selectedMainLocation]);

  // Handle main location selection
  const handleMainLocationSelect = (locationId: string) => {
    if (disabledLocationIds.includes(locationId)) return;
    setSelectedMainLocation(locationId);
    setViewMode("sub");
  };

  // Handle selecting all products of a location
  const handleSelectMainLocation = (locationId: string) => {
    if (disabledLocationIds.includes(locationId)) return;

    if (onLocationSelect) {
      onLocationSelect(locationId);
    }
    setIsOpen(false);
  };

  // Handle sub-location selection
  const handleSubLocationSelect = (subLocationId: string) => {
    if (disabledLocationIds.includes(subLocationId)) return;

    if (onLocationSelect) {
      onLocationSelect(subLocationId);
    }
    setIsOpen(false);
  };

  // Get main locations filtered by search
  const getFilteredMainLocations = () => {
    const warehouses = MOCK_LOCATIONS.filter((loc) => loc.type === "Warehouse");
    const stores = MOCK_LOCATIONS.filter((loc) => loc.type === "Store");

    if (!searchTerm) {
      return { warehouses, stores };
    }

    const query = searchTerm.toLowerCase();
    return {
      warehouses: warehouses.filter((w) =>
        w.name.toLowerCase().includes(query)
      ),
      stores: stores.filter((s) => s.name.toLowerCase().includes(query)),
    };
  };

  // Get sub-locations for a main location
  const getSubLocations = (mainLocationId: string) => {
    if (!mainLocationId) return [];

    return MOCK_SUB_LOCATIONS.filter((sub) => sub.parentId === mainLocationId);
  };

  // Get location name by ID
  const getLocationName = (locationId: string) => {
    const mainLocation = MOCK_LOCATIONS.find((loc) => loc.id === locationId);
    if (mainLocation) return mainLocation.name;

    const subLocation = MOCK_SUB_LOCATIONS.find(
      (subloc) => subloc.id === locationId
    );
    if (subLocation) {
      const parent = MOCK_LOCATIONS.find(
        (loc) => loc.id === subLocation.parentId
      );
      return subLocation.name + (parent ? ` (${parent.name})` : "");
    }

    return placeholder;
  };

  // Button display text
  const buttonText = selectedLocationId
    ? getLocationName(selectedLocationId)
    : placeholder;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between border-gray-200 bg-white hover:bg-gray-50",
            selectedLocationId && "text-gray-900"
          )}
        >
          <span className="truncate">{buttonText}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        {viewMode === "main" ? (
          <div className="p-4 space-y-4">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-8"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <ScrollArea className="max-h-[300px] overflow-y-auto pr-3">
              {/* Warehouses section */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Warehouses
                </h3>
                <div className="space-y-1">
                  {getFilteredMainLocations().warehouses.map((loc) => (
                    <div
                      key={loc.id}
                      className={cn(
                        "px-2 py-2 rounded-md cursor-pointer flex justify-between items-center",
                        disabledLocationIds.includes(loc.id)
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-100"
                      )}
                    >
                      <div
                        className="flex-1"
                        onClick={() => handleMainLocationSelect(loc.id)}
                      >
                        {loc.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs px-2 py-1 text-gray-600 hover:text-gray-900 h-7"
                        onClick={() => handleSelectMainLocation(loc.id)}
                        disabled={disabledLocationIds.includes(loc.id)}
                      >
                        All
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-3" />

              {/* Stores section */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Stores
                </h3>
                <div className="space-y-1">
                  {getFilteredMainLocations().stores.map((loc) => (
                    <div
                      key={loc.id}
                      className={cn(
                        "px-2 py-2 rounded-md cursor-pointer flex justify-between items-center",
                        disabledLocationIds.includes(loc.id)
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-100"
                      )}
                    >
                      <div
                        className="flex-1"
                        onClick={() => handleMainLocationSelect(loc.id)}
                      >
                        {loc.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs px-2 py-1 text-gray-600 hover:text-gray-900 h-7"
                        onClick={() => handleSelectMainLocation(loc.id)}
                        disabled={disabledLocationIds.includes(loc.id)}
                      >
                        All
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* No results */}
              {getFilteredMainLocations().warehouses.length === 0 &&
                getFilteredMainLocations().stores.length === 0 && (
                  <div className="py-6 text-center text-gray-500">
                    No locations found matching "{searchTerm}"
                  </div>
                )}
            </ScrollArea>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Back button */}
            <button
              className="flex items-center text-sm mb-3 hover:text-gray-900"
              onClick={() => {
                setViewMode("main");
                setSelectedMainLocation(null);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Locations
            </button>

            <ScrollArea className="max-h-[300px] overflow-y-auto pr-3">
              {selectedMainLocation && (
                <>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    {MOCK_LOCATIONS.find(
                      (loc) => loc.id === selectedMainLocation
                    )?.name || "Location"}
                  </h3>

                  {/* Main location option */}
                  <div
                    className={cn(
                      "px-3 py-2.5 rounded-md bg-gray-50 border border-gray-100 mb-3",
                      disabledLocationIds.includes(selectedMainLocation)
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-100 cursor-pointer"
                    )}
                    onClick={() =>
                      !disabledLocationIds.includes(selectedMainLocation) &&
                      handleSelectMainLocation(selectedMainLocation)
                    }
                  >
                    <div className="font-medium">
                      All in{" "}
                      {
                        MOCK_LOCATIONS.find(
                          (loc) => loc.id === selectedMainLocation
                        )?.name
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      View all items in this location
                    </div>
                  </div>

                  {/* Sub-locations */}
                  <div className="space-y-1">
                    {getSubLocations(selectedMainLocation).map((subLoc) => (
                      <div
                        key={subLoc.id}
                        className={cn(
                          "px-3 py-2.5 rounded-md",
                          disabledLocationIds.includes(subLoc.id)
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100 cursor-pointer"
                        )}
                        onClick={() =>
                          !disabledLocationIds.includes(subLoc.id) &&
                          handleSubLocationSelect(subLoc.id)
                        }
                      >
                        {subLoc.name}
                      </div>
                    ))}
                  </div>

                  {/* No sub-locations */}
                  {getSubLocations(selectedMainLocation).length === 0 && (
                    <div className="py-3 text-center text-gray-500 text-sm">
                      No sub-locations found
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default LocationFilter;
