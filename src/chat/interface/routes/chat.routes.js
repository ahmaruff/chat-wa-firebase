const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const FirestoreThreadRepository = require('../../infrastructure/FirestoreThreadRepository');
const FirestoreChatRepository = require('../../infrastructure/FirestoreChatRepository');

const firestoreThreadRepository = new FirestoreThreadRepository();
const firestoreChatRepository = new FirestoreChatRepository();

// Initialize controller
const chatController = new ChatController(firestoreThreadRepository, firestoreChatRepository);

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Chat and WhatsApp message management
 */

/**
 * @swagger
 * /chats:
 *   get:
 *     summary: Get API information
 *     tags: [Chats]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 app_name:
 *                   type: string
 *                   example: "Webhook Chat"
 *                 description:
 *                   type: string
 *                   example: "webhook chat"
 */
router.get('/', (req, res) => {
  res.json({
    app_name: "Webhook Chat",
    description: "webhook chat",
  });
});

/**
 * @swagger
 * /chats/send-message:
 *   post:
 *     summary: Send a WhatsApp message and save the chat
 *     description: Sends a WhatsApp message, creates or updates a conversation thread, and saves the message
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wa_business_id
 *               - client_wa_id
 *               - message
 *             properties:
 *               wa_business_id:
 *                 type: string
 *                 description: WhatsApp Business Account ID
 *                 example: "1234567890"
 *               client_wa_id:
 *                 type: string
 *                 description: Client's WhatsApp ID
 *                 example: "6281234567890"
 *               client_name:
 *                 type: string
 *                 description: Client's name
 *                 example: "John Doe"
 *               client_phone_number_id:
 *                 type: string
 *                 description: Client's phone number ID
 *                 example: "12345"
 *               client_display_phone_number:
 *                 type: string
 *                 description: Client's display phone number
 *                 example: "+6281234567890"
 *               unread_count:
 *                 type: integer
 *                 description: Number of unread messages
 *                 example: 1
 *               thread_status:
 *                 type: string
 *                 description: Status of the thread
 *                 example: "OPEN"
 *               first_response_datetime:
 *                 type: integer
 *                 description: Timestamp of first response
 *                 example: 1620000000000
 *               last_response_datetime:
 *                 type: integer
 *                 description: Timestamp of last response
 *                 example: 1620000000000
 *               current_handler_user_id:
 *                 type: string
 *                 description: ID of the current handler user
 *                 example: "user123"
 *               internal_user_detail:
 *                 type: array
 *                 description: Details of internal users involved
 *                 items:
 *                   type: object
 *                   properties:
 *                     thread_id:
 *                       type: string
 *                       description: Thread ID
 *                       example: "thread456"
 *                     crm_user_id:
 *                       type: string
 *                       description: CRM user ID
 *                       example: "crm123"
 *                     name:
 *                       type: string
 *                       description: User name
 *                       example: "Jane Smith"
 *                     img_profile_url:
 *                       type: string
 *                       description: Profile image URL
 *                       example: "https://example.com/profiles/image.jpg"
 *                     first_response_datetime:
 *                       type: integer
 *                       description: Timestamp of first response
 *                       example: 1620000000000
 *                     last_response_datetime:
 *                       type: integer
 *                       description: Timestamp of last response
 *                       example: 1620100000000
 *               thread_created_at:
 *                 type: integer
 *                 description: Thread creation timestamp
 *                 example: 1620000000000
 *               thread_updated_at:
 *                 type: integer
 *                 description: Thread update timestamp
 *                 example: 1620000000000
 *               wamid:
 *                 type: string
 *                 description: WhatsApp message ID
 *                 example: "wamid.abcd1234"
 *               media_id:
 *                 type: string
 *                 description: ID of attached media (if any)
 *                 example: "media123"
 *               media_type:
 *                 type: string
 *                 description: Type of attached media
 *                 example: "image"
 *               media_path_name:
 *                 type: string
 *                 description: Path to the media file
 *                 example: "/path/to/media.jpg"
 *               message:
 *                 type: string
 *                 description: Message content
 *                 example: "Hello, this is a test message"
 *               unread:
 *                 type: boolean
 *                 description: Whether the message is unread
 *                 example: true
 *               reply_to:
 *                 type: string
 *                 description: ID of message being replied to
 *                 example: "chat123"
 *               replied_by:
 *                 type: string
 *                 description: ID of user who replied
 *                 example: "user456"
 *               chat_created_at:
 *                 type: integer
 *                 description: Chat creation timestamp
 *                 example: 1620000000000
 *               chat_updated_at:
 *                 type: integer
 *                 description: Chat update timestamp
 *                 example: 1620000000000
 *     responses:
 *       200:
 *         description: Message sent and chat saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Chat saved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     chat_id:
 *                       type: string
 *                       example: "chat123"
 *                     wamid:
 *                       type: string
 *                       example: "wamid.abcd1234"
 *                     thread_id:
 *                       type: string
 *                       example: "thread456"
 *                     is_new_thread:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request or invalid WhatsApp business ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "FAIL"
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Unknown waBusinessId: 1234567890 — ignoring message"
 *                 data:
 *                   type: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Error message"
 *                 data:
 *                   type: null
 */
router.post('/send-message', (req, res) => chatController.save(req, res));

module.exports = router;