const express = require('express');
const router = express.Router();

// Debug editor page
router.get('/', (req, res) => {
  res.render('debug-editor', { title: 'Debug Editor' });
});

module.exports = router;
