const express = require('express');
const router = express.Router();

const ctrlUsers = require('../controllers/users'); //import the controller

/* GET users page. */
router.get('/', ctrlUsers.users);

module.exports = router;