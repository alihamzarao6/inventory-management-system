import {
  StockAdjustment,
  StockAdjustmentItem,
  AdjustmentReason,
} from "@/types/stockAdjustment";
import { MOCK_PRODUCTS } from "./mockProducts";
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from "./mockLocations";

// Predefined reason codes for adjustments
export const ADJUSTMENT_REASONS: AdjustmentReason[] = [
  {
    id: "reason-1",
    code: "DAMAGED",
    description: "Damaged Item",
    isActive: true,
  },
  {
    id: "reason-2",
    code: "STOLEN",
    description: "Stolen Item",
    isActive: true,
  },
  {
    id: "reason-3",
    code: "ERROR",
    description: "Stock Taking Error",
    isActive: true,
  },
  {
    id: "reason-4",
    code: "OTHER",
    description: "Other Reason",
    isActive: true,
  },
];

// Generate a few sample stock adjustment items
const generateAdjustmentItems = (count: number): StockAdjustmentItem[] => {
  const items: StockAdjustmentItem[] = [];

  for (let i = 0; i < count; i++) {
    const product = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
    const previousQuantity = Math.floor(Math.random() * 100);
    const adjustment = Math.floor(Math.random() * 20) - 10; // Random between -10 and +10

    items.push({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      category: product.category,
      adjustmentType: adjustment > 0 ? 'Add' : 'Remove',
      quantity: Math.abs(adjustment),
      previousQuantity,
      newQuantity: previousQuantity + adjustment,
      reasonId: ADJUSTMENT_REASONS[Math.floor(Math.random() * ADJUSTMENT_REASONS.length)].id,
    });
  }

  return items;
};

// Generate mock stock adjustments
export const MOCK_STOCK_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: 'adj-1',
    locationId: '1', // Warehouse 1
    locationName: 'Warehouse 1',
    items: generateAdjustmentItems(3),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    completedAt: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
    status: 'approved',
    note: 'Monthly inventory reconciliation',
    approvedBy: 'Admin User',
    approvedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'adj-2',
    locationId: '4', // Store 1
    locationName: 'Store 1',
    items: generateAdjustmentItems(2),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    status: 'pending',
    note: 'Damage during shipment',
  },
  {
    id: 'adj-3',
    locationId: '2', // Warehouse 2
    locationName: 'Warehouse 2',
    items: generateAdjustmentItems(4),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    completedAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    status: 'rejected',
    note: 'Incorrect counts',
    rejectedBy: 'Admin User',
    rejectedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'adj-4',
    locationId: '5', // Store 2
    locationName: 'Store 2',
    items: generateAdjustmentItems(5),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    completedAt: new Date(Date.now() - 86400000 * 9).toISOString(), // 9 days ago
    status: 'approved',
    note: 'Stock verification after stocktaking',
    approvedBy: 'Store Manager',
    approvedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: 'adj-5',
    locationId: '3', // Warehouse 3
    locationName: 'Warehouse 3',
    items: generateAdjustmentItems(2),
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), // 6 days ago
    status: 'pending',
    note: 'Items received with damage',
  },
];

// Helper function to get adjustment by ID
export const getAdjustmentById = (id: string): StockAdjustment | undefined => {
  return MOCK_STOCK_ADJUSTMENTS.find(adj => adj.id === id);
};

// Helper function to get adjustments by location
export const getAdjustmentsByLocation = (locationId: string): StockAdjustment[] => {
  return MOCK_STOCK_ADJUSTMENTS.filter(adj => adj.locationId === locationId);
};

// Helper function to get adjustments by status
export const getAdjustmentsByStatus = (status: StockAdjustment['status']): StockAdjustment[] => {
  return MOCK_STOCK_ADJUSTMENTS.filter(adj => adj.status === status);
};

// Helper to get reason description by ID
export const getReasonById = (reasonId: string): string => {
  const reason = ADJUSTMENT_REASONS.find(r => r.id === reasonId);
  return reason ? reason.description : 'Unknown Reason';
};
