import { Customer, CustomerProduct } from '@/types/customer';
import { MOCK_PRODUCTS } from './mockProducts';

// Customer images - you can replace these with actual images in your implementation
const customerImages = [
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=928&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627385823763-583e3b5196a3?q=80&w=1374&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1572431447238-425af66a273b?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1374&auto=format&fit=crop',
];

// Mock Customers Data
export const MOCK_CUSTOMERS: Customer[] = [
    {
        id: 'cust-1',
        name: 'Z-MART Ndola Sales',
        image: customerImages[0],
        email: 'ndola-sales@zmart.com',
        phone: '+260 76 123 4567',
        address: '22 Copperbelt Ave',
        city: 'Ndola',
        country: 'Zambia',
        note: 'Main distributor for Northern region',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
        id: 'cust-2',
        name: 'Z-MART Kitwe Sales',
        image: customerImages[1],
        email: 'kitwe-sales@zmart.com',
        phone: '+260 76 987 6543',
        address: '15 Mining Road',
        city: 'Kitwe',
        country: 'Zambia',
        note: 'Secondary distributor for Copperbelt',
        createdAt: new Date(Date.now() - 15400000).toISOString(),
    },
    {
        id: 'cust-3',
        name: 'Shoprite Manda Hill',
        image: customerImages[2],
        email: 'mandahill@shoprite.co.zm',
        phone: '+260 96 555 1234',
        address: 'Manda Hill Mall, Great East Road',
        city: 'Lusaka',
        country: 'Zambia',
        createdAt: new Date(Date.now() - 32600000).toISOString(),
    },
    {
        id: 'cust-4',
        name: 'Game Stores Levy Park',
        image: customerImages[3],
        email: 'levypark@game.co.zm',
        phone: '+260 97 765 4321',
        address: 'Levy Business Park, Church Road',
        city: 'Lusaka',
        country: 'Zambia',
        note: 'Bulk orders only',
        createdAt: new Date(Date.now() - 45800000).toISOString(),
    },
    {
        id: 'cust-5',
        name: 'PicknPay Livingstone',
        image: customerImages[0],
        email: 'livingstone@picknpay.co.zm',
        phone: '+260 76 832 1144',
        address: '55 Mosi-oa-Tunya Road',
        city: 'Livingstone',
        country: 'Zambia',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 'cust-6',
        name: 'Choppies Kabwe',
        image: customerImages[1],
        email: 'kabwe@choppies.co.zm',
        phone: '+260 95 443 2211',
        address: '77 Freedom Way',
        city: 'Kabwe',
        country: 'Zambia',
        note: 'Seasonal ordering pattern',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
        id: 'cust-7',
        name: 'Food Lovers Kabulonga',
        image: customerImages[2],
        email: 'kabulonga@foodlovers.co.zm',
        phone: '+260 96 332 6677',
        address: 'Kabulonga Shopping Centre',
        city: 'Lusaka',
        country: 'Zambia',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
];

// Generate mock customer products - associating random products with customers
export const generateMockCustomerProducts = (): CustomerProduct[] => {
    const customerProducts: CustomerProduct[] = [];

    // For each customer, assign 2-5 random products
    MOCK_CUSTOMERS.forEach(customer => {
        // Shuffle products array
        const shuffledProducts = [...MOCK_PRODUCTS].sort(() => 0.5 - Math.random());

        // Pick 2-5 random products
        const productCount = Math.floor(Math.random() * 4) + 2;
        const selectedProducts = shuffledProducts.slice(0, productCount);

        selectedProducts.forEach(product => {
            const hasSpecialPrice = Math.random() > 0.5;
            const hasDiscount = !hasSpecialPrice && Math.random() > 0.7;

            customerProducts.push({
                id: `cp-${customer.id}-${product.id}`,
                customerId: customer.id,
                productId: product.id,
                specialPrice: hasSpecialPrice ? product.wholesalePrice * (0.85 + Math.random() * 0.1) : undefined,
                discount: hasDiscount ? Math.floor(Math.random() * 15) + 5 : undefined, // 5-20% discount
                note: Math.random() > 0.8 ? 'Custom pricing agreement' : undefined,
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 30 days
            });
        });
    });

    return customerProducts;
};

export const MOCK_CUSTOMER_PRODUCTS = generateMockCustomerProducts();

// Helper functions
export const getCustomerById = (id: string): Customer | undefined => {
    return MOCK_CUSTOMERS.find(customer => customer.id === id);
};

export const getProductsByCustomerId = (customerId: string) => {
    const customerProductIds = MOCK_CUSTOMER_PRODUCTS
        .filter(cp => cp.customerId === customerId)
        .map(cp => cp.productId);

    return MOCK_PRODUCTS.filter(product => customerProductIds.includes(product.id));
};

export const getCustomerProductRelationship = (customerId: string, productId: string) => {
    return MOCK_CUSTOMER_PRODUCTS.find(
        cp => cp.customerId === customerId && cp.productId === productId
    );
};

export const searchCustomersByName = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return MOCK_CUSTOMERS.filter(customer =>
        customer.name.toLowerCase().includes(lowercaseQuery) ||
        customer.email.toLowerCase().includes(lowercaseQuery) ||
        customer.city.toLowerCase().includes(lowercaseQuery)
    );
};