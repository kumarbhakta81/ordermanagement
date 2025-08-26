// Mock Data for Order Management System

// Categories Data
const mockCategories = [
    {
        id: 1,
        name: "Electronics",
        description: "Latest electronic gadgets and devices",
        image: "https://via.placeholder.com/300x200/007bff/ffffff?text=Electronics",
        productCount: 45,
        status: "active",
        parentId: null,
        slug: "electronics",
        metaDescription: "Shop the latest electronics and gadgets",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-20T14:45:00Z"
    },
    {
        id: 2,
        name: "Smartphones",
        description: "Mobile phones and accessories",
        image: "https://via.placeholder.com/300x200/28a745/ffffff?text=Smartphones",
        productCount: 23,
        status: "active",
        parentId: 1,
        slug: "smartphones",
        metaDescription: "Latest smartphones from top brands",
        createdAt: "2024-01-16T09:15:00Z",
        updatedAt: "2024-01-21T11:30:00Z"
    },
    {
        id: 3,
        name: "Laptops",
        description: "Professional and gaming laptops",
        image: "https://via.placeholder.com/300x200/6f42c1/ffffff?text=Laptops",
        productCount: 18,
        status: "active",
        parentId: 1,
        slug: "laptops",
        metaDescription: "High-performance laptops for work and gaming",
        createdAt: "2024-01-17T11:20:00Z",
        updatedAt: "2024-01-22T16:15:00Z"
    },
    {
        id: 4,
        name: "Clothing",
        description: "Fashion and apparel for all occasions",
        image: "https://via.placeholder.com/300x200/fd7e14/ffffff?text=Clothing",
        productCount: 67,
        status: "active",
        parentId: null,
        slug: "clothing",
        metaDescription: "Trendy clothing and fashion items",
        createdAt: "2024-01-18T08:45:00Z",
        updatedAt: "2024-01-23T13:20:00Z"
    },
    {
        id: 5,
        name: "Men's Wear",
        description: "Clothing for men",
        image: "https://via.placeholder.com/300x200/dc3545/ffffff?text=Men%27s+Wear",
        productCount: 34,
        status: "active",
        parentId: 4,
        slug: "mens-wear",
        metaDescription: "Stylish clothing options for men",
        createdAt: "2024-01-19T07:30:00Z",
        updatedAt: "2024-01-24T10:45:00Z"
    },
    {
        id: 6,
        name: "Women's Wear",
        description: "Clothing for women",
        image: "https://via.placeholder.com/300x200/e83e8c/ffffff?text=Women%27s+Wear",
        productCount: 33,
        status: "active",
        parentId: 4,
        slug: "womens-wear",
        metaDescription: "Fashionable clothing for women",
        createdAt: "2024-01-20T12:15:00Z",
        updatedAt: "2024-01-25T15:30:00Z"
    },
    {
        id: 7,
        name: "Home & Garden",
        description: "Home improvement and garden supplies",
        image: "https://via.placeholder.com/300x200/20c997/ffffff?text=Home+%26+Garden",
        productCount: 29,
        status: "active",
        parentId: null,
        slug: "home-garden",
        metaDescription: "Everything for your home and garden needs",
        createdAt: "2024-01-21T14:00:00Z",
        updatedAt: "2024-01-26T09:15:00Z"
    },
    {
        id: 8,
        name: "Sports & Outdoors",
        description: "Sports equipment and outdoor gear",
        image: "https://via.placeholder.com/300x200/6610f2/ffffff?text=Sports",
        productCount: 42,
        status: "active",
        parentId: null,
        slug: "sports-outdoors",
        metaDescription: "Sports equipment and outdoor adventure gear",
        createdAt: "2024-01-22T16:45:00Z",
        updatedAt: "2024-01-27T12:00:00Z"
    }
];

