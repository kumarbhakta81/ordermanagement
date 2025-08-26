const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { uploadMultiple, uploadSingle, handleUploadErrors, secureUpload } = require('../middleware/upload');
const { validateFileUpload } = require('../middleware/validation');
const {
    uploadFiles,
    uploadSingleFile
} = require('../controllers/uploadController');

// Multiple file upload
router.post('/multiple', 
    authenticateToken,
    uploadLimiter,
    uploadMultiple,
    handleUploadErrors,
    secureUpload,
    validateFileUpload,
    uploadFiles
);

// Single file upload
router.post('/single', 
    authenticateToken,
    uploadLimiter,
    uploadSingle,
    handleUploadErrors,
    secureUpload,
    uploadSingleFile
);

module.exports = router;