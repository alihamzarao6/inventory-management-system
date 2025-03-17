"use client";
import React from "react";
import { Location } from "@/types/locations";
import LocationDetailModal from "./LocationDetailModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LocationCardProps {
  location: Location;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location }) => {
  const [detailOpen, setDetailOpen] = React.useState(false);

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2); // Limit to 2 characters
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group h-full flex flex-col">
        <div className="aspect-video relative overflow-hidden bg-gray-100">
          {location.image ? (
            <img
              src={location.image}
              alt={location.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              onClick={() => setDetailOpen(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center bg-gray-200"
              onClick={() => setDetailOpen(true)}
            >
              <span className="text-4xl font-bold text-gray-500">
                {getInitials(location.name)}
              </span>
            </div>
          )}
        </div>
        <div className="p-6 space-y-3 flex-1 flex flex-col">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="text-xl font-semibold text-gray-900 truncate group-hover:text-opacity-80 transition-colors">
                  {location.name}
                </h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>{location.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="space-y-1 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-gray-600 flex items-center gap-2 truncate">
                    <span className="text-sm">
                      {location.city}, {location.country}
                    </span>
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {location.city}, {location.country}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-gray-500 text-sm truncate">
                    {location.email}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{location.email}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <button
            className="w-full mt-auto bg-gray-900 text-white py-2 rounded-xl hover:bg-opacity-80 transition-colors duration-300 font-medium"
            onClick={() => setDetailOpen(true)}
          >
            View Details
          </button>
        </div>
      </div>

      <LocationDetailModal
        location={location}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onAddSubLocation={() => {}}
        onViewProducts={() => {}}
      />
    </>
  );
};
