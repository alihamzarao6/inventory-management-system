import React from "react";
import { SubLocation } from "@/types/locations";

interface SubLocationCardProps {
  subLocation: SubLocation;
  onViewProducts: (subLocation: SubLocation) => void;
}

export const SubLocationCard: React.FC<SubLocationCardProps> = ({
  subLocation,
  onViewProducts,
}) => (
  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group">
    <div className="aspect-video relative overflow-hidden bg-gray-100">
      <img
        src={subLocation.image}
        alt={subLocation.name}
        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <div className="p-6 space-y-3">
      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {subLocation.name}
      </h3>
      <div className="space-y-1">
        <p className="text-gray-600 flex items-center gap-2">
          <span className="text-sm">
            {subLocation.city}, {subLocation.country}
          </span>
        </p>
        <p className="text-gray-500 text-sm truncate">{subLocation.email}</p>
      </div>
      <button
        onClick={() => onViewProducts(subLocation)}
        className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors duration-300 font-medium mt-4"
      >
        Products
      </button>
    </div>
  </div>
);
