const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const FirestoreThreadRepository = require('../../infrastructure/FirestoreThreadRepository');
const FirestoreChatRepository = require('../../infrastructure/FirestoreChatRepository');

const firestoreThreadRepository = new FirestoreThreadRepository();
const firestoreChatRepository = new FirestoreChatRepository();

// Inisialisasi controller
const chatController = new ChatController(firestoreThreadRepository, firestoreChatRepository);

router.post('/send-message', chatController.save(req, res));

module.exports = router;
