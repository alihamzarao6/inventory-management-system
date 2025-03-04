export type AdjustmentType = 'StockCount' | 'Add' | 'Remove' | 'WriteOff';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

// Reason codes for adjustments
export interface AdjustmentReason {
    id: string;
    code: string;
    description: string;
    isActive: boolean;
}

// Individual adjustment item
export interface StockAdjustmentItem {
    productId: string;
    productName: string;
    productImage: string;
    category: string;
    adjustmentType: AdjustmentType;
    quantity: number; // For StockCount, this is the new quantity; for others, it's the adjustment amount
    previousQuantity: number;
    newQuantity: number;
    reasonId: string;
    customReason?: string; // Used when reasonId is 'OTHER'
    proof?: string; // Base64 image data
}

// Stock adjustment interface
export interface StockAdjustment {
    id: string;
    locationId: string;
    locationName: string;
    items: StockAdjustmentItem[];
    createdAt: string;
    completedAt?: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    note?: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
}

// Form data for creating an adjustment
export interface StockAdjustmentFormData {
    locationId: string;
    items: StockAdjustmentItem[];
    note?: string;
}