// Products Data
const mockProducts = [
    {
        id: 1,
        name: "iPhone 15 Pro",
        description: "Latest iPhone with advanced features including A17 Pro chip, titanium design, and improved camera system.",
        categoryId: 2,
        categoryName: "Smartphones",
        price: 999.99,
        salePrice: 899.99,
        costPrice: 750.00,
        stock: 50,
        lowStockThreshold: 10,
        images: [
            "https://via.placeholder.com/400x400/007bff/ffffff?text=iPhone+15+Pro+Front",
            "https://via.placeholder.com/400x400/007bff/ffffff?text=iPhone+15+Pro+Back",
            "https://via.placeholder.com/400x400/007bff/ffffff?text=iPhone+15+Pro+Side"
        ],
        status: "approved",
        wholesalerId: 3,
        wholesalerName: "TechWorld Wholesale",
        sku: "IPH15PRO001",
        weight: 0.5,
        dimensions: "6.1 x 2.8 x 0.3 inches",
        tags: ["smartphone", "apple", "5G", "premium"],
        features: ["Face ID", "Wireless Charging", "Water Resistant", "5G Compatible"],
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-25T14:45:00Z"
    },
    {
        id: 2,
        name: "Samsung Galaxy S24 Ultra",
        description: "Premium Android smartphone with S Pen, advanced camera system, and AI features.",
        categoryId: 2,
        categoryName: "Smartphones",
        price: 1199.99,
        salePrice: null,
        costPrice: 900.00,
        stock: 32,
        lowStockThreshold: 10,
        images: [
            "https://via.placeholder.com/400x400/28a745/ffffff?text=Galaxy+S24+Ultra",
            "https://via.placeholder.com/400x400/28a745/ffffff?text=Galaxy+S24+Camera",
            "https://via.placeholder.com/400x400/28a745/ffffff?text=Galaxy+S24+SPen"
        ],
        status: "approved",
        wholesalerId: 3,
        wholesalerName: "TechWorld Wholesale",
        sku: "SAM24ULT001",
        weight: 0.6,
        dimensions: "6.4 x 3.1 x 0.35 inches",
        tags: ["smartphone", "samsung", "android", "s-pen"],
        features: ["S Pen", "108MP Camera", "5000mAh Battery", "120Hz Display"],
        createdAt: "2024-01-16T09:15:00Z",
        updatedAt: "2024-01-26T11:30:00Z"
    },
    {
        id: 3,
        name: "MacBook Pro 16-inch M3",
        description: "Professional laptop with M3 chip, stunning Liquid Retina XDR display, and all-day battery life.",
        categoryId: 3,
        categoryName: "Laptops",
        price: 2499.99,
        salePrice: 2299.99,
        costPrice: 1800.00,
        stock: 15,
        lowStockThreshold: 5,
        images: [
            "https://via.placeholder.com/400x400/6f42c1/ffffff?text=MacBook+Pro+16",
            "https://via.placeholder.com/400x400/6f42c1/ffffff?text=MacBook+Keyboard",
            "https://via.placeholder.com/400x400/6f42c1/ffffff?text=MacBook+Ports"
        ],
        status: "approved",
        wholesalerId: 4,
        wholesalerName: "Apple Authorized Dealer",
        sku: "MBP16M3001",
        weight: 4.7,
        dimensions: "14.01 x 9.77 x 0.66 inches",
        tags: ["laptop", "apple", "professional", "m3-chip"],
        features: ["M3 Chip", "16GB RAM", "512GB SSD", "Liquid Retina XDR"],
        createdAt: "2024-01-17T11:20:00Z",
        updatedAt: "2024-01-27T16:15:00Z"
    },
    {
        id: 4,
        name: "Dell XPS 13 Plus",
        description: "Ultra-portable laptop with InfinityEdge display and premium design.",
        categoryId: 3,
        categoryName: "Laptops",
        price: 1299.99,
        salePrice: 1199.99,
        costPrice: 950.00,
        stock: 8,
        lowStockThreshold: 5,
        images: [
            "https://via.placeholder.com/400x400/17a2b8/ffffff?text=Dell+XPS+13",
            "https://via.placeholder.com/400x400/17a2b8/ffffff?text=XPS+Display",
            "https://via.placeholder.com/400x400/17a2b8/ffffff?text=XPS+Design"
        ],
        status: "pending",
        wholesalerId: 5,
        wholesalerName: "Dell Direct",
        sku: "DELLXPS13001",
        weight: 2.73,
        dimensions: "11.64 x 7.84 x 0.55 inches",
        tags: ["laptop", "dell", "ultrabook", "portable"],
        features: ["13.4 InfinityEdge", "12th Gen Intel", "16GB RAM", "512GB SSD"],
        createdAt: "2024-01-18T08:45:00Z",
        updatedAt: "2024-01-28T13:20:00Z"
    },
    {
        id: 5,
        name: "Men's Premium Cotton T-Shirt",
        description: "High-quality cotton t-shirt with comfortable fit and durable construction.",
        categoryId: 5,
        categoryName: "Men's Wear",
        price: 29.99,
        salePrice: 24.99,
        costPrice: 15.00,
        stock: 150,
        lowStockThreshold: 20,
        images: [
            "https://via.placeholder.com/400x400/dc3545/ffffff?text=Men%27s+T-Shirt",
            "https://via.placeholder.com/400x400/dc3545/ffffff?text=T-Shirt+Back",
            "https://via.placeholder.com/400x400/dc3545/ffffff?text=T-Shirt+Detail"
        ],
        status: "approved",
        wholesalerId: 6,
        wholesalerName: "Fashion Hub",
        sku: "MENTS001",
        weight: 0.3,
        dimensions: "Varies by size",
        tags: ["clothing", "men", "casual", "cotton"],
        features: ["100% Cotton", "Machine Washable", "Multiple Colors", "Comfortable Fit"],
        variants: [
            { size: "S", color: "Blue", stock: 25 },
            { size: "M", color: "Blue", stock: 40 },
            { size: "L", color: "Blue", stock: 35 },
            { size: "XL", color: "Blue", stock: 20 },
            { size: "S", color: "Red", stock: 30 }
        ],
        createdAt: "2024-01-19T07:30:00Z",
        updatedAt: "2024-01-29T10:45:00Z"
    },
    {
        id: 6,
        name: "Women's Elegant Dress",
        description: "Stylish and elegant dress perfect for formal occasions and professional settings.",
        categoryId: 6,
        categoryName: "Women's Wear",
        price: 89.99,
        salePrice: null,
        costPrice: 45.00,
        stock: 3,
        lowStockThreshold: 5,
        images: [
            "https://via.placeholder.com/400x400/e83e8c/ffffff?text=Women%27s+Dress",
            "https://via.placeholder.com/400x400/e83e8c/ffffff?text=Dress+Detail",
            "https://via.placeholder.com/400x400/e83e8c/ffffff?text=Dress+Back"
        ],
        status: "approved",
        wholesalerId: 6,
        wholesalerName: "Fashion Hub",
        sku: "WOMDRS001",
        weight: 0.6,
        dimensions: "Varies by size",
        tags: ["clothing", "women", "formal", "elegant"],
        features: ["Premium Fabric", "Elegant Design", "Professional Look", "Multiple Sizes"],
        variants: [
            { size: "XS", color: "Black", stock: 0 },
            { size: "S", color: "Black", stock: 1 },
            { size: "M", color: "Black", stock: 2 },
            { size: "L", color: "Navy", stock: 0 }
        ],
        createdAt: "2024-01-20T12:15:00Z",
        updatedAt: "2024-01-30T15:30:00Z"
    }
];

