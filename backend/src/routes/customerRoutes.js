const express = require('express');
const router = express.Router();
const { mockCustomers, generateId } = require('../utils/mockData');

// GET /api/customers
router.get('/', (req, res) => {
  res.json({ data: mockCustomers });
});

// GET /api/customers/:id
router.get('/:id', (req, res) => {
  const customer = mockCustomers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer not found' } });
  }
  res.json({ data: customer });
});

// POST /api/customers
router.post('/', (req, res) => {
  const { name, email, phone, address } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Name and email required' } });
  }
  
  const newCustomer = {
    id: generateId('cust'),
    name,
    email,
    phone: phone || '',
    address: address || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockCustomers.push(newCustomer);
  res.status(201).json({ data: newCustomer });
});

module.exports = router;