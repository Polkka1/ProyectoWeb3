const express = require('express');
const router = express.Router();

const ctrlDashboard = require('../controllers/dashboard');

/* GET my items dashboard */
router.get('/items', ctrlDashboard.myItems);

/* GET my favorites */
router.get('/favorites', ctrlDashboard.myFavorites);

/* POST delete item */
router.post('/items/:id/delete', ctrlDashboard.deleteItem);

/* POST toggle item status */
router.post('/items/:id/status', ctrlDashboard.toggleItemStatus);

module.exports = router;