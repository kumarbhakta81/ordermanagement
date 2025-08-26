const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getDashboardAnalytics,
    getOrderAnalytics,
    getProductAnalytics
} = require('../controllers/analyticsController');

// All analytics routes require authentication
router.get('/dashboard', authenticateToken, getDashboardAnalytics);
router.get('/orders', authenticateToken, getOrderAnalytics);
router.get('/products', authenticateToken, getProductAnalytics);

module.exports = router;