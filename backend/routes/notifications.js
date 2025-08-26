const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const { 
    validateNotification, 
    validateId, 
    validatePagination 
} = require('../middleware/validation');
const {
    getNotifications,
    getNotificationCounts,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    getRecentNotifications
} = require('../controllers/notificationController');

// All notification routes require authentication
router.get('/', authenticateToken, validatePagination, getNotifications);
router.get('/counts', authenticateToken, getNotificationCounts);
router.get('/recent', authenticateToken, getRecentNotifications);

router.put('/:id/read', authenticateToken, validateId, markAsRead);
router.put('/read-all', authenticateToken, markAllAsRead);
router.delete('/:id', authenticateToken, validateId, deleteNotification);

// Admin routes
router.post('/', 
    authenticateToken, 
    authorize('admin'),
    validateNotification,
    createNotification
);

module.exports = router;