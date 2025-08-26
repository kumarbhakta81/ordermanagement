const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { uploadMultiple, handleUploadErrors, secureUpload } = require('../middleware/upload');
const { 
    validateSample, 
    validateId, 
    validatePagination 
} = require('../middleware/validation');
const {
    getSamples,
    getSample,
    uploadSample,
    updateSample,
    deleteSample,
    updateSampleStatus,
    getPendingSamples
} = require('../controllers/sampleController');

// Protected routes - require authentication
router.get('/', authenticateToken, validatePagination, getSamples);
router.get('/:id', authenticateToken, validateId, getSample);

// Wholesaler routes
router.post('/', 
    authenticateToken, 
    authorize('wholesaler'),
    uploadLimiter,
    uploadMultiple, 
    handleUploadErrors,
    secureUpload,
    validateSample,
    uploadSample
);

router.put('/:id', 
    authenticateToken, 
    authorize('wholesaler'),
    uploadLimiter,
    uploadMultiple,
    handleUploadErrors,
    secureUpload,
    validateId,
    validateSample,
    updateSample
);

router.delete('/:id', 
    authenticateToken, 
    authorize('wholesaler'),
    validateId,
    deleteSample
);

// Admin routes
router.get('/admin/pending', 
    authenticateToken, 
    authorize('admin'), 
    validatePagination,
    getPendingSamples
);

router.put('/:id/status', 
    authenticateToken, 
    authorize('admin'),
    validateId,
    updateSampleStatus
);

module.exports = router;