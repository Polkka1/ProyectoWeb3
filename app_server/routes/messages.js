const express = require('express');
const router = express.Router();

const ctrlMessages = require('../controllers/messages');
const { ensureAuth } = require('../middleware/auth');

// GET new message form (with optional pre-filled sellerId and itemId)
router.get('/new', ensureAuth, ctrlMessages.newMessageGet);

// POST send new message
router.post('/new', ensureAuth, ctrlMessages.newMessagePost);

// GET inbox/messages list
router.get('/', ensureAuth, ctrlMessages.messagesList);

// GET conversation detail (all messages in a thread)
router.get('/conversation/:conversationId', ensureAuth, ctrlMessages.conversationDetail);

module.exports = router;
