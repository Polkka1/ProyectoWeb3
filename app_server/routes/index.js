const express = require('express');
const router = express.Router();

const ctrlMain = require('../controllers/index'); //import the controller

/* GET home page. */
router.get('/', ctrlMain.index);

module.exports = router;
