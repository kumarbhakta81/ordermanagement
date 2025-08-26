const { query, queryOne, transaction } = require('../models/database');
const { apiResponse, generateOrderNumber, formatPrice, getPaginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');

// Get orders based on user role
const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE 1=1';
        let params = [];

        // Role-based filtering
        if (req.user.role === 'retailer') {
            whereClause += ' AND o.retailer_id = ?';
            params.push(req.user.id);
        }
        // Admin and wholesaler can see all orders (wholesaler will see orders for their products)

        if (status && ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            whereClause += ' AND o.status = ?';
            params.push(status);
        }

        if (search) {
            whereClause += ' AND (o.order_number LIKE ? OR u.full_name LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern);
        }

        // Get total count
        const countResult = await queryOne(
            `SELECT COUNT(*) as total FROM orders o 
             JOIN users u ON o.retailer_id = u.id 
             ${whereClause}`,
            params
        );

        // Get orders with retailer info
        const orders = await query(
            `SELECT o.*, u.username as retailer_name, u.full_name as retailer_full_name,
                    u.email as retailer_email, u.phone as retailer_phone
             FROM orders o 
             JOIN users u ON o.retailer_id = u.id 
             ${whereClause} 
             ORDER BY o.created_at DESC 
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // Get order items for each order
        for (let order of orders) {
            const items = await query(
                `SELECT oi.*, p.name as product_name, p.category, p.images,
                        w.username as wholesaler_name, w.full_name as wholesaler_full_name
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 JOIN users w ON p.wholesaler_id = w.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );

            order.items = items.map(item => ({
                ...item,
                images: item.images ? JSON.parse(item.images) : [],
                price: formatPrice(item.price),
                subtotal: formatPrice(item.subtotal)
            }));

            order.total_amount = formatPrice(order.total_amount);
        }

        const pagination = getPaginationMeta(parseInt(page), parseInt(limit), countResult.total);

        res.json(apiResponse(true, {
            orders,
            pagination
        }, 'Orders retrieved successfully'));

    } catch (error) {
        logger.error('Get orders error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve orders'));
    }
};

// Get single order
const getOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await queryOne(
            `SELECT o.*, u.username as retailer_name, u.full_name as retailer_full_name,
                    u.email as retailer_email, u.phone as retailer_phone
             FROM orders o 
             JOIN users u ON o.retailer_id = u.id 
             WHERE o.id = ?`,
            [id]
        );

        if (!order) {
            return res.status(404).json(apiResponse(false, null, 'Order not found'));
        }

        // Check permissions
        if (req.user.role === 'retailer' && req.user.id !== order.retailer_id) {
            return res.status(404).json(apiResponse(false, null, 'Order not found'));
        }

        // Get order items
        const items = await query(
            `SELECT oi.*, p.name as product_name, p.category, p.images,
                    w.username as wholesaler_name, w.full_name as wholesaler_full_name
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN users w ON p.wholesaler_id = w.id
             WHERE oi.order_id = ?`,
            [id]
        );

        order.items = items.map(item => ({
            ...item,
            images: item.images ? JSON.parse(item.images) : [],
            price: formatPrice(item.price),
            subtotal: formatPrice(item.subtotal)
        }));

        order.total_amount = formatPrice(order.total_amount);

        res.json(apiResponse(true, order, 'Order retrieved successfully'));

    } catch (error) {
        logger.error('Get order error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve order'));
    }
};

