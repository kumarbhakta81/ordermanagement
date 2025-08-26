const { query, queryOne } = require('../models/database');
const { apiResponse, getPaginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');

// Get samples based on user role
const getSamples = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, category } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE 1=1';
        let params = [];

        // Role-based filtering
        if (req.user.role === 'wholesaler') {
            whereClause += ' AND s.wholesaler_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'retailer') {
            whereClause += ' AND s.status = "approved"';
        }
        // Admin can see all samples

        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            whereClause += ' AND s.status = ?';
            params.push(status);
        }

        if (category) {
            whereClause += ' AND s.category = ?';
            params.push(category);
        }

        // Get total count
        const countResult = await queryOne(
            `SELECT COUNT(*) as total FROM samples s ${whereClause}`,
            params
        );

        // Get samples with wholesaler info
        const samples = await query(
            `SELECT s.*, u.username as wholesaler_name, u.full_name as wholesaler_full_name,
                    u.email as wholesaler_email, u.phone as wholesaler_phone
             FROM samples s 
             JOIN users u ON s.wholesaler_id = u.id 
             ${whereClause} 
             ORDER BY s.created_at DESC 
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // Parse images JSON
        const formattedSamples = samples.map(sample => ({
            ...sample,
            images: sample.images ? JSON.parse(sample.images) : []
        }));

        const pagination = getPaginationMeta(parseInt(page), parseInt(limit), countResult.total);

        res.json(apiResponse(true, {
            samples: formattedSamples,
            pagination
        }, 'Samples retrieved successfully'));

    } catch (error) {
        logger.error('Get samples error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve samples'));
    }
};

// Get single sample
const getSample = async (req, res) => {
    try {
        const { id } = req.params;

        const sample = await queryOne(
            `SELECT s.*, u.username as wholesaler_name, u.full_name as wholesaler_full_name,
                    u.email as wholesaler_email, u.phone as wholesaler_phone
             FROM samples s 
             JOIN users u ON s.wholesaler_id = u.id 
             WHERE s.id = ?`,
            [id]
        );

        if (!sample) {
            return res.status(404).json(apiResponse(false, null, 'Sample not found'));
        }

        // Check permissions
        if (sample.status !== 'approved') {
            if (req.user.role !== 'admin' && req.user.id !== sample.wholesaler_id) {
                return res.status(404).json(apiResponse(false, null, 'Sample not found'));
            }
        }

        const formattedSample = {
            ...sample,
            images: sample.images ? JSON.parse(sample.images) : []
        };

        res.json(apiResponse(true, formattedSample, 'Sample retrieved successfully'));

    } catch (error) {
        logger.error('Get sample error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve sample'));
    }
};

// Upload new sample (Wholesaler only)
const uploadSample = async (req, res) => {
    try {
        const { product_name, description, category } = req.body;
        const wholesaler_id = req.user.id;
        const images = req.files ? req.files.map(file => file.filename) : [];

        if (images.length === 0) {
            return res.status(400).json(apiResponse(false, null, 'At least one image is required for samples'));
        }

        const result = await query(
            `INSERT INTO samples (wholesaler_id, product_name, description, category, images, status) 
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [wholesaler_id, product_name, description, category, JSON.stringify(images)]
        );

        // Create notification for admin
        await query(
            `INSERT INTO notifications (user_id, type, title, message, related_id, related_type) 
             SELECT id, 'sample_upload', 'New Sample Submitted', 
                    CONCAT('A new sample "', ?, '" has been submitted for approval by ', ?), 
                    ?, 'sample'
             FROM users WHERE role = 'admin'`,
            [product_name, req.user.full_name, result.insertId]
        );

        const sample = await queryOne(
            'SELECT * FROM samples WHERE id = ?',
            [result.insertId]
        );

        const formattedSample = {
            ...sample,
            images: JSON.parse(sample.images || '[]')
        };

        logger.info(`New sample uploaded: ${product_name} by ${req.user.email}`);

        res.status(201).json(apiResponse(true, formattedSample, 'Sample uploaded successfully'));

    } catch (error) {
        logger.error('Upload sample error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to upload sample'));
    }
};

