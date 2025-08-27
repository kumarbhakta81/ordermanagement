import axios, { AxiosInstance } from 'axios';
import { 
  Product, 
  RFQ, 
  Order, 
  ApiResponse, 
  PaginatedResponse,
  ProductFilter,
  RFQFilter,
  RFQResponse,
  Message
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Product Services
  async getProducts(filter?: ProductFilter, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await this.api.get<ApiResponse<PaginatedResponse<Product>>>(`/products?${params}`);
    return response.data.data!;
  }

  async getProductByTecId(tecId: string): Promise<Product> {
    const response = await this.api.get<ApiResponse<Product>>(`/products/${tecId}`);
    return response.data.data!;
  }

  async createProduct(productData: Omit<Product, 'id' | 'tecId' | 'createdAt' | 'updatedAt' | 'isApproved'>): Promise<Product> {
    const response = await this.api.post<ApiResponse<Product>>('/products', productData);
    return response.data.data!;
  }

  async updateProduct(tecId: string, productData: Partial<Product>): Promise<Product> {
    const response = await this.api.put<ApiResponse<Product>>(`/products/${tecId}`, productData);
    return response.data.data!;
  }

  async deleteProduct(tecId: string): Promise<void> {
    await this.api.delete(`/products/${tecId}`);
  }

  async getSupplierProducts(supplierTecId: string): Promise<Product[]> {
    const response = await this.api.get<ApiResponse<Product[]>>(`/suppliers/${supplierTecId}/products`);
    return response.data.data!;
  }

  // RFQ Services
  async getRFQs(filter?: RFQFilter, page: number = 1, limit: number = 20): Promise<PaginatedResponse<RFQ>> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await this.api.get<ApiResponse<PaginatedResponse<RFQ>>>(`/rfqs?${params}`);
    return response.data.data!;
  }

  async getRFQByTecId(tecId: string): Promise<RFQ> {
    const response = await this.api.get<ApiResponse<RFQ>>(`/rfqs/${tecId}`);
    return response.data.data!;
  }

  async createRFQ(rfqData: Omit<RFQ, 'id' | 'tecId' | 'createdAt' | 'updatedAt' | 'responses'>): Promise<RFQ> {
    const response = await this.api.post<ApiResponse<RFQ>>('/rfqs', rfqData);
    return response.data.data!;
  }

  async updateRFQ(tecId: string, rfqData: Partial<RFQ>): Promise<RFQ> {
    const response = await this.api.put<ApiResponse<RFQ>>(`/rfqs/${tecId}`, rfqData);
    return response.data.data!;
  }

  async respondToRFQ(rfqTecId: string, responseData: Omit<RFQResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<RFQResponse> {
    const response = await this.api.post<ApiResponse<RFQResponse>>(`/rfqs/${rfqTecId}/responses`, responseData);
    return response.data.data!;
  }

  async getBuyerRFQs(): Promise<RFQ[]> {
    const response = await this.api.get<ApiResponse<RFQ[]>>('/rfqs/buyer');
    return response.data.data!;
  }

  async getSupplierRFQs(): Promise<RFQ[]> {
    const response = await this.api.get<ApiResponse<RFQ[]>>('/rfqs/supplier');
    return response.data.data!;
  }

  // Order Services
  async getOrders(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Order>> {
    const response = await this.api.get<ApiResponse<PaginatedResponse<Order>>>(`/orders?page=${page}&limit=${limit}`);
    return response.data.data!;
  }

  async getOrderByTecId(tecId: string): Promise<Order> {
    const response = await this.api.get<ApiResponse<Order>>(`/orders/${tecId}`);
    return response.data.data!;
  }

  async createOrder(orderData: Omit<Order, 'id' | 'tecId' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const response = await this.api.post<ApiResponse<Order>>('/orders', orderData);
    return response.data.data!;
  }

  async updateOrderStatus(tecId: string, status: string): Promise<Order> {
    const response = await this.api.patch<ApiResponse<Order>>(`/orders/${tecId}/status`, { status });
    return response.data.data!;
  }

  // Message Services
  async getMessages(conversationTecId?: string): Promise<Message[]> {
    const url = conversationTecId ? `/messages?conversation=${conversationTecId}` : '/messages';
    const response = await this.api.get<ApiResponse<Message[]>>(url);
    return response.data.data!;
  }

  async sendMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'isRead'>): Promise<Message> {
    const response = await this.api.post<ApiResponse<Message>>('/messages', messageData);
    return response.data.data!;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.api.patch(`/messages/${messageId}/read`);
  }

  // Upload Service
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.api.post<ApiResponse<{ url: string }>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!.url;
  }
}

export const apiService = new ApiService();