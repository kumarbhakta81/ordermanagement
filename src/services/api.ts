import { 
  Product, 
  Sample, 
  RFQ, 
  Order, 
  Message, 
  Notification, 
  SearchFilters,
  RFQMessage,
  OrderTracking 
} from '../types';

// Base API configuration - placeholder for future backend integration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Placeholder implementation - to be replaced with actual API calls
    console.log(`API Call: ${options?.method || 'GET'} ${endpoint}`, options?.body);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data based on endpoint
    return this.getMockData(endpoint, options) as T;
  }

  private getMockData(endpoint: string, options?: RequestInit): any {
    // Mock data generation based on endpoint
    if (endpoint.includes('/products')) {
      return this.generateMockProducts();
    }
    if (endpoint.includes('/samples')) {
      return this.generateMockSamples();
    }
    if (endpoint.includes('/rfqs')) {
      return this.generateMockRFQs();
    }
    if (endpoint.includes('/orders')) {
      return this.generateMockOrders();
    }
    if (endpoint.includes('/messages')) {
      return this.generateMockMessages();
    }
    if (endpoint.includes('/notifications')) {
      return this.generateMockNotifications();
    }
    return {};
  }

  // Products API
  async getProducts(filters?: SearchFilters): Promise<Product[]> {
    return this.request<Product[]>('/products', {
      method: 'GET',
      body: JSON.stringify(filters),
    });
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  // Samples API
  async getSamples(): Promise<Sample[]> {
    return this.request<Sample[]>('/samples');
  }

  async getSample(id: string): Promise<Sample> {
    return this.request<Sample>(`/samples/${id}`);
  }

  // RFQ API
  async getRFQs(userTecId: string): Promise<RFQ[]> {
    return this.request<RFQ[]>(`/rfqs?userTecId=${userTecId}`);
  }

  async createRFQ(rfq: Omit<RFQ, 'id' | 'status' | 'messages' | 'createdAt' | 'updatedAt'>): Promise<RFQ> {
    return this.request<RFQ>('/rfqs', {
      method: 'POST',
      body: JSON.stringify(rfq),
    });
  }

  async updateRFQ(id: string, updates: Partial<RFQ>): Promise<RFQ> {
    return this.request<RFQ>(`/rfqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async addRFQMessage(rfqId: string, message: Omit<RFQMessage, 'id' | 'createdAt'>): Promise<RFQMessage> {
    return this.request<RFQMessage>(`/rfqs/${rfqId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // Orders API
  async getOrders(userTecId: string): Promise<Order[]> {
    return this.request<Order[]>(`/orders?userTecId=${userTecId}`);
  }

  async createOrder(order: Omit<Order, 'id' | 'status' | 'trackingInfo' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrderStatus(orderId: string, status: string, message: string, userTecId: string): Promise<OrderTracking> {
    return this.request<OrderTracking>(`/orders/${orderId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, message, userTecId }),
    });
  }

  // Messages API
  async getMessages(userTecId: string): Promise<Message[]> {
    return this.request<Message[]>(`/messages?userTecId=${userTecId}`);
  }

  async sendMessage(message: Omit<Message, 'id' | 'isRead' | 'createdAt'>): Promise<Message> {
    return this.request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    return this.request<void>(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // Notifications API
  async getNotifications(userTecId: string): Promise<Notification[]> {
    return this.request<Notification[]>(`/notifications?userTecId=${userTecId}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.request<void>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Mock data generators
  private generateMockProducts(): Product[] {
    return [
      {
        id: '1',
        name: 'Premium Cotton T-Shirt',
        description: 'High-quality 100% cotton t-shirt perfect for corporate uniforms',
        category: 'Apparel',
        subcategory: 'T-Shirts',
        images: ['/api/placeholder/400/300'],
        price: 15.99,
        minQuantity: 100,
        supplierId: 'supplier_1',
        supplierTecId: 'SUP001',
        isApproved: true,
        isSample: false,
        specifications: {
          material: '100% Cotton',
          weight: '180 GSM',
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          colors: ['White', 'Black', 'Navy', 'Gray']
        },
        customizable: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      // Add more mock products as needed
    ];
  }

  private generateMockSamples(): Sample[] {
    return [
      {
        id: '1',
        productId: '1',
        name: 'Cotton T-Shirt Sample',
        description: 'Sample of premium cotton t-shirt',
        images: ['/api/placeholder/400/300'],
        supplierId: 'supplier_1',
        supplierTecId: 'SUP001',
        isApproved: true,
        specifications: {
          material: '100% Cotton',
          weight: '180 GSM',
          size: 'M',
          color: 'White'
        },
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];
  }

  private generateMockRFQs(): RFQ[] {
    return [
      {
        id: '1',
        buyerTecId: 'BUY001',
        supplierTecId: 'SUP001',
        productId: '1',
        quantity: 500,
        targetPrice: 12.00,
        requirements: 'Need custom logo embroidery',
        status: 'pending',
        messages: [],
        expiryDate: '2024-02-15T10:00:00Z',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      }
    ];
  }

  private generateMockOrders(): Order[] {
    return [
      {
        id: '1',
        rfqId: '1',
        buyerTecId: 'BUY001',
        supplierTecId: 'SUP001',
        productId: '1',
        quantity: 500,
        unitPrice: 13.50,
        totalPrice: 6750.00,
        status: 'confirmed',
        estimatedDelivery: '2024-03-15T10:00:00Z',
        trackingInfo: [
          {
            id: '1',
            orderId: '1',
            status: 'confirmed',
            message: 'Order confirmed by supplier',
            timestamp: '2024-01-25T10:00:00Z',
            updatedByTecId: 'SUP001'
          }
        ],
        createdAt: '2024-01-25T10:00:00Z',
        updatedAt: '2024-01-25T10:00:00Z'
      }
    ];
  }

  private generateMockMessages(): Message[] {
    return [
      {
        id: '1',
        fromTecId: 'SUP001',
        toTecId: 'BUY001',
        subject: 'RFQ Response',
        content: 'Thank you for your RFQ. We can fulfill your order with the specifications mentioned.',
        isRead: false,
        relatedType: 'rfq',
        relatedId: '1',
        createdAt: '2024-01-22T10:00:00Z'
      }
    ];
  }

  private generateMockNotifications(): Notification[] {
    return [
      {
        id: '1',
        userTecId: 'BUY001',
        type: 'rfq',
        title: 'RFQ Response Received',
        message: 'SUP001 has responded to your RFQ for Premium Cotton T-Shirt',
        isRead: false,
        actionUrl: '/rfqs/1',
        createdAt: '2024-01-22T10:00:00Z'
      }
    ];
  }
}

export const apiService = new ApiService();