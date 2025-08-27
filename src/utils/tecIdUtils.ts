import { User, UserRole, Buyer, Supplier } from '../types';

/**
 * Utility functions for TecID system and privacy protection
 */

export class TecIdUtils {
  /**
   * Generate a unique TecID with specified prefix
   */
  static generateTecId(prefix: string = 'TEC'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Validate TecID format
   */
  static isValidTecId(tecId: string): boolean {
    const pattern = /^[A-Z]+-[A-Z0-9]+-[A-Z0-9]+$/;
    return pattern.test(tecId);
  }

  /**
   * Get display name for a user based on role and privacy rules
   * Suppliers should never see buyer personal information
   */
  static getDisplayName(user: User, viewerRole: UserRole): string {
    switch (user.role) {
      case UserRole.SUPPLIER:
        const supplier = user as Supplier;
        return supplier.companyName || `Supplier ${user.tecId}`;
      
      case UserRole.BUYER:
        const buyer = user as Buyer;
        // If viewer is supplier, only show TecID
        if (viewerRole === UserRole.SUPPLIER) {
          return `Buyer ${user.tecId}`;
        }
        // Admin or same user can see company name
        return buyer.companyName || `Buyer ${user.tecId}`;
      
      case UserRole.ADMIN:
        return `Admin ${user.tecId}`;
      
      default:
        return `User ${user.tecId}`;
    }
  }

  /**
   * Sanitize user data based on viewer role to ensure privacy
   */
  static sanitizeUserData(user: User, viewerRole: UserRole): Partial<User> {
    const baseData = {
      tecId: user.tecId,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    // Suppliers should never see buyer personal information
    if (user.role === UserRole.BUYER && viewerRole === UserRole.SUPPLIER) {
      return baseData;
    }

    // Add role-specific data based on permissions
    switch (user.role) {
      case UserRole.SUPPLIER:
        const supplier = user as Supplier;
        return {
          ...baseData,
          companyName: supplier.companyName,
          isVerified: supplier.isVerified,
        };
      
      case UserRole.BUYER:
        const buyer = user as Buyer;
        if (viewerRole === UserRole.ADMIN || viewerRole === UserRole.BUYER) {
          return {
            ...baseData,
            companyName: buyer.companyName,
            email: buyer.email,
          };
        }
        return baseData;
      
      default:
        return baseData;
    }
  }

  /**
   * Format TecID for display with consistent styling
   */
  static formatTecIdDisplay(tecId: string): string {
    if (!this.isValidTecId(tecId)) {
      return tecId;
    }
    
    const parts = tecId.split('-');
    return `${parts[0]}-${parts[1]}-${parts[2]}`;
  }

  /**
   * Generate TecID for different entity types
   */
  static generateEntityTecId(entityType: 'user' | 'product' | 'rfq' | 'order' | 'message'): string {
    const prefixes = {
      user: 'USR',
      product: 'PRD',
      rfq: 'RFQ',
      order: 'ORD',
      message: 'MSG',
    };
    
    return this.generateTecId(prefixes[entityType]);
  }

  /**
   * Extract entity type from TecID
   */
  static getEntityTypeFromTecId(tecId: string): string | null {
    if (!this.isValidTecId(tecId)) {
      return null;
    }
    
    const prefix = tecId.split('-')[0];
    const typeMap: Record<string, string> = {
      'USR': 'user',
      'PRD': 'product',
      'RFQ': 'rfq',
      'ORD': 'order',
      'MSG': 'message',
      'TEC': 'legacy', // For backward compatibility
    };
    
    return typeMap[prefix] || 'unknown';
  }

  /**
   * Create anonymous reference for suppliers when referencing buyers
   */
  static createAnonymousReference(buyerTecId: string): string {
    return `Buyer-${buyerTecId}`;
  }

  /**
   * Validate that a user can access another user's information
   */
  static canAccessUserInfo(viewer: User, target: User): boolean {
    // Admin can access all
    if (viewer.role === UserRole.ADMIN) {
      return true;
    }
    
    // Users can access their own info
    if (viewer.tecId === target.tecId) {
      return true;
    }
    
    // Suppliers cannot access buyer personal information
    if (viewer.role === UserRole.SUPPLIER && target.role === UserRole.BUYER) {
      return false;
    }
    
    // Buyers can access supplier company information
    if (viewer.role === UserRole.BUYER && target.role === UserRole.SUPPLIER) {
      return true;
    }
    
    return false;
  }

  /**
   * Create a masked display for sensitive information
   */
  static maskSensitiveInfo(info: string, visibleChars: number = 4): string {
    if (info.length <= visibleChars) {
      return info;
    }
    
    const visible = info.substring(0, visibleChars);
    const masked = '*'.repeat(info.length - visibleChars);
    return `${visible}${masked}`;
  }
}

/**
 * Privacy protection utilities
 */
export class PrivacyUtils {
  /**
   * Remove personal information from buyer data for supplier view
   */
  static sanitizeBuyerForSupplier(buyer: Buyer): Partial<Buyer> {
    return {
      tecId: buyer.tecId,
      role: buyer.role,
      companyName: buyer.companyName,
      isActive: buyer.isActive,
      createdAt: buyer.createdAt,
      // personalInfo is excluded
    };
  }

  /**
   * Check if data contains personal information that should be protected
   */
  static containsPersonalInfo(data: any): boolean {
    const personalFields = ['firstName', 'lastName', 'phone', 'address', 'email'];
    
    if (typeof data !== 'object' || data === null) {
      return false;
    }
    
    return personalFields.some(field => field in data);
  }

  /**
   * Log privacy access for audit purposes
   */
  static logPrivacyAccess(viewer: User, target: User, action: string): void {
    // In a real application, this would log to an audit system
    console.log(`Privacy Access: ${viewer.tecId} (${viewer.role}) accessed ${target.tecId} (${target.role}) for ${action}`);
  }
}