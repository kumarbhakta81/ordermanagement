// Core types for the GarmentMarketplace application

export interface User {
  id: string;
  tecId: string;
  role: 'buyer' | 'supplier' | 'admin';
  companyName: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  images: string[];
  price: number;
  minQuantity: number;
  supplierId: string;
  supplierTecId: string;
  isApproved: boolean;
  isSample: boolean;
  specifications: Record<string, any>;
  customizable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sample {
  id: string;
  productId: string;
  name: string;
  description: string;
  images: string[];
  supplierId: string;
  supplierTecId: string;
  isApproved: boolean;
  specifications: Record<string, any>;
  createdAt: string;
}

export interface RFQ {
  id: string;
  buyerTecId: string;
  supplierTecId: string;
  productId: string;
  quantity: number;
  targetPrice: number;
  requirements: string;
  status: 'pending' | 'negotiating' | 'accepted' | 'rejected' | 'expired';
  messages: RFQMessage[];
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface RFQMessage {
  id: string;
  rfqId: string;
  senderTecId: string;
  message: string;
  proposedPrice?: number;
  proposedQuantity?: number;
  createdAt: string;
}

export interface Order {
  id: string;
  rfqId: string;
  buyerTecId: string;
  supplierTecId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
  estimatedDelivery: string;
  trackingInfo: OrderTracking[];
  customizations?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderTracking {
  id: string;
  orderId: string;
  status: string;
  message: string;
  timestamp: string;
  updatedByTecId: string;
}

export interface Message {
  id: string;
  fromTecId: string;
  toTecId: string;
  subject: string;
  content: string;
  isRead: boolean;
  relatedType?: 'rfq' | 'order' | 'product';
  relatedId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userTecId: string;
  type: 'rfq' | 'order' | 'message' | 'approval' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  minQuantity?: number;
  customizable?: boolean;
  approvedOnly?: boolean;
  samplesOnly?: boolean;
  searchTerm?: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  type: 'text' | 'select' | 'color' | 'image' | 'number';
  options?: string[];
  required: boolean;
  description: string;
}

export interface Customization {
  optionId: string;
  value: any;
}