const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin');

// Admin dashboard
router.get('/', adminCtrl.adminDashboard);

// Delete item
router.post('/items/:itemId/delete', adminCtrl.adminDeleteItem);

// Toggle item status
router.post('/items/:itemId/status', adminCtrl.adminToggleItemStatus);

module.exports = router;
