const bcrypt = require('bcryptjs');
const { query, queryOne } = require('../models/database');
const { generateToken } = require('../middleware/auth');
const { apiResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

// Register new user
const register = async (req, res) => {
    try {
        const { username, email, password, full_name, role = 'retailer', phone, address } = req.body;

        // Check if user already exists
        const existingUser = await queryOne(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUser) {
            return res.status(400).json(apiResponse(false, null, 'User with this email or username already exists'));
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await query(
            `INSERT INTO users (username, email, password, full_name, role, phone, address) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, full_name, role, phone || null, address || null]
        );

        // Generate token
        const token = generateToken(result.insertId, role);

        // Get user data (without password)
        const user = await queryOne(
            'SELECT id, username, email, full_name, role, phone, address, created_at FROM users WHERE id = ?',
            [result.insertId]
        );

        logger.info(`New user registered: ${email} (${role})`);

        res.status(201).json(apiResponse(true, {
            user,
            token
        }, 'User registered successfully'));

    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json(apiResponse(false, null, 'Registration failed'));
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await queryOne(
            'SELECT id, username, email, password, full_name, role, is_active FROM users WHERE email = ?',
            [email]
        );

        if (!user || !user.is_active) {
            return res.status(401).json(apiResponse(false, null, 'Invalid credentials'));
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json(apiResponse(false, null, 'Invalid credentials'));
        }

        // Generate token
        const token = generateToken(user.id, user.role);

        // Remove password from response
        delete user.password;

        logger.info(`User logged in: ${email}`);

        res.json(apiResponse(true, {
            user,
            token
        }, 'Login successful'));

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json(apiResponse(false, null, 'Login failed'));
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await queryOne(
            'SELECT id, username, email, full_name, role, phone, address, created_at, updated_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json(apiResponse(false, null, 'User not found'));
        }

        res.json(apiResponse(true, user, 'Profile retrieved successfully'));

    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve profile'));
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { full_name, phone, address } = req.body;
        const userId = req.user.id;

        await query(
            'UPDATE users SET full_name = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [full_name, phone || null, address || null, userId]
        );

        // Get updated user data
        const user = await queryOne(
            'SELECT id, username, email, full_name, role, phone, address, created_at, updated_at FROM users WHERE id = ?',
            [userId]
        );

        logger.info(`Profile updated for user: ${user.email}`);

        res.json(apiResponse(true, user, 'Profile updated successfully'));

    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to update profile'));
    }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE 1=1';
        let params = [];

        if (role && ['admin', 'wholesaler', 'retailer'].includes(role)) {
            whereClause += ' AND role = ?';
            params.push(role);
        }

        if (search) {
            whereClause += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        // Get total count
        const countResult = await queryOne(
            `SELECT COUNT(*) as total FROM users ${whereClause}`,
            params
        );

        // Get users
        const users = await query(
            `SELECT id, username, email, full_name, role, phone, is_active, created_at, updated_at 
             FROM users ${whereClause} 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const pagination = {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult.total,
            pages: Math.ceil(countResult.total / limit)
        };

        res.json(apiResponse(true, { users, pagination }, 'Users retrieved successfully'));

    } catch (error) {
        logger.error('Get all users error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve users'));
    }
};

// Update user role (Admin only)
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['admin', 'wholesaler', 'retailer'].includes(role)) {
            return res.status(400).json(apiResponse(false, null, 'Invalid role'));
        }

        // Prevent admin from changing their own role
        if (parseInt(id) === req.user.id) {
            return res.status(400).json(apiResponse(false, null, 'Cannot change your own role'));
        }

        const result = await query(
            'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(apiResponse(false, null, 'User not found'));
        }

        // Get updated user
        const user = await queryOne(
            'SELECT id, username, email, full_name, role, phone, is_active FROM users WHERE id = ?',
            [id]
        );

        logger.info(`User role updated: ${user.email} -> ${role}`);

        res.json(apiResponse(true, user, 'User role updated successfully'));

    } catch (error) {
        logger.error('Update user role error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to update user role'));
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    getAllUsers,
    updateUserRole
};