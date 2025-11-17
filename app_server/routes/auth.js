const express = require('express');
const router = express.Router();

const ctrlAuth = require('../controllers/auth');
const { ensureAuth, ensureGuest } = require('../middleware/auth');

/* GET login page */
router.get('/login', ensureGuest, ctrlAuth.loginGet);

/* POST login */
router.post('/login', ctrlAuth.loginPost);

/* GET register page */
router.get('/register', ensureGuest, ctrlAuth.registerGet);

/* POST register */
router.post('/register', ctrlAuth.registerPost);

/* GET logout */
router.get('/logout', ensureAuth, ctrlAuth.logout);

module.exports = router;