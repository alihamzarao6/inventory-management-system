"use client";
import React from "react";
import { Location } from "@/types/locations";
import LocationDetailModal from "./LocationDetailModalProps";

interface LocationCardProps {
  location: Location;
  onClick: (location: Location) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onClick,
}) => {
  const [detailOpen, setDetailOpen] = React.useState(false);

  return (
    <>
      <div
        onClick={() => setDetailOpen(true)}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
      >
        <div className="aspect-video relative overflow-hidden bg-gray-100">
          <img
            src={location.image}
            alt={location.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6 space-y-3">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {location.name}
          </h3>
          <div className="space-y-1">
            <p className="text-gray-600 flex items-center gap-2">
              <span className="text-sm">
                {location.city}, {location.country}
              </span>
            </p>
            <p className="text-gray-500 text-sm truncate">{location.email}</p>
          </div>
          <button className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors duration-300 font-medium mt-4">
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
