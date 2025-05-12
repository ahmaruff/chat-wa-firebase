const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os'); 

const ChatController = require('../controllers/ChatController');
const FirestoreThreadRepository = require('../../infrastructure/FirestoreThreadRepository');
const FirestoreChatRepository = require('../../infrastructure/FirestoreChatRepository');

// Configure multer for media file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.resolve(__dirname, '../../../../uploads/whatsapp'); 

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      if (os.platform() !== 'win32') {
        // Only set mode on Unix-like systems (not Windows)
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
      } else {
        // No need to set mode on Windows
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer upload with file size limits
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 16 * 1024 * 1024, // 16MB limit (WhatsApp limit)
  },
  fileFilter: function (req, file, cb) {
    // Validate file types
    const validTypes = {
      'image': ['image/jpeg', 'image/png', 'image/webp'],
      'video': ['video/mp4', 'video/3gpp'],
      'audio': ['audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/amr'],
      'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'sticker': ['image/webp']
    };

    const validMimetypes = Object.values(validTypes).flat();
    const validExtensions = [
      '.jpg', '.jpeg', '.png', '.webp',
      '.mp4', '.3gp',
      '.mp3', '.mpeg', '.ogg', '.amr',
      '.pdf', '.doc', '.docx'
    ];

    const mime = file.mimetype;
    const ext = path.extname(file.originalname).toLowerCase();

    if (validMimetypes.includes(mime) || (mime === 'application/octet-stream' && validExtensions.includes(ext))) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${validExtensions.join(', ')}`), false);
    }
  }
});

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
    app_name: "Webhook Chat Whatsapp",
    description: "webhook chat Whatsapp",
  });
});

/**
 * @swagger
 * /chats/send-message:
 *   post:
 *     summary: Send a WhatsApp message (text or media) and save the chat
 *     description: Sends a WhatsApp message (text or media), creates or updates a conversation thread, and saves the message
 *     tags: [Chats]
 *     consumes:
 *       - multipart/form-data
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wa_business_id
 *               - client_wa_id
 *               - client_name
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
 *               message:
 *                 type: string
 *                 description: Message content (for text messages) or caption (for media messages)
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - wa_business_id
 *               - client_wa_id
 *               - client_name
 *               - message
 *             properties:
 *               wa_business_id:
 *                 type: string
 *                 description: WhatsApp Business Account ID
 *               client_wa_id:
 *                 type: string
 *                 description: Client's WhatsApp ID
 *               client_name:
 *                 type: string
 *                 description: Client's name
 *               message:
 *                 type: string
 *                 description: Caption for the media (optional for media messages)
 *               media_file:
 *                 type: string
 *                 format: binary
 *                 description: Media file to upload (image, video, audio, document, or sticker)
 *               current_handler_user_id:
 *                 type: string
 *                 description: ID of the current handler user
 *               unread:
 *                 type: boolean
 *                 description: Whether the message is unread
 *               reply_to:
 *                 type: string
 *                 description: ID of message being replied to
 *               replied_by:
 *                 type: string
 *                 description: ID of user who replied
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
 *                     media_id:
 *                       type: string
 *                       example: "media123"
 *                     media_type:
 *                       type: string
 *                       example: "image"
 *                     media_path:
 *                       type: string
 *                       example: "/uploads/whatsapp/media-12345.jpg"
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
router.post('/send-message', upload.single('media_file'), (req, res) => chatController.save(req, res));

/**
 * @swagger
 * /chats/send-media:
 *   post:
 *     summary: Send a WhatsApp media message
 *     description: Sends a WhatsApp media message with an optional caption
 *     tags: [Chats]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - wa_business_id
 *               - client_wa_id
 *               - media_file
 *             properties:
 *               wa_business_id:
 *                 type: string
 *                 description: WhatsApp Business Account ID
 *                 example: "1234567890"
 *               client_wa_id:
 *                 type: string
 *                 description: Client's WhatsApp ID
 *                 example: "6281234567890"
 *               media_file:
 *                 type: string
 *                 format: binary
 *                 description: Media file to upload (image, video, audio, document, or sticker)
 *               media_type:
 *                 type: string
 *                 description: Type of media being uploaded (will be auto-detected if not provided)
 *                 enum: [image, video, audio, document, sticker]
 *                 example: "image"
 *               caption:
 *                 type: string


 *                 description: Optional caption for the media
 *                 example: "Check out this image!"
 *     responses:
 *       200:
 *         description: Media message sent successfully
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
 *                   example: "Media message sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     media_id:
 *                       type: string
 *                       example: "media123"
 *                     wamid:
 *                       type: string
 *                       example: "wamid.abcd1234"
 *       400:
 *         description: Bad request, missing media file, or invalid WhatsApp business ID
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
 *                   example: "No media file uploaded"
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
 *                   example: "Failed to send media message to WhatsApp API"
 *                 data:
 *                   type: null
 */
router.post('/send-media', upload.single('media_file'), (req, res) => chatController.sendMedia(req, res));

/**
 * @swagger
 * /chats/media/{mediaId}:
 *   get:
 *     summary: Get WhatsApp media information
 *     description: Retrieves information about a WhatsApp media item, including a proxy URL
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the media item
 *         example: "media123"
 *       - in: query
 *         name: wa_business_id
 *         required: true
 *         schema:
 *           type: string
 *         description: WhatsApp Business Account ID
 *         example: "1234567890"
 *     responses:
 *       200:
 *         description: Media information retrieved successfully
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
 *                   example: "Media info retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: Proxy URL for accessing the media
 *                       example: "https://example.com/chats/proxy-media/media123?wa_business_id=1234567890"
 *                     mime_type:
 *                       type: string
 *                       description: MIME type of the media
 *                       example: "image/jpeg"
 *                     file_size:
 *                       type: integer
 *                       description: Size of the media file in bytes
 *                       example: 102400
 *       400:
 *         description: Missing required parameters or invalid WhatsApp business ID
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
 *                   example: "Missing required parameters: mediaId, wa_business_id"
 *                 data:
 *                   type: null
 *       404:
 *         description: Media URL not found
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
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Media URL not found"
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
 *                   example: "Error retrieving media info"
 *                 data:
 *                   type: null
 */
router.get('/media/:mediaId', (req, res) => chatController.getMediaInfo(req, res));

/**
 * @swagger
 * /chats/proxy-media/{mediaId}:
 *   get:
 *     summary: Stream WhatsApp media content
 *     description: Streams the content of a WhatsApp media item to the client
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the media item
 *         example: "media123"
 *       - in: query
 *         name: wa_business_id
 *         required: true
 *         schema:
 *           type: string
 *         description: WhatsApp Business Account ID
 *         example: "1234567890"
 *     responses:
 *       200:
 *         description: Media content streamed successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Missing required parameters or invalid WhatsApp business ID
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
 *                   example: "Missing required parameters: mediaId, wa_business_id"
 *                 data:
 *                   type: null
 *       404:
 *         description: Media URL not found
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
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Media URL not found"
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
 *                   example: "Error streaming media"
 *                 data:
 *                   type: null
 */
router.get('/proxy-media/:mediaId', (req, res) => chatController.proxyMedia(req, res));


/**
 * @swagger
 * /chats/get-thread:
 *   post:
 *     summary: Get a thread by WhatsApp information
 *     description: Retrieves a thread based on WhatsApp business ID and client WhatsApp ID
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
 *             properties:
 *               wa_business_id:
 *                 type: string
 *                 description: The WhatsApp Business ID
 *                 example: "123456789012345"
 *               client_wa_id:
 *                 type: string
 *                 description: The client's WhatsApp ID (phone number with country code)
 *                 example: "628123456789"
 *     responses:
 *       200:
 *         description: Thread retrieved successfully
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
 *                   example: "get thread success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     thread:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "abc123def456"
 *                         waBusinessId:
 *                           type: string
 *                           example: "123456789012345"
 *                         clientWaId:
 *                           type: string
 *                           example: "628123456789"
 *                         clientName:
 *                           type: string
 *                           example: "John Doe"
 *                         phoneNumberId:
 *                           type: string
 *                           example: "987654321098765"
 *                         displayPhoneNumber:
 *                           type: string
 *                           example: "+628123456789"
 *                         unreadCount:
 *                           type: integer
 *                           example: 5
 *                         status:
 *                           type: integer
 *                           example: 1
 *                           description: "Thread status (0: QUEUE, 1: PROCESSED, 2: COMPLETED)"
 *                         lastMessageMediaType:
 *                           type: string
 *                           example: "image"
 *                           nullable: true
 *                         lastMessage:
 *                           type: string
 *                           example: "Hello, how can I help you?"
 *                         firstResponseDatetime:
 *                           type: integer
 *                           example: 1682341234567
 *                         lastResponseDatetime:
 *                           type: integer
 *                           example: 1682341234567
 *                           nullable: true
 *                         currentHandlerUserId:
 *                           type: string
 *                           example: "user123"
 *                           nullable: true
 *                         internalUserDetail:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               userId:
 *                                 type: string
 *                                 example: "user123"
 *                               displayName:
 *                                 type: string
 *                                 example: "Agent Smith"
 *                         createdAt:
 *                           type: integer
 *                           example: 1682341230000
 *                         updatedAt:
 *                           type: integer
 *                           example: 1682341234567
 *       500:
 *         description: Server error
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
 *                   example: "Internal server error"
 *                 data:
 *                   type: null
 *                   nullable: true
 */
router.post('/get-thread', (req, res) => chatController.getThread(req, res));

module.exports = router;