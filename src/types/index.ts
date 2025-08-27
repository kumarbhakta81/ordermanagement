// User Types and Roles
export enum UserRole {
  ADMIN = 'admin',
  SUPPLIER = 'supplier', 
  BUYER = 'buyer'
}

export interface User {
  id: string;
  tecId: string; // Unique TecID for all users
  email: string;
  role: UserRole;
  companyName?: string; // Optional company name for suppliers and buyers
  isVerified?: boolean; // Optional verification status
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier extends User {
  role: UserRole.SUPPLIER;
  companyName: string;
  businessLicense: string;
  contactPerson: string;
  isVerified: boolean;
}

export interface Buyer extends User {
  role: UserRole.BUYER;
  companyName: string;
  // Personal info is never exposed to suppliers
  personalInfo?: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
  };
}

// Product Types
export interface Product {
  id: string;
  tecId: string; // Unique TecID for products
  supplierTecId: string; // Reference to supplier via TecID only
  name: string;
  description: string;
  category: string;
  subcategory: string;
  images: string[];
  specifications: Record<string, any>;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  minimumOrderQuantity: number;
  isApproved: boolean;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

// RFQ Types
export interface RFQ {
  id: string;
  tecId: string; // Unique TecID for RFQ
  buyerTecId: string; // Buyer reference via TecID
  productTecId?: string; // Optional product reference
  title: string;
  description: string;
  requirements: {
    quantity: number;
    specifications: Record<string, any>;
    deliveryDate: string;
    budget?: {
      min: number;
      max: number;
      currency: string;
    };
  };
  attachments: string[];
  status: RFQStatus;
  responses: RFQResponse[];
  createdAt: string;
  updatedAt: string;
}

export enum RFQStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  IN_NEGOTIATION = 'in_negotiation',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export interface RFQResponse {
  id: string;
  rfqTecId: string;
  supplierTecId: string;
  proposal: {
    price: number;
    currency: string;
    deliveryTime: string;
    minimumQuantity: number;
    specifications: Record<string, any>;
  };
  message: string;
  attachments: string[];
  status: ResponseStatus;
  createdAt: string;
  updatedAt: string;
}

export enum ResponseStatus {
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COUNTER_OFFER = 'counter_offer'
}

// Order Types
export interface Order {
  id: string;
  tecId: string;
  buyerTecId: string;
  supplierTecId: string;
  rfqTecId?: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productTecId: string;
  quantity: number;
  unitPrice: number;
  specifications: Record<string, any>;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  REFUNDED = 'refunded'
}

// Message Types for Communication
export interface Message {
  id: string;
  fromTecId: string;
  toTecId: string;
  rfqTecId?: string;
  orderTecId?: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Filter Types
export interface ProductFilter {
  category?: string;
  subcategory?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  location?: string;
  isApproved?: boolean;
  isSample?: boolean;
  supplierTecId?: string;
}

export interface RFQFilter {
  status?: RFQStatus;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  budgetRange?: {
    min: number;
    max: number;
  };
}