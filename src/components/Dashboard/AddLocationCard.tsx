interface AddLocationCardProps {
  type: "warehouse" | "store";
  onClick: () => void;
}

export const AddLocationCard: React.FC<AddLocationCardProps> = ({ type, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-500 transition-colors duration-300 cursor-pointer group flex items-center justify-center"
  >
    <div className="aspect-video">
      <div className="text-center">
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-50 transition-colors duration-300">
          <svg
            className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          Add New {type}
        </h3>
        <p className="text-gray-500 mt-2">
          Click to add a new {type.toLowerCase()}
        </p>
      </div>
    </div>
  </div>
);
