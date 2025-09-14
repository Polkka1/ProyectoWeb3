const express = require('express');
const router = express.Router();

const ctrlAuth = require('../controllers/auth');

/* GET login page */
router.get('/login', ctrlAuth.loginGet);

/* POST login */
router.post('/login', ctrlAuth.loginPost);

/* GET register page */
router.get('/register', ctrlAuth.registerGet);

/* POST register */
router.post('/register', ctrlAuth.registerPost);

/* GET logout */
router.get('/logout', ctrlAuth.logout);

module.exports = router;