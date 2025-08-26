const { query, queryOne, transaction } = require('../models/database');
const { apiResponse, formatPrice, getPaginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');

// Get all approved products (public)
const getProducts = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            category, 
            search, 
            min_price, 
            max_price,
            wholesaler_id 
        } = req.query;
        
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE p.status = "approved"';
        let params = [];

        // Add filters
        if (category) {
            whereClause += ' AND p.category = ?';
            params.push(category);
        }

        if (search) {
            whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern);
        }

        if (min_price) {
            whereClause += ' AND p.price >= ?';
            params.push(parseFloat(min_price));
        }

        if (max_price) {
            whereClause += ' AND p.price <= ?';
            params.push(parseFloat(max_price));
        }

        if (wholesaler_id) {
            whereClause += ' AND p.wholesaler_id = ?';
            params.push(parseInt(wholesaler_id));
        }

        // Get total count
        const countResult = await queryOne(
            `SELECT COUNT(*) as total FROM products p ${whereClause}`,
            params
        );

        // Get products with wholesaler info
        const products = await query(
            `SELECT p.*, u.username as wholesaler_name, u.full_name as wholesaler_full_name
             FROM products p 
             JOIN users u ON p.wholesaler_id = u.id 
             ${whereClause} 
             ORDER BY p.created_at DESC 
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // Parse images JSON
        const formattedProducts = products.map(product => ({
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
            price: formatPrice(product.price)
        }));

        const pagination = getPaginationMeta(parseInt(page), parseInt(limit), countResult.total);

        res.json(apiResponse(true, {
            products: formattedProducts,
            pagination
        }, 'Products retrieved successfully'));

    } catch (error) {
        logger.error('Get products error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve products'));
    }
};

// Get single product
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await queryOne(
            `SELECT p.*, u.username as wholesaler_name, u.full_name as wholesaler_full_name,
                    u.email as wholesaler_email, u.phone as wholesaler_phone
             FROM products p 
             JOIN users u ON p.wholesaler_id = u.id 
             WHERE p.id = ?`,
            [id]
        );

        if (!product) {
            return res.status(404).json(apiResponse(false, null, 'Product not found'));
        }

        // Check permissions for non-approved products
        if (product.status !== 'approved') {
            if (!req.user) {
                return res.status(404).json(apiResponse(false, null, 'Product not found'));
            }
            
            if (req.user.role !== 'admin' && req.user.id !== product.wholesaler_id) {
                return res.status(404).json(apiResponse(false, null, 'Product not found'));
            }
        }

        const formattedProduct = {
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
            price: formatPrice(product.price)
        };

        res.json(apiResponse(true, formattedProduct, 'Product retrieved successfully'));

    } catch (error) {
        logger.error('Get product error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve product'));
    }
};

// Create new product (Wholesaler only)
const createProduct = async (req, res) => {
    try {
        const { name, description, category, price, quantity = 0 } = req.body;
        const wholesaler_id = req.user.id;
        const images = req.files ? req.files.map(file => file.filename) : [];

        const result = await query(
            `INSERT INTO products (wholesaler_id, name, description, category, price, quantity, images, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [wholesaler_id, name, description, category, formatPrice(price), parseInt(quantity), JSON.stringify(images)]
        );

        // Create notification for admin
        await query(
            `INSERT INTO notifications (user_id, type, title, message, related_id, related_type) 
             SELECT id, 'product_upload', 'New Product Submitted', 
                    CONCAT('A new product "', ?, '" has been submitted for approval by ', ?), 
                    ?, 'product'
             FROM users WHERE role = 'admin'`,
            [name, req.user.full_name, result.insertId]
        );

        const product = await queryOne(
            'SELECT * FROM products WHERE id = ?',
            [result.insertId]
        );

        const formattedProduct = {
            ...product,
            images: JSON.parse(product.images || '[]'),
            price: formatPrice(product.price)
        };

        logger.info(`New product created: ${name} by ${req.user.email}`);

        res.status(201).json(apiResponse(true, formattedProduct, 'Product created successfully'));

    } catch (error) {
        logger.error('Create product error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to create product'));
    }
};

