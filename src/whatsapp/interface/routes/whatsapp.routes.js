const express = require('express');
const router = express.Router();

const WhatsappController = require('../controllers/WhatsappController');

const whatsappController = new WhatsappController();

/**
 * @swagger
 * tags:
 *   name: WhatsApp
 *   description: WhatsApp integration API endpoints
 */

/**
 * @swagger
 * /whatsapp/webhook:
 *   get:
 *     summary: Verify WhatsApp webhook
 *     description: Endpoint to verify the WhatsApp Business API webhook
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: query
 *         name: hub.mode
 *         schema:
 *           type: string
 *         required: true
 *         description: Verification mode (always 'subscribe')
 *       - in: query
 *         name: hub.verify_token
 *         schema:
 *           type: string
 *         required: true
 *         description: Verification token that must match the configured token
 *       - in: query
 *         name: hub.challenge
 *         schema:
 *           type: string
 *         required: true
 *         description: Challenge string to be returned if verification is successful
 *     responses:
 *       200:
 *         description: Webhook successfully verified
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: Challenge string
 *       403:
 *         description: Webhook verification failed
 */
router.get('/webhook', (req, res) => whatsappController.webhookGet(req, res));

/**
 * @swagger
 * /whatsapp/webhook:
 *   post:
 *     summary: Receive WhatsApp webhook notifications
 *     description: Endpoint to receive messages and notifications from the WhatsApp Business API
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               object:
 *                 type: string
 *                 example: whatsapp_business_account
 *                 description: Object type (always 'whatsapp_business_account')
 *               entry:
 *                 type: array
 *                 description: Array of changes data
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: WhatsApp Business Account ID
 *                     changes:
 *                       type: array
 *                       description: Array of changes
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: object
 *                             properties:
 *                               messaging_product:
 *                                 type: string
 *                                 example: whatsapp
 *                               metadata:
 *                                 type: object
 *                                 properties:
 *                                   display_phone_number:
 *                                     type: string
 *                                   phone_number_id:
 *                                     type: string
 *                               contacts:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     profile:
 *                                       type: object
 *                                       properties:
 *                                         name:
 *                                           type: string
 *                                     wa_id:
 *                                       type: string
 *                               messages:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     from:
 *                                       type: string
 *                                     id:
 *                                       type: string
 *                                     timestamp:
 *                                       type: string
 *                                     text:
 *                                       type: object
 *                                       properties:
 *                                         body:
 *                                           type: string
 *                                     type:
 *                                       type: string
 *                           field:
 *                             type: string
 *                             example: messages
 *     responses:
 *       200:
 *         description: Webhook successfully processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Webhook processing status
 *                 message:
 *                   type: string
 *                   description: Status description
 *                 data:
 *                   type: object
 *                   properties:
 *                     messagesProcessed:
 *                       type: integer
 *                       description: Number of messages processed
 *                     results:
 *                       type: array
 *                       description: Results of message processing
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             description: Message type (status or message)
 *                           from:
 *                             type: string
 *                             description: Sender of the message
 *                           status:
 *                             type: string
 *                             description: Message status (only for type 'status')
 *                           messageBody:
 *                             type: string
 *                             description: Message body content (only for type 'message')
 *                           chatCreated:
 *                             type: boolean
 *                             description: Indicates if a new chat was created (only for type 'message')
 *                           markedAsRead:
 *                             type: boolean
 *                             description: Indicates if the message was marked as read (only for type 'status' with 'read' status)
 *                           ignored:
 *                             type: boolean
 *                             description: Indicates if the message status was ignored
 *                           error:
 *                             type: string
 *                             description: Error message (if any)
 */
router.post('/webhook', (req, res) => whatsappController.webhookPost(req, res));

/**
 * @swagger
 * /whatsapp/mark-as-read:
 *   post:
 *     summary: Mark a WhatsApp message as read
 *     description: Sets a message as read based on the provided wa_business_id and wamid.
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wa_business_id
 *               - wamid
 *             properties:
 *               wa_business_id:
 *                 type: string
 *                 example: "1234567890"
 *               wamid:
 *                 type: string
 *                 example: "wamid.HBgLMjAyMzEyMzEyMzEyFQIAERgSNzFEM0I2MkYyRjA1RkJFMzkA"
 *     responses:
 *       200:
 *         description: Success mark as read message
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
 *                   example: Success mark as read message
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: object
 *                       nullable: true
 *       400:
 *         description: Failed to mark message as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed mark as read message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed mark as read message Unexpected error
 */
router.post('/mark-as-read', (req, res) => whatsappController.markAsRead(req, res));

module.exports = router;