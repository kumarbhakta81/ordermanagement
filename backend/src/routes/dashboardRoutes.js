const express = require('express');
const router = express.Router();
const { mockOrders, mockProducts, mockCustomers } = require('../utils/mockData');

// GET /api/dashboard/overview
router.get('/overview', (req, res) => {
  const totalOrders = mockOrders.length;
  const totalCustomers = mockCustomers.length;
  const totalProducts = mockProducts.length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
  const shippedOrders = mockOrders.filter(o => o.status === 'shipped').length;
  
  res.json({
    data: {
      summary: {
        totalOrders,
        totalCustomers,
        totalProducts,
        totalRevenue,
        pendingOrders,
        shippedOrders
      },
      recentOrders: mockOrders.slice(-5).reverse()
    }
  });
});

// GET /api/dashboard/sales
router.get('/sales', (req, res) => {
  const salesData = mockOrders.map(order => ({
    date: order.orderDate,
    amount: order.totalAmount,
    orderId: order.id
  }));
  
  res.json({ data: salesData });
});

// GET /api/dashboard/inventory
router.get('/inventory', (req, res) => {
  const lowStockProducts = mockProducts.filter(p => p.stock < 30);
  const outOfStockProducts = mockProducts.filter(p => p.stock === 0);
  
  res.json({
    data: {
      lowStockProducts,
      outOfStockProducts,
      totalProducts: mockProducts.length,
      averageStock: mockProducts.reduce((sum, p) => sum + p.stock, 0) / mockProducts.length
    }
  });
});

module.exports = router;