const { body, param, query, validationResult } = require('express-validator');
const { apiResponse, formatValidationErrors } = require('../utils/helpers');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = formatValidationErrors(errors.array());
        return res.status(400).json(apiResponse(false, null, 'Validation failed', formattedErrors));
    }
    next();
};

// User registration validation
const validateUserRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('full_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    
    body('role')
        .optional()
        .isIn(['retailer', 'wholesaler'])
        .withMessage('Role must be either retailer or wholesaler'),
    
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    
    handleValidationErrors
];

// User login validation
const validateUserLogin = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

// Product validation
const validateProduct = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Product name must be between 2 and 255 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Description cannot exceed 2000 characters'),
    
    body('category')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Category must be between 2 and 100 characters'),
    
    body('price')
        .isFloat({ min: 0.01 })
        .withMessage('Price must be a positive number'),
    
    body('quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Quantity must be a non-negative integer'),
    
    handleValidationErrors
];

// Sample validation
const validateSample = [
    body('product_name')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Product name must be between 2 and 255 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Description cannot exceed 2000 characters'),
    
    body('category')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Category cannot exceed 100 characters'),
    
    handleValidationErrors
];

// Order validation
const validateOrder = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),
    
    body('items.*.product_id')
        .isInt({ min: 1 })
        .withMessage('Product ID must be a positive integer'),
    
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
    
    body('shipping_address')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Shipping address must be between 10 and 500 characters'),
    
    body('billing_address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Billing address cannot exceed 500 characters'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes cannot exceed 1000 characters'),
    
    handleValidationErrors
];

// Order status update validation
const validateOrderStatus = [
    body('status')
        .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Invalid order status'),
    
    body('tracking_number')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Tracking number cannot exceed 100 characters'),
    
    body('estimated_delivery')
        .optional()
        .isISO8601()
        .withMessage('Estimated delivery must be a valid date'),
    
    handleValidationErrors
];

// Notification validation
const validateNotification = [
    body('type')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Notification type must be between 2 and 50 characters'),
    
    body('title')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Title must be between 2 and 255 characters'),
    
    body('message')
        .trim()
        .isLength({ min: 2, max: 2000 })
        .withMessage('Message must be between 2 and 2000 characters'),
    
    handleValidationErrors
];

// Parameter validation
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID must be a positive integer'),
    
    handleValidationErrors
];

// Pagination validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    handleValidationErrors
];

// File upload validation
const validateFileUpload = (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json(apiResponse(false, null, 'No files uploaded'));
    }

    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of req.files) {
        if (!allowedMimes.includes(file.mimetype)) {
            return res.status(400).json(apiResponse(
                false, 
                null, 
                `Invalid file type: ${file.originalname}. Only JPEG, PNG, GIF, and WebP are allowed.`
            ));
        }

        if (file.size > maxSize) {
            return res.status(400).json(apiResponse(
                false, 
                null, 
                `File too large: ${file.originalname}. Maximum size is 10MB.`
            ));
        }
    }

    next();
};

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateProduct,
    validateSample,
    validateOrder,
    validateOrderStatus,
    validateNotification,
    validateId,
    validatePagination,
    validateFileUpload,
    handleValidationErrors
};