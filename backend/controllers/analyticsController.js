const { query, queryOne } = require('../models/database');
const { apiResponse, formatPrice } = require('../utils/helpers');
const logger = require('../utils/logger');

// Get dashboard analytics based on user role
const getDashboardAnalytics = async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        let analytics = {};

        if (role === 'admin') {
            // Admin dashboard analytics
            const userStats = await query(
                `SELECT role, COUNT(*) as count 
                 FROM users WHERE is_active = TRUE 
                 GROUP BY role`
            );

            const productStats = await queryOne(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
                 FROM products`
            );

            const orderStats = await queryOne(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                    SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
                    SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                    SUM(total_amount) as total_revenue
                 FROM orders`
            );

            const sampleStats = await queryOne(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
                 FROM samples`
            );

            // Recent activity
            const recentOrders = await query(
                `SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
                        u.full_name as retailer_name
                 FROM orders o
                 JOIN users u ON o.retailer_id = u.id
                 ORDER BY o.created_at DESC
                 LIMIT 10`
            );

            const recentProducts = await query(
                `SELECT p.id, p.name, p.status, p.created_at,
                        u.full_name as wholesaler_name
                 FROM products p
                 JOIN users u ON p.wholesaler_id = u.id
                 WHERE p.status = 'pending'
                 ORDER BY p.created_at DESC
                 LIMIT 10`
            );

            analytics = {
                users: userStats.reduce((acc, stat) => ({ ...acc, [stat.role]: stat.count }), {}),
                products: productStats,
                orders: {
                    ...orderStats,
                    total_revenue: formatPrice(orderStats.total_revenue || 0)
                },
                samples: sampleStats,
                recent_orders: recentOrders.map(order => ({
                    ...order,
                    total_amount: formatPrice(order.total_amount)
                })),
                recent_products: recentProducts
            };

        } else if (role === 'wholesaler') {
            // Wholesaler dashboard analytics
            const productStats = await queryOne(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                    SUM(quantity) as total_inventory
                 FROM products WHERE wholesaler_id = ?`,
                [userId]
            );

            const sampleStats = await queryOne(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
                 FROM samples WHERE wholesaler_id = ?`,
                [userId]
            );

            // Orders for wholesaler's products
            const orderStats = await queryOne(
                `SELECT 
                    COUNT(DISTINCT o.id) as total_orders,
                    SUM(oi.quantity) as total_items_sold,
                    SUM(oi.subtotal) as total_revenue
                 FROM orders o
                 JOIN order_items oi ON o.id = oi.order_id
                 JOIN products p ON oi.product_id = p.id
                 WHERE p.wholesaler_id = ? AND o.status != 'cancelled'`,
                [userId]
            );

            // Top selling products
            const topProducts = await query(
                `SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as revenue
                 FROM products p
                 JOIN order_items oi ON p.id = oi.product_id
                 JOIN orders o ON oi.order_id = o.id
                 WHERE p.wholesaler_id = ? AND o.status != 'cancelled'
                 GROUP BY p.id, p.name
                 ORDER BY total_sold DESC
                 LIMIT 10`,
                [userId]
            );

            analytics = {
                products: productStats,
                samples: sampleStats,
                orders: {
                    ...orderStats,
                    total_revenue: formatPrice(orderStats.total_revenue || 0)
                },
                top_products: topProducts.map(product => ({
                    ...product,
                    revenue: formatPrice(product.revenue)
                }))
            };

        } else if (role === 'retailer') {
            // Retailer dashboard analytics
            const orderStats = await queryOne(
                `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                    SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
                    SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                    SUM(total_amount) as total_spent
                 FROM orders WHERE retailer_id = ?`,
                [userId]
            );

            // Recent orders
            const recentOrders = await query(
                `SELECT id, order_number, total_amount, status, created_at
                 FROM orders
                 WHERE retailer_id = ?
                 ORDER BY created_at DESC
                 LIMIT 10`,
                [userId]
            );

            // Order items summary
            const itemStats = await queryOne(
                `SELECT 
                    SUM(oi.quantity) as total_items,
                    COUNT(DISTINCT oi.product_id) as unique_products
                 FROM orders o
                 JOIN order_items oi ON o.id = oi.order_id
                 WHERE o.retailer_id = ? AND o.status != 'cancelled'`,
                [userId]
            );

            analytics = {
                orders: {
                    ...orderStats,
                    total_spent: formatPrice(orderStats.total_spent || 0)
                },
                items: itemStats,
                recent_orders: recentOrders.map(order => ({
                    ...order,
                    total_amount: formatPrice(order.total_amount)
                }))
            };
        }

        res.json(apiResponse(true, analytics, 'Dashboard analytics retrieved successfully'));

    } catch (error) {
        logger.error('Get dashboard analytics error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve dashboard analytics'));
    }
};

// Get order analytics
const getOrderAnalytics = async (req, res) => {
    try {
        const { period = '30', group_by = 'day' } = req.query;
        const { role, id: userId } = req.user;

        // Date range filter
        const daysBack = parseInt(period);
        let whereClause = `WHERE o.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL ${daysBack} DAY)`;
        let params = [];

        // Role-based filtering
        if (role === 'retailer') {
            whereClause += ' AND o.retailer_id = ?';
            params.push(userId);
        } else if (role === 'wholesaler') {
            whereClause += ` AND EXISTS (
                SELECT 1 FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = o.id AND p.wholesaler_id = ?
            )`;
            params.push(userId);
        }

        // Time grouping
        let groupByClause = '';
        let selectDate = '';
        
        if (group_by === 'day') {
            selectDate = 'DATE(o.created_at) as period';
            groupByClause = 'GROUP BY DATE(o.created_at)';
        } else if (group_by === 'week') {
            selectDate = 'YEARWEEK(o.created_at) as period';
            groupByClause = 'GROUP BY YEARWEEK(o.created_at)';
        } else if (group_by === 'month') {
            selectDate = 'YEAR(o.created_at), MONTH(o.created_at) as period';
            groupByClause = 'GROUP BY YEAR(o.created_at), MONTH(o.created_at)';
        }

        const analytics = await query(
            `SELECT 
                ${selectDate},
                COUNT(*) as order_count,
                SUM(o.total_amount) as total_revenue,
                AVG(o.total_amount) as avg_order_value,
                COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as completed_orders,
                COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders
             FROM orders o
             ${whereClause}
             ${groupByClause}
             ORDER BY period DESC`,
            params
        );

        const formattedAnalytics = analytics.map(row => ({
            ...row,
            total_revenue: formatPrice(row.total_revenue || 0),
            avg_order_value: formatPrice(row.avg_order_value || 0)
        }));

        res.json(apiResponse(true, formattedAnalytics, 'Order analytics retrieved successfully'));

    } catch (error) {
        logger.error('Get order analytics error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve order analytics'));
    }
};

// Get product analytics
const getProductAnalytics = async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        let analytics = {};

        if (role === 'admin') {
            // Admin product analytics
            const categoryStats = await query(
                `SELECT 
                    p.category,
                    COUNT(*) as product_count,
                    SUM(CASE WHEN p.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                    AVG(p.price) as avg_price,
                    SUM(p.quantity) as total_inventory
                 FROM products p
                 GROUP BY p.category
                 ORDER BY product_count DESC`
            );

            const wholesalerStats = await query(
                `SELECT 
                    u.full_name as wholesaler_name,
                    COUNT(p.id) as product_count,
                    SUM(CASE WHEN p.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                    AVG(p.price) as avg_price
                 FROM users u
                 LEFT JOIN products p ON u.id = p.wholesaler_id
                 WHERE u.role = 'wholesaler'
                 GROUP BY u.id, u.full_name
                 ORDER BY product_count DESC
                 LIMIT 10`
            );

            analytics = {
                by_category: categoryStats.map(cat => ({
                    ...cat,
                    avg_price: formatPrice(cat.avg_price || 0)
                })),
                by_wholesaler: wholesalerStats.map(ws => ({
                    ...ws,
                    avg_price: formatPrice(ws.avg_price || 0)
                }))
            };

        } else if (role === 'wholesaler') {
            // Wholesaler product analytics
            const categoryStats = await query(
                `SELECT 
                    category,
                    COUNT(*) as product_count,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                    AVG(price) as avg_price,
                    SUM(quantity) as total_inventory
                 FROM products
                 WHERE wholesaler_id = ?
                 GROUP BY category
                 ORDER BY product_count DESC`,
                [userId]
            );

            const performanceStats = await query(
                `SELECT 
                    p.name,
                    p.price,
                    p.quantity,
                    COALESCE(SUM(oi.quantity), 0) as total_sold,
                    COALESCE(SUM(oi.subtotal), 0) as total_revenue
                 FROM products p
                 LEFT JOIN order_items oi ON p.id = oi.product_id
                 LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
                 WHERE p.wholesaler_id = ?
                 GROUP BY p.id, p.name, p.price, p.quantity
                 ORDER BY total_sold DESC
                 LIMIT 20`,
                [userId]
            );

            analytics = {
                by_category: categoryStats.map(cat => ({
                    ...cat,
                    avg_price: formatPrice(cat.avg_price || 0)
                })),
                performance: performanceStats.map(prod => ({
                    ...prod,
                    price: formatPrice(prod.price),
                    total_revenue: formatPrice(prod.total_revenue || 0)
                }))
            };
        }

        res.json(apiResponse(true, analytics, 'Product analytics retrieved successfully'));

    } catch (error) {
        logger.error('Get product analytics error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve product analytics'));
    }
};

module.exports = {
    getDashboardAnalytics,
    getOrderAnalytics,
    getProductAnalytics
};