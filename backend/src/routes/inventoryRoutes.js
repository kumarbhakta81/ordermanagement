const express = require('express');
const router = express.Router();
const { mockProducts } = require('../utils/mockData');

// GET /api/inventory
router.get('/', (req, res) => {
  const inventory = mockProducts.map(product => ({
    productId: product.id,
    productName: product.name,
    quantityAvailable: product.stock,
    sku: product.sku,
    lastUpdated: product.updatedAt
  }));
  
  res.json({ data: inventory });
});

// GET /api/inventory/:productId
router.get('/:productId', (req, res) => {
  const product = mockProducts.find(p => p.id === req.params.productId);
  
  if (!product) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
  }
  
  res.json({
    data: {
      productId: product.id,
      productName: product.name,
      quantityAvailable: product.stock,
      sku: product.sku,
      lastUpdated: product.updatedAt
    }
  });
});

module.exports = router;