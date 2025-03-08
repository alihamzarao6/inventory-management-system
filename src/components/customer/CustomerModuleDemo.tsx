"use client"
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Plus, ArrowRight } from "lucide-react";

// Sample customer data
const customers = [
  {
    id: "cust-1",
    name: "Z-MART Ndola Sales",
    email: "ndola-sales@zmart.com",
    phone: "+260 76 123 4567",
    city: "Ndola",
    country: "Zambia",
    productCount: 5,
  },
  {
    id: "cust-2",
    name: "Z-MART Kitwe Sales",
    email: "kitwe-sales@zmart.com",
    phone: "+260 76 987 6543",
    city: "Kitwe",
    country: "Zambia",
    productCount: 3,
  },
  {
    id: "cust-3",
    name: "Customer 3",
    email: "customer3@example.com",
    phone: "+260 96 555 1234",
    city: "Lusaka",
    country: "Zambia",
    productCount: 7,
  },
];

// Sample product data for customer details view
const products = [
  {
    id: "prod-1",
    name: "Product 1",
    category: "Electronics",
    quantity: 25,
    regularPrice: 150.0,
    specialPrice: 125.0,
    discount: null,
  },
  {
    id: "prod-2",
    name: "Product 2",
    category: "Furniture",
    quantity: 10,
    regularPrice: 300.0,
    specialPrice: null,
    discount: 15,
  },
  {
    id: "prod-3",
    name: "Product 3",
    category: "Kitchenware",
    quantity: 42,
    regularPrice: 75.0,
    specialPrice: null,
    discount: null,
  },
];

const CustomerModuleDemo = () => {
  const [selectedView, setSelectedView] = useState("list"); // 'list' or 'detail'
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null);

  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setSelectedView("detail");
  };

  // Go back to customer list
  const handleBackToList = () => {
    setSelectedView("list");
    setSelectedCustomer(null);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {selectedView === "list" ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-500">Manage your customer accounts</p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <Card
                key={customer.id}
                className="overflow-hidden hover:shadow-md cursor-pointer"
                onClick={() => handleCustomerSelect(customer)}
              >
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <div className="bg-white/70 backdrop-blur-sm rounded-full p-6">
                    <h3 className="text-xl font-semibold text-center">
                      {customer.name.charAt(0)}
                    </h3>
                  </div>
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
                </CardContent>

                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {customer.productCount}{" "}
                    {customer.productCount === 1 ? "product" : "products"}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCustomerSelect(customer);
                    }}
                  >
                    Products
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Customer header with back button */}
          <div>
            <Button
              variant="ghost"
              className="mb-4 -ml-4 text-gray-600"
              onClick={handleBackToList}
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to
              Customers
            </Button>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedCustomer?.name}
              </h1>
              <p className="text-gray-500">
                {selectedCustomer?.email} • {selectedCustomer?.phone}
              </p>
            </div>
          </div>

          {/* Customer details card */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <h3 className="text-lg font-medium mb-2">Customer Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{selectedCustomer?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{selectedCustomer?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p>
                        {selectedCustomer?.city}, {selectedCustomer?.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-2/3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Products</h3>
                    <Button size="sm">
                      <Plus className="mr-2 h-3 w-3" /> Add Product
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Product
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Quantity
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => {
                          // Determine displayed price and styling
                          let displayPrice = `${product.regularPrice.toFixed(
                            2
                          )}`;
                          let priceStyle = "";

                          if (product.specialPrice) {
                            displayPrice = `${product.specialPrice.toFixed(
                              2
                            )} (special)`;
                            priceStyle = "text-green-600";
                          } else if (product.discount) {
                            const discountedPrice =
                              product.regularPrice *
                              (1 - product.discount / 100);
                            displayPrice = `${discountedPrice.toFixed(2)} (${
                              product.discount
                            }% off)`;
                            priceStyle = "text-green-600";
                          }

                          return (
                            <tr key={product.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.category}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.quantity}
                              </td>
                              <td
                                className={`px-6 py-4 whitespace-nowrap text-sm ${priceStyle}`}
                              >
                                {displayPrice}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CustomerModuleDemo;