// Update sample (Wholesaler - own samples only)
const updateSample = async (req, res) => {
    try {
        const { id } = req.params;
        const { product_name, description, category } = req.body;
        const wholesaler_id = req.user.id;

        // Check if sample exists and belongs to user
        const existingSample = await queryOne(
            'SELECT * FROM samples WHERE id = ? AND wholesaler_id = ?',
            [id, wholesaler_id]
        );

        if (!existingSample) {
            return res.status(404).json(apiResponse(false, null, 'Sample not found'));
        }

        // If sample was approved, set back to pending for re-approval
        const newStatus = existingSample.status === 'approved' ? 'pending' : existingSample.status;

        let updateImages = JSON.parse(existingSample.images || '[]');
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.filename);
            updateImages = [...updateImages, ...newImages];
        }

        await query(
            `UPDATE samples 
             SET product_name = ?, description = ?, category = ?, images = ?, 
                 status = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [product_name, description, category, JSON.stringify(updateImages), newStatus, id]
        );

        // If status changed to pending, notify admin
        if (newStatus === 'pending' && existingSample.status !== 'pending') {
            await query(
                `INSERT INTO notifications (user_id, type, title, message, related_id, related_type) 
                 SELECT id, 'sample_update', 'Sample Updated - Needs Re-approval', 
                        CONCAT('Sample "', ?, '" has been updated and needs re-approval'), 
                        ?, 'sample'
                 FROM users WHERE role = 'admin'`,
                [product_name, id]
            );
        }

        const sample = await queryOne('SELECT * FROM samples WHERE id = ?', [id]);
        const formattedSample = {
            ...sample,
            images: JSON.parse(sample.images || '[]')
        };

        logger.info(`Sample updated: ${product_name} by ${req.user.email}`);

        res.json(apiResponse(true, formattedSample, 'Sample updated successfully'));

    } catch (error) {
        logger.error('Update sample error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to update sample'));
    }
};

// Delete sample (Wholesaler - own samples only)
const deleteSample = async (req, res) => {
    try {
        const { id } = req.params;
        const wholesaler_id = req.user.id;

        const result = await query(
            'DELETE FROM samples WHERE id = ? AND wholesaler_id = ?',
            [id, wholesaler_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json(apiResponse(false, null, 'Sample not found'));
        }

        logger.info(`Sample deleted: ID ${id} by ${req.user.email}`);

        res.json(apiResponse(true, null, 'Sample deleted successfully'));

    } catch (error) {
        logger.error('Delete sample error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to delete sample'));
    }
};

// Approve/Reject sample (Admin only)
const updateSampleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json(apiResponse(false, null, 'Invalid status'));
        }

        const sample = await queryOne('SELECT * FROM samples WHERE id = ?', [id]);
        if (!sample) {
            return res.status(404).json(apiResponse(false, null, 'Sample not found'));
        }

        await query(
            'UPDATE samples SET status = ?, rejection_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, rejection_reason || null, id]
        );

        // Notify wholesaler
        const notificationTitle = status === 'approved' ? 'Sample Approved' : 'Sample Rejected';
        const notificationMessage = status === 'approved' 
            ? `Your sample "${sample.product_name}" has been approved`
            : `Your sample "${sample.product_name}" has been rejected. Reason: ${rejection_reason || 'No reason provided'}`;

        await query(
            `INSERT INTO notifications (user_id, type, title, message, related_id, related_type) 
             VALUES (?, ?, ?, ?, ?, 'sample')`,
            [sample.wholesaler_id, `sample_${status}`, notificationTitle, notificationMessage, id]
        );

        const updatedSample = await queryOne(
            `SELECT s.*, u.username as wholesaler_name 
             FROM samples s 
             JOIN users u ON s.wholesaler_id = u.id 
             WHERE s.id = ?`,
            [id]
        );

        const formattedSample = {
            ...updatedSample,
            images: JSON.parse(updatedSample.images || '[]')
        };

        logger.info(`Sample ${status}: ${sample.product_name} by admin ${req.user.email}`);

        res.json(apiResponse(true, formattedSample, `Sample ${status} successfully`));

    } catch (error) {
        logger.error('Update sample status error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to update sample status'));
    }
};

// Get pending samples (Admin only)
const getPendingSamples = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const countResult = await queryOne(
            'SELECT COUNT(*) as total FROM samples WHERE status = "pending"'
        );

        const samples = await query(
            `SELECT s.*, u.username as wholesaler_name, u.full_name as wholesaler_full_name,
                    u.email as wholesaler_email, u.phone as wholesaler_phone
             FROM samples s 
             JOIN users u ON s.wholesaler_id = u.id 
             WHERE s.status = "pending" 
             ORDER BY s.created_at ASC 
             LIMIT ? OFFSET ?`,
            [parseInt(limit), offset]
        );

        const formattedSamples = samples.map(sample => ({
            ...sample,
            images: JSON.parse(sample.images || '[]')
        }));

        const pagination = getPaginationMeta(parseInt(page), parseInt(limit), countResult.total);

        res.json(apiResponse(true, {
            samples: formattedSamples,
            pagination
        }, 'Pending samples retrieved successfully'));

    } catch (error) {
        logger.error('Get pending samples error:', error);
        res.status(500).json(apiResponse(false, null, 'Failed to retrieve pending samples'));
    }
};

module.exports = {
    getSamples,
    getSample,
    uploadSample,
    updateSample,
    deleteSample,
    updateSampleStatus,
    getPendingSamples
};