const express = require('express');
const router = express.Router();

const ctrlItems = require('../controllers/items');

/* GET new item form */
router.get('/new', ctrlItems.newItemGet);

/* POST new item */
router.post('/new', ctrlItems.newItemPost);

/* GET item detail page */
router.get('/:id', ctrlItems.itemDetail);

module.exports = router;