// Wholesalers Data
const mockWholesalers = [
    {
        id: 3,
        name: "TechWorld Wholesale",
        email: "contact@techworld.com",
        phone: "+1-555-0123",
        address: "123 Tech Street, Silicon Valley, CA 94000",
        rating: 4.8,
        totalProducts: 245,
        activeProducts: 198,
        joinedDate: "2023-06-15T00:00:00Z"
    },
    {
        id: 4,
        name: "Apple Authorized Dealer",
        email: "sales@appledealer.com",
        phone: "+1-555-0124",
        address: "456 Innovation Ave, Cupertino, CA 95014",
        rating: 4.9,
        totalProducts: 89,
        activeProducts: 87,
        joinedDate: "2023-08-20T00:00:00Z"
    },
    {
        id: 5,
        name: "Dell Direct",
        email: "business@dell.com",
        phone: "+1-555-0125",
        address: "789 Computer Way, Austin, TX 73301",
        rating: 4.7,
        totalProducts: 156,
        activeProducts: 142,
        joinedDate: "2023-05-10T00:00:00Z"
    },
    {
        id: 6,
        name: "Fashion Hub",
        email: "orders@fashionhub.com",
        phone: "+1-555-0126",
        address: "321 Style Boulevard, New York, NY 10001",
        rating: 4.6,
        totalProducts: 567,
        activeProducts: 489,
        joinedDate: "2023-07-02T00:00:00Z"
    }
];

// Retailers Data
const mockRetailers = [
    {
        id: 7,
        name: "TechStore Plus",
        email: "admin@techstoreplus.com",
        phone: "+1-555-0127",
        address: "654 Retail Street, Denver, CO 80202",
        rating: 4.5,
        totalOrders: 1245,
        completedOrders: 1198,
        joinedDate: "2023-09-12T00:00:00Z"
    },
    {
        id: 8,
        name: "Fashion Forward",
        email: "info@fashionforward.com",
        phone: "+1-555-0128",
        address: "987 Fashion Ave, Miami, FL 33101",
        rating: 4.7,
        totalOrders: 856,
        completedOrders: 821,
        joinedDate: "2023-10-05T00:00:00Z"
    }
];

// Orders Data
const mockOrders = [
    {
        id: 1001,
        orderNumber: "ORD-2024-001001",
        retailerId: 7,
        retailerName: "TechStore Plus",
        wholesalerId: 3,
        wholesalerName: "TechWorld Wholesale",
        status: "completed",
        orderDate: "2024-01-25T10:30:00Z",
        deliveryDate: "2024-01-30T14:20:00Z",
        totalAmount: 2899.97,
        items: [
            {
                productId: 1,
                productName: "iPhone 15 Pro",
                quantity: 2,
                unitPrice: 899.99,
                totalPrice: 1799.98
            },
            {
                productId: 2,
                productName: "Samsung Galaxy S24 Ultra",
                quantity: 1,
                unitPrice: 1199.99,
                totalPrice: 1199.99
            }
        ]
    },
    {
        id: 1002,
        orderNumber: "ORD-2024-001002",
        retailerId: 8,
        retailerName: "Fashion Forward",
        wholesalerId: 6,
        wholesalerName: "Fashion Hub",
        status: "pending",
        orderDate: "2024-01-28T15:45:00Z",
        deliveryDate: null,
        totalAmount: 439.94,
        items: [
            {
                productId: 5,
                productName: "Men's Premium Cotton T-Shirt",
                quantity: 10,
                unitPrice: 24.99,
                totalPrice: 249.90
            },
            {
                productId: 6,
                productName: "Women's Elegant Dress",
                quantity: 2,
                unitPrice: 89.99,
                totalPrice: 179.98
            }
        ]
    }
];

