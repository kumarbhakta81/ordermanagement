const multer = require('multer');
const path = require('path');
const { generateSecureFilename, isAllowedFileType } = require('../utils/helpers');

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const secureFilename = generateSecureFilename(file.originalname);
        cb(null, secureFilename);
    }
});

// File filter for security
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png', 
        'image/gif',
        'image/webp'
    ];

    if (isAllowedFileType(file.mimetype, allowedTypes)) {
        cb(null, true);
    } else {
        const error = new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, and WebP are allowed.`);
        error.code = 'INVALID_FILE_TYPE';
        cb(error, false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5 // Maximum 5 files per request
    }
});

// Handle multer errors
const handleUploadErrors = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        let message = 'File upload error';
        
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File too large. Maximum size is 10MB.';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files. Maximum 5 files allowed.';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected file field.';
                break;
            default:
                message = error.message;
        }
        
        return res.status(400).json({
            success: false,
            message: message
        });
    }
    
    if (error && error.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
};

// Upload middleware for multiple files
const uploadMultiple = upload.array('images', 5);

// Upload middleware for single file
const uploadSingle = upload.single('image');

// Secure upload middleware that validates file paths
const secureUpload = (req, res, next) => {
    // Prevent path traversal attacks
    if (req.files) {
        req.files.forEach(file => {
            if (file.filename.includes('..') || file.filename.includes('/') || file.filename.includes('\\')) {
                const error = new Error('Invalid filename detected');
                error.code = 'INVALID_FILENAME';
                throw error;
            }
        });
    }
    
    if (req.file && (req.file.filename.includes('..') || req.file.filename.includes('/') || req.file.filename.includes('\\'))) {
        const error = new Error('Invalid filename detected');
        error.code = 'INVALID_FILENAME';
        throw error;
    }
    
    next();
};

module.exports = {
    upload,
    uploadMultiple,
    uploadSingle,
    handleUploadErrors,
    secureUpload
};