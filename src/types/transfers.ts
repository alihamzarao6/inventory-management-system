import { Product, ProductLocation } from './products';
import { Location, SubLocation } from './locations';

export interface TransferItem {
    productId: string;
    productName: string;
    productImage: string;
    category: string;
    sourceLocationId: string;
    sourceLocationName: string;
    quantity: number;
    sourceQuantity: number;
    destinationQuantity: number;
}

export interface Transfer {
    id: string;
    sourceLocationIds: string[];
    destinationLocationId: string;
    items: TransferItem[];
    createdAt: string;
    completedAt?: string;
    status: 'draft' | 'completed' | 'cancelled';
    note?: string;
}

export interface LocationOption {
    id: string;
    name: string;
    type: 'Warehouse' | 'Store' | 'Customer';
    isSubLocation: boolean;
    parentName?: string;
}

export interface TransferFormData {
    sourceLocationIds: string[];
    destinationLocationId: string;
    items: TransferItem[];
    note?: string;
}

export interface TransferHistory {
    id: string;
    transferId: string;
    productId: string;
    productName: string;
    sourceLocationId: string;
    sourceLocationName: string;
    destinationLocationId: string;
    destinationLocationName: string;
    quantity: number;
    createdAt: string;
    createdBy: string;
}
