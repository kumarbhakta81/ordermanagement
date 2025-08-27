// Mock data for the Order Management System
// This data simulates a real database and will be replaced with actual DB calls

let mockOrders = [
  {
    id: 'ord_001',
    customerId: 'cust_001',
    orderDate: '2024-01-15T10:30:00Z',
    status: 'pending',
    totalAmount: 299.99,
    items: [
      { id: 'item_001', productId: 'prod_001', quantity: 2, price: 149.99 }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'ord_002',
    customerId: 'cust_002',
    orderDate: '2024-01-16T14:20:00Z',
    status: 'shipped',
    totalAmount: 599.98,
    items: [
      { id: 'item_002', productId: 'prod_002', quantity: 1, price: 299.99 },
      { id: 'item_003', productId: 'prod_001', quantity: 2, price: 149.99 }
    ],
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T16:00:00Z'
  }
];

let mockCustomers = [
  {
    id: 'cust_001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    },
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z'
  },
  {
    id: 'cust_002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0456',
    address: {
      street: '456 Oak Ave',
      city: 'Somewhere',
      state: 'NY',
      zipCode: '67890',
      country: 'USA'
    },
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-12T11:30:00Z'
  }
];

let mockProducts = [
  {
    id: 'prod_001',
    name: 'Premium Widget',
    description: 'High-quality widget for all your needs',
    price: 149.99,
    stock: 50,
    category: 'Electronics',
    sku: 'WID-001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  },
  {
    id: 'prod_002',
    name: 'Deluxe Gadget',
    description: 'Professional-grade gadget with advanced features',
    price: 299.99,
    stock: 25,
    category: 'Electronics',
    sku: 'GAD-002',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-16T15:30:00Z'
  },
  {
    id: 'prod_003',
    name: 'Basic Tool',
    description: 'Essential tool for everyday use',
    price: 49.99,
    stock: 100,
    category: 'Tools',
    sku: 'TOL-003',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z'
  }
];

let mockUsers = [
  {
    id: 'user_001',
    email: 'admin@example.com',
    password: '$2a$10$example.hash.for.admin123', // In real app, this would be hashed
    role: 'admin',
    name: 'Admin User',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user_002',
    email: 'manager@example.com',
    password: '$2a$10$example.hash.for.manager123',
    role: 'manager',
    name: 'Manager User',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Helper functions to generate IDs
const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

module.exports = {
  mockOrders,
  mockCustomers,
  mockProducts,
  mockUsers,
  generateId
};