// Create new order (Retailer only)
const createOrder = async (req, res) => {
    try {
        const { items, shipping_address, billing_address, notes } = req.body;
        const retailer_id = req.user.id;

        const result = await transaction(async (connection) => {
            let totalAmount = 0;
            const orderItems = [];

            // Validate items and calculate total
            for (const item of items) {
                const product = await connection.execute(
                    'SELECT id, name, price, quantity, status FROM products WHERE id = ? AND status = "approved"',
                    [item.product_id]
                );

                if (product[0].length === 0) {
                    throw new Error(`Product not found or not approved: ${item.product_id}`);
                }

                const productData = product[0][0];

                if (productData.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product: ${productData.name}. Available: ${productData.quantity}, Requested: ${item.quantity}`);
                }

                const itemPrice = parseFloat(productData.price);
                const itemSubtotal = itemPrice * item.quantity;
                totalAmount += itemSubtotal;

                orderItems.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: itemPrice,
                    subtotal: itemSubtotal
                });

                // Update product quantity
                await connection.execute(
                    'UPDATE products SET quantity = quantity - ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            // Create order
            const orderNumber = generateOrderNumber();
            const orderResult = await connection.execute(
                `INSERT INTO orders (retailer_id, order_number, status, total_amount, shipping_address, billing_address, notes) 
                 VALUES (?, ?, 'pending', ?, ?, ?, ?)`,
                [retailer_id, orderNumber, totalAmount, shipping_address, billing_address || null, notes || null]
            );

            const orderId = orderResult[0].insertId;

            // Create order items
            for (const item of orderItems) {
                await connection.execute(
                    'INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, item.price, item.subtotal]
                );
            }

            return orderId;
        });

        // Create notifications for admins
        await query(
            `INSERT INTO notifications (user_id, type, title, message, related_id, related_type) 
             SELECT id, 'new_order', 'New Order Placed', 
                    CONCAT('A new order has been placed by ', ?, ' for $', ?), 
                    ?, 'order'
             FROM users WHERE role = 'admin'`,
            [req.user.full_name, formatPrice(totalAmount), result]
        );

        // Get the created order
        const order = await queryOne(
            `SELECT o.*, u.username as retailer_name 
             FROM orders o 
             JOIN users u ON o.retailer_id = u.id 
             WHERE o.id = ?`,
            [result]
        );

        // Get order items
        const items_with_details = await query(
            `SELECT oi.*, p.name as product_name, p.category 
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [result]
        );

        order.items = items_with_details.map(item => ({
            ...item,
            price: formatPrice(item.price),
            subtotal: formatPrice(item.subtotal)
        }));

        order.total_amount = formatPrice(order.total_amount);

        logger.info(`New order created: ${order.order_number} by ${req.user.email}`);

        res.status(201).json(apiResponse(true, order, 'Order created successfully'));

    } catch (error) {
        logger.error('Create order error:', error);
        res.status(500).json(apiResponse(false, null, error.message || 'Failed to create order'));
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, tracking_number, estimated_delivery } = req.body;

        const order = await queryOne('SELECT * FROM orders WHERE id = ?', [id]);
        if (!order) {
            return res.status(404).json(apiResponse(false, null, 'Order not found'));
        }

        // Validate status transitions
        const validTransitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': ['delivered'],
            'delivered': [],
            'cancelled': []
        };

        if (!validTransitions[order.status].includes(status)) {
            return res.status(400).json(apiResponse(false, null, `Cannot change status from ${order.status} to ${status}`));
        }

        await query(
            'UPDATE orders SET status = ?, tracking_number = ?, estimated_delivery = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, tracking_number || null, estimated_delivery || null, id]
        );

        // If order is cancelled, return inventory
        if (status === 'cancelled') {
            await transaction(async (connection) => {
                const orderItems = await connection.execute(
                    'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                    [id]
                );

                for (const item of orderItems[0]) {
                    await connection.execute(
                        'UPDATE products SET quantity = quantity + ? WHERE id = ?',
                        [item.quantity, item.product_id]
                    );
                }
            });
        }

        // Create notification for retailer
        const statusMessages = {
            'confirmed': 'Your order has been confirmed and is being prepared',
            'processing': 'Your order is being processed',
            'shipped': `Your order has been shipped${tracking_number ? ` with tracking number: ${tracking_number}` : ''}`,
            'delivered': 'Your order has been delivered',
            'cancelled': 'Your order has been cancelled'
        };

        await query(
            `INSERT INTO notifications (user_id, type, title, message, related_id, related_type) 
             VALUES (?, 'order_status', 'Order Status Updated', ?, ?, 'order')`,
            [order.retailer_id, statusMessages[status] || `Order status updated to ${status}`, id]
        );

        const updatedOrder = await queryOne(
            `SELECT o.*, u.username as retailer_name 
             FROM orders o 
             JOIN users u ON o.retailer_id = u.id 
             WHERE o.id = ?`,
            [id]
        );

        updatedOrder.total_amount = formatPrice(updatedOrder.total_amount);

        logger.info(`Order status updated: ${order.order_number} -> ${status} by ${req.user.email}`);

        res.json(apiResponse(true, updatedOrder, 'Order status updated successfully'));

    } catch (error) {
        logger.error('Update order status error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to update order status'));
    }
};

// Cancel order (Retailer can cancel pending orders, Admin can cancel any)
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await queryOne('SELECT * FROM orders WHERE id = ?', [id]);
        if (!order) {
            return res.status(404).json(apiResponse(false, null, 'Order not found'));
        }

        // Check permissions
        if (req.user.role === 'retailer') {
            if (req.user.id !== order.retailer_id || order.status !== 'pending') {
                return res.status(403).json(apiResponse(false, null, 'Cannot cancel this order'));
            }
        }

        if (['delivered', 'cancelled'].includes(order.status)) {
            return res.status(400).json(apiResponse(false, null, 'Order cannot be cancelled'));
        }

        // Return inventory and cancel order
        await transaction(async (connection) => {
            const orderItems = await connection.execute(
                'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                [id]
            );

            for (const item of orderItems[0]) {
                await connection.execute(
                    'UPDATE products SET quantity = quantity + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            await connection.execute(
                'UPDATE orders SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [id]
            );
        });

        // Create notification
        await query(
            `INSERT INTO notifications (user_id, type, title, message, related_id, related_type) 
             VALUES (?, 'order_cancelled', 'Order Cancelled', 'Your order has been cancelled and inventory has been restored', ?, 'order')`,
            [order.retailer_id, id]
        );

        logger.info(`Order cancelled: ${order.order_number} by ${req.user.email}`);

        res.json(apiResponse(true, null, 'Order cancelled successfully'));

    } catch (error) {
        logger.error('Cancel order error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to cancel order'));
    }
};

module.exports = {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    cancelOrder
};