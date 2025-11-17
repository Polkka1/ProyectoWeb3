const express = require('express');
const router = express.Router();

const ctrlItems = require('../controllers/items');
const { ensureAuth } = require('../middleware/auth');

/* GET items list */
router.get('/', ctrlItems.itemsListPage);

/* GET new item form */
router.get('/new', ensureAuth, ctrlItems.newItemGet);

/* POST new item */
router.post('/new', ensureAuth, ctrlItems.newItemPost);

/* GET edit item form */
router.get('/edit/:id', ensureAuth, ctrlItems.editItemGet);

/* POST edit item */
router.post('/edit/:id', ensureAuth, ctrlItems.editItemPost);

/* GET item publish success confirmation */
router.get('/success', (req, res) => {
	res.render('items/success', { title: 'Item Publicado - CampuSwap' });
});

/* GET item detail page */
router.get('/:id', ctrlItems.itemDetail);

module.exports = router;
