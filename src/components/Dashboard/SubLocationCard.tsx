import React from "react";
import { SubLocation } from "@/types/locations";
import { Pencil, Trash2 } from "lucide-react";

interface SubLocationCardProps {
  subLocation: SubLocation;
  onViewProducts: (subLocation: SubLocation) => void;
  onEdit?: (subLocation: SubLocation) => void;
  onDelete?: (subLocation: SubLocation) => void;
}

export const SubLocationCard: React.FC<SubLocationCardProps> = ({
  subLocation,
  onViewProducts,
  onEdit,
  onDelete,
}) => {
  // Prevent event bubbling for action buttons
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(subLocation);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(subLocation);
  };

  const handleViewProducts = (e: React.MouseEvent) => {
    e.preventDefault();
    onViewProducts(subLocation);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group">
      <div className="relative">
        {/* Image Container */}
        <div className="aspect-video relative overflow-hidden bg-gray-100">
          <img
            src={subLocation.image}
            alt={subLocation.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Action Icons Container - positioned at the bottom of the image */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
          <button
            onClick={handleEdit}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors text-white"
            title="Edit Sub-location"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-600 transition-colors text-white"
            title="Delete Sub-location"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-3">
        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-opacity-80 transition-colors">
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
          onClick={handleViewProducts}
          className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-opacity-80 transition-colors duration-300 font-medium mt-4"
        >
          Products
        </button>
      </div>
    </div>
  );
};
