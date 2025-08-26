const crypto = require('crypto');
const path = require('path');

// Generate secure random filename
const generateSecureFilename = (originalname, prefix = '') => {
    const ext = path.extname(originalname);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${prefix}${timestamp}_${random}${ext}`;
};

// Generate order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `ORD-${timestamp.slice(-8)}-${random}`;
};

// Sanitize filename
const sanitizeFilename = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
};

// Format price
const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
};

// Validate email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number
const isValidPhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Generate pagination metadata
const getPaginationMeta = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
    };
};

// Clean object for logging (remove sensitive data)
const cleanForLogging = (obj) => {
    const sensitiveFields = ['password', 'token', 'authorization'];
    const cleaned = { ...obj };
    
    for (const field of sensitiveFields) {
        if (cleaned[field]) {
            cleaned[field] = '[REDACTED]';
        }
    }
    
    return cleaned;
};

// Format validation errors
const formatValidationErrors = (errors) => {
    return errors.map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
    }));
};

// Check if file type is allowed
const isAllowedFileType = (mimetype, allowedTypes = []) => {
    if (allowedTypes.length === 0) {
        // Default allowed types for images
        allowedTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp'
        ];
    }
    return allowedTypes.includes(mimetype);
};

// Get file size in human readable format
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Escape HTML to prevent XSS
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// Generate API response
const apiResponse = (success = true, data = null, message = '', errors = []) => {
    return {
        success,
        message,
        data,
        ...(errors.length > 0 && { errors }),
        timestamp: new Date().toISOString()
    };
};

module.exports = {
    generateSecureFilename,
    generateOrderNumber,
    sanitizeFilename,
    formatPrice,
    isValidEmail,
    isValidPhone,
    getPaginationMeta,
    cleanForLogging,
    formatValidationErrors,
    isAllowedFileType,
    formatFileSize,
    escapeHtml,
    apiResponse
};