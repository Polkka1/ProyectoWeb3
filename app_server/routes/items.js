const express = require('express');
const router = express.Router();

const ctrlItems = require('../controllers/items');

/* GET new item form */
router.get('/new', ctrlItems.newItemGet);

/* POST new item */
router.post('/new', ctrlItems.newItemPost);

/* GET edit item form */
router.get('/edit/:id', ctrlItems.editItemGet);

/* POST edit item */
router.post('/edit/:id', ctrlItems.editItemPost);

/* GET item detail page */
router.get('/:id', ctrlItems.itemDetail);

module.exports = router;