// Recent Activity Data
const mockRecentActivity = [
    {
        id: 1,
        type: "product_added",
        message: "New product 'iPhone 15 Pro' added by TechWorld Wholesale",
        timestamp: "2024-01-30T16:45:00Z",
        icon: "fas fa-plus-circle",
        iconColor: "text-success"
    },
    {
        id: 2,
        type: "order_completed",
        message: "Order ORD-2024-001001 completed for TechStore Plus",
        timestamp: "2024-01-30T14:20:00Z",
        icon: "fas fa-check-circle",
        iconColor: "text-success"
    },
    {
        id: 3,
        type: "low_stock",
        message: "Low stock alert: Women's Elegant Dress (3 remaining)",
        timestamp: "2024-01-30T12:15:00Z",
        icon: "fas fa-exclamation-triangle",
        iconColor: "text-warning"
    },
    {
        id: 4,
        type: "product_approved",
        message: "Product 'MacBook Pro 16-inch M3' approved",
        timestamp: "2024-01-30T10:30:00Z",
        icon: "fas fa-thumbs-up",
        iconColor: "text-primary"
    },
    {
        id: 5,
        type: "category_added",
        message: "New category 'Sports & Outdoors' added",
        timestamp: "2024-01-29T18:20:00Z",
        icon: "fas fa-tags",
        iconColor: "text-info"
    }
];

// Notifications Data
const mockNotifications = [
    {
        id: 1,
        title: "Low Stock Alert",
        message: "Women's Elegant Dress is running low on stock (3 remaining)",
        type: "warning",
        read: false,
        timestamp: "2024-01-30T12:15:00Z"
    },
    {
        id: 2,
        title: "New Order Received",
        message: "Order ORD-2024-001002 received from Fashion Forward",
        type: "info",
        read: false,
        timestamp: "2024-01-28T15:45:00Z"
    },
    {
        id: 3,
        title: "Product Approval Required",
        message: "Dell XPS 13 Plus is pending approval",
        type: "info",
        read: true,
        timestamp: "2024-01-28T13:20:00Z"
    }
];

// Export all mock data
window.mockData = {
    categories: mockCategories,
    products: mockProducts,
    wholesalers: mockWholesalers,
    retailers: mockRetailers,
    orders: mockOrders,
    recentActivity: mockRecentActivity,
    notifications: mockNotifications
};

// Helper functions for data manipulation
window.mockDataHelpers = {
    // Get category by ID
    getCategoryById: (id) => mockCategories.find(cat => cat.id === id),
    
    // Get product by ID
    getProductById: (id) => mockProducts.find(prod => prod.id === id),
    
    // Get products by category
    getProductsByCategory: (categoryId) => mockProducts.filter(prod => prod.categoryId === categoryId),
    
    // Get categories by parent ID
    getCategoriesByParent: (parentId) => mockCategories.filter(cat => cat.parentId === parentId),
    
    // Get root categories (no parent)
    getRootCategories: () => mockCategories.filter(cat => cat.parentId === null),
    
    // Get low stock products
    getLowStockProducts: () => mockProducts.filter(prod => prod.stock <= prod.lowStockThreshold),
    
    // Get pending products
    getPendingProducts: () => mockProducts.filter(prod => prod.status === 'pending'),
    
    // Get approved products
    getApprovedProducts: () => mockProducts.filter(prod => prod.status === 'approved'),
    
    // Get unread notifications
    getUnreadNotifications: () => mockNotifications.filter(notif => !notif.read),
    
    // Search products
    searchProducts: (query) => {
        const lowerQuery = query.toLowerCase();
        return mockProducts.filter(prod => 
            prod.name.toLowerCase().includes(lowerQuery) ||
            prod.description.toLowerCase().includes(lowerQuery) ||
            prod.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    },
    
    // Search categories
    searchCategories: (query) => {
        const lowerQuery = query.toLowerCase();
        return mockCategories.filter(cat => 
            cat.name.toLowerCase().includes(lowerQuery) ||
            cat.description.toLowerCase().includes(lowerQuery)
        );
    }
};