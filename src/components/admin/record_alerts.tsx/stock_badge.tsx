import { Badge } from "@/components/ui/badge";

type Props = { 
  quantity: number; 
  reorderLevel: number; 
  className?: string; 
};

export default function StockBadge({ quantity, reorderLevel, className }: Props) {
  if (quantity === 0) return <Badge variant="default" className={`bg-red-500 text-white text-md text-md font-medium ${className}`}>Out of Stock</Badge>;
  if (quantity < reorderLevel) return <Badge variant="default" className={`bg-gray-200 text-gray-700 text-md font-medium ${className}`}>Low Stock</Badge>;
  return <Badge variant="default" className={` bg-gray-700 text-white text-md font-medium ${className}`}>In Stock</Badge>;
}
