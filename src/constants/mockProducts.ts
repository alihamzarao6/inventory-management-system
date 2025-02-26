import { Customer, Product, ProductLocation } from '@/types/products';
import { MOCK_LOCATIONS, MOCK_SUB_LOCATIONS } from './mockLocations';

// Product Categories
export const PRODUCT_CATEGORIES = [
    'Household',
    'Electronics',
    'Furniture',
    'Kitchenware',
    'Solar Products',
    'Other'
];

// Stock Status Options
export const STOCK_STATUS = {
    IN_STOCK: 'In Stock',
    OUT_OF_STOCK: 'Out of Stock'
};

// Helper function to get all location IDs (main locations and sub-locations)
const getAllLocationIds = () => {
    const mainLocationIds = MOCK_LOCATIONS.map(loc => loc.id);
    const subLocationIds = MOCK_SUB_LOCATIONS.map(subloc => subloc.id);
    return [...mainLocationIds, ...subLocationIds];
};

// Helper to distribute products randomly across locations
const distributeAcrossLocations = (count: number): ProductLocation[] => {
    const allLocationIds = getAllLocationIds();
    const selectedLocations: ProductLocation[] = [];

    // Choose random number of locations between 1 and count
    const numLocations = Math.floor(Math.random() * Math.min(count, allLocationIds.length)) + 1;

    // Shuffle and pick locations
    const shuffledLocations = [...allLocationIds].sort(() => 0.5 - Math.random());
    const pickedLocationIds = shuffledLocations.slice(0, numLocations);

    // Create product locations with random quantities
    pickedLocationIds.forEach(locId => {
        const isSubLocation = locId.includes('sub-');
        const quantity = Math.floor(Math.random() * 100) + 1; // Random quantity 1-100
        selectedLocations.push({
            locationId: locId,
            quantity,
            isSubLocation
        });
    });

    return selectedLocations;
};

// Mock Products Data
const generateMockProducts = (count: number): Product[] => {
    const products: Product[] = [];

    const productImages = [
        'https://images.unsplash.com/photo-1581591525893-0a5121255281?q=80&w=1374&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1528&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=928&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1627385823763-583e3b5196a3?q=80&w=1374&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1572431447238-425af66a273b?q=80&w=1470&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1374&auto=format&fit=crop',
    ];

    const productNames = [
        'Deluxe Coffee Maker',
        'Ultra HD Smart TV',
        'Ergonomic Office Chair',
        'Stainless Steel Cookware Set',
        'Solar Powered Charger',
        'Memory Foam Mattress',
        'Wireless Bluetooth Speaker',
        'Premium Yoga Mat',
        'Digital Food Scale',
        'Ceramic Dinner Set',
        'LED Desk Lamp',
        'Portable Air Conditioner',
        'Robotic Vacuum Cleaner',
        'Electric Kettle',
        'Bamboo Cutting Board',
        'Smart Home Security System',
        'Adjustable Dumbbell Set',
        'Non-Stick Frying Pan',
        'Microfiber Bed Sheets',
        'Wireless Phone Charger'
    ];

    for (let i = 0; i < count; i++) {
        const costPrice = parseFloat((Math.random() * 500 + 10).toFixed(2));
        const wholesalePrice = parseFloat((costPrice * (1 + Math.random() * 0.3 + 0.1)).toFixed(2));
        const retailPriceUSD = parseFloat((wholesalePrice * (1 + Math.random() * 0.5 + 0.2)).toFixed(2));
        const retailPrice = parseFloat((retailPriceUSD * 17.5).toFixed(2)); // Converting to ZMW at a rate of 17.5

        const product: Product = {
            id: `prod-${i + 1}`,
            name: productNames[i % productNames.length],
            category: PRODUCT_CATEGORIES[Math.floor(Math.random() * PRODUCT_CATEGORIES.length)],
            image: productImages[i % productImages.length],
            costPrice,
            wholesalePrice,
            retailPrice,
            retailPriceUSD,
            locations: distributeAcrossLocations(3), // Distribute across up to 3 locations
            reorderLevel: Math.floor(Math.random() * 20) + 5,
            note: Math.random() > 0.6 ? `Note for product ${i + 1}` : undefined,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        };

        products.push(product);
    }

    return products;
};

