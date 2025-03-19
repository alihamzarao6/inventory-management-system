// Product Type Definitions
export interface ProductLocation {
    locationId: string;
    quantity: number;
    isSubLocation: boolean;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    image: string;
    costPrice: number;
    wholesalePrice: number;
    retailPrice: number; // in local currency (ZMW)
    retailPriceUSD: number; // Converted to USD
    locations: ProductLocation[];
    reorderLevel: number;
    note?: string;
    createdAt: string;
}

// Form data for adding/editing product
export interface ProductFormData {
    name: string;
    category: string;
    initialQuantity: number;
    reorderLevel: number;
    initialLocationId: string;
    costPrice: number;
    wholesalePrice: number;
    retailPrice: number;
    note?: string;
    image: string;
}

// Filter types
export type StockStatus = 'In Stock' | 'Out of Stock';

export type DateRangeType =
    | 'today'
    | 'yesterday'
    | 'last7days'
    | 'last30days'
    | 'thisMonth'
    | 'lastMonth'
    | 'custom';

export interface DateRange {
    type: DateRangeType;
    startDate?: Date;
    endDate?: Date;
}

export interface ProductFiltersT {
    search?: string;
    category?: string;
    categories?: string[];
    stockStatus?: StockStatus;
    dateRange?: DateRange;
    locationId?: string;
    locationIds?: string[];
    isCustomer?: boolean;
}

// Product table pagination
export interface PaginationState {
    page: number;
    perPage: number;
    total: number;
}

// Stock movement types
export type StockMovementType = 'Transfer' | 'StockAdjust' | 'IncomingItems';

export interface StockMovement {
    id: string;
    productId: string;
    sourceLocationId?: string; // Optional for IncomingItems
    destinationLocationId: string;
    quantity: number;
    type: StockMovementType;
    note?: string;
    createdAt: string;
}

// Customer data
export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
}