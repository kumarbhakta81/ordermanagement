const { apiResponse, formatFileSize } = require('../utils/helpers');
const logger = require('../utils/logger');

// Handle file upload
const uploadFiles = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json(apiResponse(false, null, 'No files uploaded'));
        }

        const uploadedFiles = req.files.map(file => ({
            fieldname: file.fieldname,
            originalname: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            size_formatted: formatFileSize(file.size),
            url: `/uploads/${file.filename}`
        }));

        logger.info(`Files uploaded: ${uploadedFiles.length} files by ${req.user?.email || 'anonymous'}`);

        res.json(apiResponse(true, {
            files: uploadedFiles,
            count: uploadedFiles.length
        }, 'Files uploaded successfully'));

    } catch (error) {
        logger.error('Upload files error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to upload files'));
    }
};

// Handle single file upload
const uploadSingleFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json(apiResponse(false, null, 'No file uploaded'));
        }

        const uploadedFile = {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            size_formatted: formatFileSize(req.file.size),
            url: `/uploads/${req.file.filename}`
        };

        logger.info(`File uploaded: ${uploadedFile.originalname} by ${req.user?.email || 'anonymous'}`);

        res.json(apiResponse(true, uploadedFile, 'File uploaded successfully'));

    } catch (error) {
        logger.error('Upload single file error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to upload file'));
    }
};

module.exports = {
    uploadFiles,
    uploadSingleFile
};