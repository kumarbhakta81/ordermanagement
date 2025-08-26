const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');
const { 
    validateOrder, 
    validateOrderStatus, 
    validateId, 
    validatePagination 
} = require('../middleware/validation');
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController');

// All order routes require authentication
router.get('/', authenticateToken, validatePagination, getOrders);
router.get('/:id', authenticateToken, validateId, getOrder);

// Retailer routes
router.post('/', 
    authenticateToken, 
    authorize('retailer'),
    orderLimiter,
    validateOrder,
    createOrder
);

router.delete('/:id', 
    authenticateToken, 
    validateId,
    cancelOrder
);

// Admin and wholesaler routes (status updates)
router.put('/:id/status', 
    authenticateToken, 
    authorize('admin', 'wholesaler'),
    validateId,
    validateOrderStatus,
    updateOrderStatus
);

module.exports = router;