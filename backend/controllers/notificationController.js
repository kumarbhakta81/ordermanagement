const { query, queryOne } = require('../models/database');
const { apiResponse, getPaginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');

// Get user notifications
const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, is_read } = req.query;
        const offset = (page - 1) * limit;
        const userId = req.user.id;
        
        let whereClause = 'WHERE user_id = ?';
        let params = [userId];

        if (type) {
            whereClause += ' AND type = ?';
            params.push(type);
        }

        if (is_read !== undefined) {
            whereClause += ' AND is_read = ?';
            params.push(is_read === 'true');
        }

        // Get total count
        const countResult = await queryOne(
            `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
            params
        );

        // Get unread count
        const unreadResult = await queryOne(
            'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );

        // Get notifications
        const notifications = await query(
            `SELECT * FROM notifications ${whereClause} 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const pagination = getPaginationMeta(parseInt(page), parseInt(limit), countResult.total);

        res.json(apiResponse(true, {
            notifications,
            pagination,
            unread_count: unreadResult.unread
        }, 'Notifications retrieved successfully'));

    } catch (error) {
        logger.error('Get notifications error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve notifications'));
    }
};

// Get notification counts by type
const getNotificationCounts = async (req, res) => {
    try {
        const userId = req.user.id;

        const counts = await query(
            `SELECT type, 
                    COUNT(*) as total,
                    SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread
             FROM notifications 
             WHERE user_id = ? 
             GROUP BY type
             ORDER BY type`,
            [userId]
        );

        // Get overall counts
        const overall = await queryOne(
            `SELECT COUNT(*) as total,
                    SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread
             FROM notifications 
             WHERE user_id = ?`,
            [userId]
        );

        res.json(apiResponse(true, {
            overall: overall || { total: 0, unread: 0 },
            by_type: counts
        }, 'Notification counts retrieved successfully'));

    } catch (error) {
        logger.error('Get notification counts error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve notification counts'));
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(apiResponse(false, null, 'Notification not found'));
        }

        const notification = await queryOne(
            'SELECT * FROM notifications WHERE id = ?',
            [id]
        );

        res.json(apiResponse(true, notification, 'Notification marked as read'));

    } catch (error) {
        logger.error('Mark notification as read error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to mark notification as read'));
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.body; // Optional: mark all of specific type as read

        let query_text = 'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE';
        let params = [userId];

        if (type) {
            query_text += ' AND type = ?';
            params.push(type);
        }

        const result = await query(query_text, params);

        logger.info(`Marked ${result.affectedRows} notifications as read for user ${req.user.email}`);

        res.json(apiResponse(true, { 
            updated_count: result.affectedRows 
        }, 'Notifications marked as read'));

    } catch (error) {
        logger.error('Mark all notifications as read error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to mark notifications as read'));
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await query(
            'DELETE FROM notifications WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(apiResponse(false, null, 'Notification not found'));
        }

        res.json(apiResponse(true, null, 'Notification deleted successfully'));

    } catch (error) {
        logger.error('Delete notification error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to delete notification'));
    }
};

// Create notification (Admin only - for manual notifications)
const createNotification = async (req, res) => {
    try {
        const { user_id, type, title, message, related_id, related_type } = req.body;

        // If user_id is 'all', send to all users
        if (user_id === 'all') {
            await query(
                `INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
                 SELECT id, ?, ?, ?, ?, ?
                 FROM users WHERE is_active = TRUE`,
                [type, title, message, related_id || null, related_type || null]
            );

            res.status(201).json(apiResponse(true, null, 'Notification sent to all users'));
        } else {
            // Check if target user exists
            const targetUser = await queryOne(
                'SELECT id FROM users WHERE id = ? AND is_active = TRUE',
                [user_id]
            );

            if (!targetUser) {
                return res.status(404).json(apiResponse(false, null, 'Target user not found'));
            }

            const result = await query(
                'INSERT INTO notifications (user_id, type, title, message, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
                [user_id, type, title, message, related_id || null, related_type || null]
            );

            const notification = await queryOne(
                'SELECT * FROM notifications WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json(apiResponse(true, notification, 'Notification created successfully'));
        }

        logger.info(`Notification created by admin ${req.user.email} for user(s) ${user_id}`);

    } catch (error) {
        logger.error('Create notification error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to create notification'));
    }
};

// Get recent notifications for real-time polling
const getRecentNotifications = async (req, res) => {
    try {
        const { since } = req.query; // ISO timestamp
        const userId = req.user.id;

        let whereClause = 'WHERE user_id = ?';
        let params = [userId];

        if (since) {
            whereClause += ' AND created_at > ?';
            params.push(since);
        }

        const notifications = await query(
            `SELECT * FROM notifications ${whereClause} 
             ORDER BY created_at DESC 
             LIMIT 50`,
            params
        );

        // Get current unread count
        const unreadResult = await queryOne(
            'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );

        res.json(apiResponse(true, {
            notifications,
            unread_count: unreadResult.unread,
            timestamp: new Date().toISOString()
        }, 'Recent notifications retrieved successfully'));

    } catch (error) {
        logger.error('Get recent notifications error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve recent notifications'));
    }
};

module.exports = {
    getNotifications,
    getNotificationCounts,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    getRecentNotifications
};