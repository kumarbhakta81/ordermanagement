const jwt = require('jsonwebtoken');
const { queryOne } = require('../models/database');
const { apiResponse } = require('../utils/helpers');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json(apiResponse(false, null, 'Access token required'));
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user from database to ensure they still exist and are active
        const user = await queryOne(
            'SELECT id, username, email, full_name, role, is_active FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (!user || !user.is_active) {
            return res.status(401).json(apiResponse(false, null, 'Invalid or expired token'));
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(403).json(apiResponse(false, null, 'Invalid token'));
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json(apiResponse(false, null, 'Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json(apiResponse(false, null, 'Insufficient permissions'));
        }

        next();
    };
};

// Check if user owns resource or is admin
const authorizeOwnerOrAdmin = (userIdField = 'user_id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json(apiResponse(false, null, 'Authentication required'));
        }

        // Admin can access everything
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user owns the resource
        const resourceUserId = req.body[userIdField] || req.params[userIdField] || req.query[userIdField];
        
        if (req.user.id !== parseInt(resourceUserId)) {
            return res.status(403).json(apiResponse(false, null, 'Access denied'));
        }

        next();
    };
};

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await queryOne(
                'SELECT id, username, email, full_name, role, is_active FROM users WHERE id = ? AND is_active = TRUE',
                [decoded.userId]
            );
            
            if (user) {
                req.user = user;
            }
        }
    } catch (error) {
        // Ignore errors for optional auth
        console.log('Optional auth failed:', error.message);
    }
    
    next();
};

// Generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

// Verify password reset token
const verifyResetToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET + 'reset');
    } catch (error) {
        throw new Error('Invalid or expired reset token');
    }
};

// Generate password reset token
const generateResetToken = (userId) => {
    return jwt.sign(
        { userId, type: 'reset' },
        JWT_SECRET + 'reset',
        { expiresIn: '1h' }
    );
};

module.exports = {
    authenticateToken,
    authorize,
    authorizeOwnerOrAdmin,
    optionalAuth,
    generateToken,
    generateResetToken,
    verifyResetToken
};