const rateLimit = require('express-rate-limit');
const { apiResponse } = require('../utils/helpers');

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: apiResponse(false, null, 'Too many authentication attempts, please try again later'),
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

// Rate limiter for upload endpoints
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    message: apiResponse(false, null, 'Too many file uploads, please try again later'),
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiter for order endpoints
const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 orders per hour
    message: apiResponse(false, null, 'Too many order requests, please try again later'),
    standardHeaders: true,
    legacyHeaders: false
});

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: apiResponse(false, null, 'Too many requests, please try again later'),
    standardHeaders: true,
    legacyHeaders: false
});

// Strict rate limiter for sensitive operations
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    message: apiResponse(false, null, 'Too many sensitive operation attempts, please try again later'),
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    authLimiter,
    uploadLimiter,
    orderLimiter,
    apiLimiter,
    strictLimiter
};