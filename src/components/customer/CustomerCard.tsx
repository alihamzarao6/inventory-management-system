import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";
import { Customer } from "@/types/customer";
import { cn } from "@/utils";
import { getProductsByCustomerId } from "@/constants/mockCustomers";

interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
  className?: string;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onClick,
  className,
}) => {
  // Get the number of products for this customer
  const customerProducts = getProductsByCustomerId(customer.id);
  const productCount = customerProducts.length;

  // Format the creation date
  const formattedDate = new Date(customer.createdAt).toLocaleDateString();

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="aspect-video relative bg-gray-100">
        <img
          src={customer.image}
          alt={customer.name}
          className="w-full h-full object-cover"
        />
      </div>

      <CardContent className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {customer.name}
        </h3>

        <div className="space-y-2 mt-3">
          <div className="flex items-center text-gray-600 text-sm">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{customer.email}</span>
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <Phone className="h-4 w-4 mr-2 text-gray-400" />
            <span>{customer.phone}</span>
          </div>

          <div className="flex items-start text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
            <div>
              <span className="block">
                {customer.city}, {customer.country}
              </span>
            </div>
          </div>
        </div>

        {customer.note && (
          <div className="mt-3 bg-blue-50 p-2 rounded-md text-sm text-gray-700">
            <p className="line-clamp-2">{customer.note}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {productCount} {productCount === 1 ? "product" : "products"}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onClick && onClick();
          }}
        >
          Products
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomerCard;
