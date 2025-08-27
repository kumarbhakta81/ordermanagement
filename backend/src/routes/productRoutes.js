const express = require('express');
const router = express.Router();
const { mockProducts, generateId } = require('../utils/mockData');

// GET /api/products - List/search products
router.get('/', (req, res) => {
  try {
    const { category, search, limit = 10, offset = 0 } = req.query;
    
    let filteredProducts = [...mockProducts];
    
    if (category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }
    
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    res.json({
      data: paginatedProducts,
      pagination: {
        total: filteredProducts.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: endIndex < filteredProducts.length
      }
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch products'
      }
    });
  }
});

// GET /api/products/:id - Get product details
router.get('/:id', (req, res) => {
  try {
    const product = mockProducts.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }
    
    res.json({ data: product });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch product'
      }
    });
  }
});

// POST /api/products - Add a new product
router.post('/', (req, res) => {
  try {
    const { name, description, price, stock, category, sku } = req.body;
    
    if (!name || !price || stock === undefined) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'name, price, and stock are required'
        }
      });
    }
    
    const newProduct = {
      id: generateId('prod'),
      name,
      description: description || '',
      price: parseFloat(price),
      stock: parseInt(stock),
      category: category || 'General',
      sku: sku || generateId('SKU'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockProducts.push(newProduct);
    
    res.status(201).json({ data: newProduct });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create product'
      }
    });
  }
});

// PATCH /api/products/:id/stock - Update product stock
router.patch('/:id/stock', (req, res) => {
  try {
    const { stock } = req.body;
    const productIndex = mockProducts.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }
    
    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Valid stock quantity is required'
        }
      });
    }
    
    mockProducts[productIndex].stock = parseInt(stock);
    mockProducts[productIndex].updatedAt = new Date().toISOString();
    
    res.json({ data: mockProducts[productIndex] });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update product stock'
      }
    });
  }
});

module.exports = router;