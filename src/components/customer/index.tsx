"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import CustomerCard from "@/components/customer/CustomerCard";
import AddCustomerForm from "@/components/customer/AddCustomerForm";
import {
  Customer,
  CustomerFiltersT,
  CustomerPaginationState,
} from "@/types/customer";
import {
  MOCK_CUSTOMERS,
  searchCustomersByName,
} from "@/constants/mockCustomers";
import useToast from "@/hooks/useToast";

const CustomersPage = () => {
  const router = useRouter();
  const { showToast } = useToast();

  // State management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<CustomerPaginationState>({
    page: 1,
    perPage: 12, // Show more cards per page
    total: 0,
  });

  // Modals
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Load customers
  useEffect(() => {
    setIsLoading(true);

    // Simulate API call with a delay
    setTimeout(() => {
      const customersData = [...MOCK_CUSTOMERS];
      setCustomers(customersData);
      setPagination((prev) => ({
        ...prev,
        total: customersData.length,
      }));
      setIsLoading(false);
    }, 300);
  }, []);

  // Apply search filter
  useEffect(() => {
    let result = [...customers];

    if (searchQuery) {
      result = searchCustomersByName(searchQuery);
    }

    setFilteredCustomers(result);
  }, [customers, searchQuery]);

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle customer selection - navigate to customer's products
  const handleCustomerSelect = (customer: Customer) => {
    router.push(`/customer/${customer.id}`);
  };

  // Handle adding a new customer
  const handleAddCustomer = async (data: any) => {
    // In a real app, this would be an API call
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: data.name,
      image: data.image,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
      note: data.note,
      createdAt: new Date().toISOString(),
    };

    // Add to customers list
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast("Customer added successfully", "success");
  };

  // Calculate current page data (pagination)
  const paginatedCustomers = filteredCustomers.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">Manage your customer accounts</p>
        </div>
        <Button variant={"outline"} className="bg-white" onClick={() => setAddCustomerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-10 py-2 h-12 bg-white"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      </div>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-xl h-64" />
          ))}
        </div>
      ) : paginatedCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onClick={() => handleCustomerSelect(customer)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">
            No customers found matching your criteria
          </p>
        </div>
      )}

      {/* Pagination - only show if we have more than one page */}
      {pagination.total > pagination.perPage && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
            >
              Previous
            </Button>

            {/* Simple page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({
                length: Math.ceil(pagination.total / pagination.perPage),
              }).map((_, idx) => (
                <Button
                  key={idx}
                  variant={pagination.page === idx + 1 ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: idx + 1 }))
                  }
                >
                  {idx + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={
                pagination.page * pagination.perPage >= pagination.total
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {addCustomerOpen && (
        <AddCustomerForm
          open={addCustomerOpen}
          onOpenChange={setAddCustomerOpen}
          onSubmit={handleAddCustomer}
        />
      )}

      {/* Floating add button for mobile */}
      <div className="fixed right-6 bottom-6 md:hidden">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setAddCustomerOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default CustomersPage;
