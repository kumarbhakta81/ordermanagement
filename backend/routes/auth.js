const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const { authLimiter, strictLimiter } = require('../middleware/rateLimiter');
const { 
    validateUserRegistration, 
    validateUserLogin, 
    validateId 
} = require('../middleware/validation');
const {
    register,
    login,
    getProfile,
    updateProfile,
    getAllUsers,
    updateUserRole
} = require('../controllers/authController');

// Public routes
router.post('/register', authLimiter, validateUserRegistration, register);
router.post('/login', authLimiter, validateUserLogin, login);

// Protected routes
router.get('/me', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// Admin routes
router.get('/users', authenticateToken, authorize('admin'), getAllUsers);
router.put('/users/:id/role', authenticateToken, authorize('admin'), strictLimiter, validateId, updateUserRole);

module.exports = router;