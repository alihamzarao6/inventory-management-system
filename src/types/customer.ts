// Customer Type Definitions
export interface CustomerAddress {
    address: string;
    city: string;
    country: string;
}

export interface Customer {
    id: string;
    name: string;
    image: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    note?: string;
    createdAt: string;
}

// Customer product relationship
export interface CustomerProduct {
    id: string;
    customerId: string;
    productId: string;
    specialPrice?: number; // Optional special pricing for this customer
    discount?: number;     // Optional discount percentage
    note?: string;
    createdAt: string;
}

// Form data for adding/editing customer
export interface CustomerFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    note?: string;
    image: string;
}

// Filter types
export interface CustomerFiltersT {
    search?: string;
    dateRange?: {
        type: string;
        startDate?: Date;
        endDate?: Date;
    };
}

// Customer pagination
export interface CustomerPaginationState {
    page: number;
    perPage: number;
    total: number;
}