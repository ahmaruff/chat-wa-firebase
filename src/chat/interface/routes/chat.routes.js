const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const FirestoreThreadRepository = require('../../infrastructure/FirestoreThreadRepository');
const FirestoreChatRepository = require('../../infrastructure/FirestoreChatRepository');

const firestoreThreadRepository = new FirestoreThreadRepository();
const firestoreChatRepository = new FirestoreChatRepository();

// Inisialisasi controller
const chatController = new ChatController(firestoreThreadRepository, firestoreChatRepository);

/**
 * @swagger
 * /chats/send-message:
 *   post:
 *     summary: Save a new chat message
 *     description: Creates or updates a WhatsApp conversation thread, then saves a new chat message under that thread.
 *     tags:
 *       - Chats
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               waBusinessId:
 *                 type: string
 *                 description: WhatsApp Business Account ID
 *               recipientNumber:
 *                 type: string
 *                 description: Target contact's WhatsApp number in international format
 *               messageText:
 *                 type: string
 *                 description: The content of the message to send
 *               contactName:
 *                 type: string
 *                 description: Display name for the contact
 *             required:
 *               - waBusinessId
 *               - recipientNumber
 *               - messageText
 *               - contactName
 *     responses:
 *       200:
 *         description: Chat saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: chat saved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     chat_id:
 *                       type: string
 *                       example: abc123
 *       400:
 *         description: Missing or invalid request parameters
 *       500:
 *         description: Internal server error
 */
router.post('/send-message', (req, res) => chatController.save(req, res));

router.get('/', (req, res) => {
  res.json({
      app_name: "Webhook Chat",
      description: "webhook chat",
  });
});


module.exports = router;
