const express = require('express');
const router = express.Router();

const ctrlDashboard = require('../controllers/dashboard');
const { ensureAuth } = require('../middleware/auth');

/* GET my items dashboard */
router.get('/items', ensureAuth, ctrlDashboard.myItems);

/* GET my favorites */
router.get('/favorites', ensureAuth, ctrlDashboard.myFavorites);

/* POST delete item */
router.post('/items/:id/delete', ensureAuth, ctrlDashboard.deleteItem);

/* POST toggle item status */
router.post('/items/:id/status', ensureAuth, ctrlDashboard.toggleItemStatus);

/* POST remove from favorites */
router.post('/favorites/:watchlistId/remove', ensureAuth, ctrlDashboard.removeFavorite);

module.exports = router;