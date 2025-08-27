const express = require('express');
const router = express.Router();
const { mockUsers, generateId } = require('../utils/mockData');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Email and password required' } });
  }
  
  // Mock authentication - in real app, check hashed password
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
  }
  
  // Mock JWT token
  const token = `mock_jwt_token_${Date.now()}`;
  
  res.json({
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { email, password, name, role = 'customer' } = req.body;
  
  const newUser = {
    id: generateId('user'),
    email,
    password: `hashed_${password}`, // Mock hashing
    name,
    role,
    createdAt: new Date().toISOString()
  };
  
  mockUsers.push(newUser);
  
  res.status(201).json({
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    }
  });
});

// GET /api/auth/profile
router.get('/profile', (req, res) => {
  // Mock getting user from token
  res.json({
    data: {
      id: 'user_001',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin'
    }
  });
});

module.exports = router;