export const MOCK_PRODUCTS = generateMockProducts(25);

// Customer data
export const MOCK_CUSTOMERS: Customer[] = [
    {
        id: 'cust-1',
        name: 'ABC Corporation',
        email: 'contact@abccorp.com',
        phone: '+1234567890',
        address: '123 Business Ave, Commerce City'
    },
    {
        id: 'cust-2',
        name: 'XYZ Enterprises',
        email: 'info@xyzent.com',
        phone: '+0987654321',
        address: '456 Industry Blvd, Trade Town'
    },
    {
        id: 'cust-3',
        name: 'Global Traders Inc.',
        email: 'sales@globaltraders.com',
        phone: '+1122334455',
        address: '789 Market St, Economy Village'
    },
    {
        id: 'cust-4',
        name: 'Local Supplies Ltd.',
        email: 'support@localsupplies.com',
        phone: '+5566778899',
        address: '321 Retail Rd, Commerce City'
    },
    {
        id: 'cust-5',
        name: 'Supply Chain Partners',
        email: 'info@supplychain.com',
        phone: '+9988776655',
        address: '654 Logistics Lane, Distribution District'
    },
    {
        id: 'cust-6',
        name: 'Wholesale Buyers Group',
        email: 'orders@wholesalebuyers.com',
        phone: '+1231231234',
        address: '987 Wholesale Way, Bulk City'
    },
    {
        id: 'cust-7',
        name: 'Premium Distributors',
        email: 'contact@premiumdist.com',
        phone: '+4564564567',
        address: '147 Quality Road, Premium Plaza'
    }
];

// Helper function to get total quantity of a product across all locations
export const getTotalProductQuantity = (product: Product): number => {
    return product.locations.reduce((total, loc) => total + loc.quantity, 0);
};

// Helper to get stock status of a product
export const getProductStockStatus = (product: Product): string => {
    return getTotalProductQuantity(product) > 0 ? STOCK_STATUS.IN_STOCK : STOCK_STATUS.OUT_OF_STOCK;
};

// Helper to get locations of a product (for display)
export const getProductLocationNames = (product: Product): string[] => {
    return product.locations.map(loc => {
        if (loc.isSubLocation) {
            const subLoc = MOCK_SUB_LOCATIONS.find(subloc => subloc.id === loc.locationId);
            return subLoc ? subLoc.name : 'Unknown Location';
        } else {
            const mainLoc = MOCK_LOCATIONS.find(mainloc => mainloc.id === loc.locationId);
            return mainLoc ? mainLoc.name : 'Unknown Location';
        }
    });
};

// Filter Options for Date Range
export const DATE_RANGE_OPTIONS = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7days', label: 'Last 7 Days' },
    { id: 'last30days', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'custom', label: 'Custom Range' }
];

// Mock function to get products by location ID (can be main location or sub-location)
export const getProductsByLocationId = (locationId: string): Product[] => {
    return MOCK_PRODUCTS.filter(product =>
        product.locations.some(loc => loc.locationId === locationId)
    );
};

// Mock function to get products by category
export const getProductsByCategory = (category: string): Product[] => {
    return MOCK_PRODUCTS.filter(product => product.category === category);
};

// Mock function to get products by stock status
export const getProductsByStockStatus = (status: string): Product[] => {
    return MOCK_PRODUCTS.filter(product => getProductStockStatus(product) === status);
};

// Mock function to search products by name
export const searchProductsByName = (query: string): Product[] => {
    const lowercaseQuery = query.toLowerCase();
    return MOCK_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(lowercaseQuery)
    );
};