const express = require('express');
const router = express.Router();
const { authenticateToken, authorize, optionalAuth } = require('../middleware/auth');
const { apiLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const { uploadMultiple, handleUploadErrors, secureUpload } = require('../middleware/upload');
const { 
    validateProduct, 
    validateId, 
    validatePagination,
    validateFileUpload 
} = require('../middleware/validation');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    getPendingProducts,
    getCategories
} = require('../controllers/productController');

// Public routes
router.get('/', optionalAuth, validatePagination, getProducts);
router.get('/categories', getCategories);
router.get('/:id', optionalAuth, validateId, getProduct);

// Wholesaler routes
router.post('/', 
    authenticateToken, 
    authorize('wholesaler'), 
    uploadLimiter,
    uploadMultiple, 
    handleUploadErrors,
    secureUpload,
    validateProduct,
    createProduct
);

router.put('/:id', 
    authenticateToken, 
    authorize('wholesaler'),
    uploadLimiter,
    uploadMultiple,
    handleUploadErrors,
    secureUpload,
    validateId,
    validateProduct,
    updateProduct
);

router.delete('/:id', 
    authenticateToken, 
    authorize('wholesaler'),
    validateId,
    deleteProduct
);

// Admin routes
router.get('/admin/pending', 
    authenticateToken, 
    authorize('admin'), 
    validatePagination,
    getPendingProducts
);

router.put('/:id/status', 
    authenticateToken, 
    authorize('admin'),
    validateId,
    updateProductStatus
);

module.exports = router;