// Update product (Wholesaler - own products only)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, price, quantity } = req.body;
        const wholesaler_id = req.user.id;

        // Check if product exists and belongs to user
        const existingProduct = await queryOne(
            'SELECT * FROM products WHERE id = ? AND wholesaler_id = ?',
            [id, wholesaler_id]
        );

        if (!existingProduct) {
            return res.status(404).json(apiResponse(false, null, 'Product not found'));
        }

        // If product was approved, set back to pending for re-approval
        const newStatus = existingProduct.status === 'approved' ? 'pending' : existingProduct.status;

        let updateImages = JSON.parse(existingProduct.images || '[]');
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.filename);
            updateImages = [...updateImages, ...newImages];
        }

        await query(
            `UPDATE products 
             SET name = ?, description = ?, category = ?, price = ?, quantity = ?, 
                 images = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [name, description, category, formatPrice(price), parseInt(quantity), 
             JSON.stringify(updateImages), newStatus, id]
        );

        // If status changed to pending, notify admin
        if (newStatus === 'pending' && existingProduct.status !== 'pending') {
            await query(
                `INSERT INTO notifications (user_id, type, title, message, related_id, related_type) 
                 SELECT id, 'product_update', 'Product Updated - Needs Re-approval', 
                        CONCAT('Product "', ?, '" has been updated and needs re-approval'), 
                        ?, 'product'
                 FROM users WHERE role = 'admin'`,
                [name, id]
            );
        }

        const product = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
        const formattedProduct = {
            ...product,
            images: JSON.parse(product.images || '[]'),
            price: formatPrice(product.price)
        };

        logger.info(`Product updated: ${name} by ${req.user.email}`);

        res.json(apiResponse(true, formattedProduct, 'Product updated successfully'));

    } catch (error) {
        logger.error('Update product error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to update product'));
    }
};

// Delete product (Wholesaler - own products only)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const wholesaler_id = req.user.id;

        const result = await query(
            'DELETE FROM products WHERE id = ? AND wholesaler_id = ?',
            [id, wholesaler_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(apiResponse(false, null, 'Product not found'));
        }

        logger.info(`Product deleted: ID ${id} by ${req.user.email}`);

        res.json(apiResponse(true, null, 'Product deleted successfully'));

    } catch (error) {
        logger.error('Delete product error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to delete product'));
    }
};

// Approve/Reject product (Admin only)
const updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json(apiResponse(false, null, 'Invalid status'));
        }

        const product = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
        if (!product) {
            return res.status(404).json(apiResponse(false, null, 'Product not found'));
        }

        await query(
            'UPDATE products SET status = ?, rejection_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, rejection_reason || null, id]
        );

        // Notify wholesaler
        const notificationTitle = status === 'approved' ? 'Product Approved' : 'Product Rejected';
        const notificationMessage = status === 'approved' 
            ? `Your product "${product.name}" has been approved and is now live`
            : `Your product "${product.name}" has been rejected. Reason: ${rejection_reason || 'No reason provided'}`;

        await query(
            `INSERT INTO notifications (user_id, type, title, message, related_id, related_type) 
             VALUES (?, ?, ?, ?, ?, 'product')`,
            [product.wholesaler_id, `product_${status}`, notificationTitle, notificationMessage, id]
        );

        const updatedProduct = await queryOne(
            `SELECT p.*, u.username as wholesaler_name 
             FROM products p 
             JOIN users u ON p.wholesaler_id = u.id 
             WHERE p.id = ?`,
            [id]
        );

        const formattedProduct = {
            ...updatedProduct,
            images: JSON.parse(updatedProduct.images || '[]'),
            price: formatPrice(updatedProduct.price)
        };

        logger.info(`Product ${status}: ${product.name} by admin ${req.user.email}`);

        res.json(apiResponse(true, formattedProduct, `Product ${status} successfully`));

    } catch (error) {
        logger.error('Update product status error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to update product status'));
    }
};

// Get pending products (Admin only)
const getPendingProducts = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const countResult = await queryOne(
            'SELECT COUNT(*) as total FROM products WHERE status = "pending"'
        );

        const products = await query(
            `SELECT p.*, u.username as wholesaler_name, u.full_name as wholesaler_full_name,
                    u.email as wholesaler_email, u.phone as wholesaler_phone
             FROM products p 
             JOIN users u ON p.wholesaler_id = u.id 
             WHERE p.status = "pending" 
             ORDER BY p.created_at ASC 
             LIMIT ? OFFSET ?`,
            [parseInt(limit), offset]
        );

        const formattedProducts = products.map(product => ({
            ...product,
            images: JSON.parse(product.images || '[]'),
            price: formatPrice(product.price)
        }));

        const pagination = getPaginationMeta(parseInt(page), parseInt(limit), countResult.total);

        res.json(apiResponse(true, {
            products: formattedProducts,
            pagination
        }, 'Pending products retrieved successfully'));

    } catch (error) {
        logger.error('Get pending products error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve pending products'));
    }
};

// Get categories
const getCategories = async (req, res) => {
    try {
        const categories = await query(
            'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name'
        );

        res.json(apiResponse(true, categories, 'Categories retrieved successfully'));
    } catch (error) {
        logger.error('Get categories error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve categories'));
    }
};

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    getPendingProducts,
    getCategories
};