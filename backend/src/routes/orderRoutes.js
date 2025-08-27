const express = require('express');
const router = express.Router();
const { mockOrders, generateId } = require('../utils/mockData');

// GET /api/orders - List/search/filter orders
router.get('/', (req, res) => {
  try {
    const { status, customerId, limit = 10, offset = 0 } = req.query;
    
    let filteredOrders = [...mockOrders];
    
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    if (customerId) {
      filteredOrders = filteredOrders.filter(order => order.customerId === customerId);
    }
    
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    res.json({
      data: paginatedOrders,
      pagination: {
        total: filteredOrders.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: endIndex < filteredOrders.length
      }
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch orders'
      }
    });
  }
});

// GET /api/orders/:id - Get specific order details
router.get('/:id', (req, res) => {
  try {
    const order = mockOrders.find(o => o.id === req.params.id);
    
    if (!order) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }
    
    res.json({ data: order });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch order'
      }
    });
  }
});

// POST /api/orders - Create a new order
router.post('/', (req, res) => {
  try {
    const { customerId, items } = req.body;
    
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'customerId and items array are required'
        }
      });
    }
    
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newOrder = {
      id: generateId('ord'),
      customerId,
      orderDate: new Date().toISOString(),
      status: 'pending',
      totalAmount,
      items: items.map(item => ({
        id: generateId('item'),
        ...item
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockOrders.push(newOrder);
    
    res.status(201).json({ data: newOrder });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create order'
      }
    });
  }
});

// PUT /api/orders/:id - Update order
router.put('/:id', (req, res) => {
  try {
    const orderIndex = mockOrders.findIndex(o => o.id === req.params.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }
    
    const updatedOrder = {
      ...mockOrders[orderIndex],
      ...req.body,
      id: req.params.id, // Prevent ID change
      updatedAt: new Date().toISOString()
    };
    
    mockOrders[orderIndex] = updatedOrder;
    
    res.json({ data: updatedOrder });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update order'
      }
    });
  }
});

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const orderIndex = mockOrders.findIndex(o => o.id === req.params.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }
    
    if (!status) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Status is required'
        }
      });
    }
    
    mockOrders[orderIndex].status = status;
    mockOrders[orderIndex].updatedAt = new Date().toISOString();
    
    res.json({ data: mockOrders[orderIndex] });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update order status'
      }
    });
  }
});

// DELETE /api/orders/:id - Delete order
router.delete('/:id', (req, res) => {
  try {
    const orderIndex = mockOrders.findIndex(o => o.id === req.params.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }
    
    mockOrders.splice(orderIndex, 1);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete order'
      }
    });
  }
});

module.exports = router;