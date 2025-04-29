const express = require('express');
const router = express.Router();
const FirestoreChannelRepository = require('../../infrastructure/FirestoreChannelRepository');
const ChannelController = require('../controllers/ChannelController');

const firestoreChannelRepository = new FirestoreChannelRepository();
const channelController = new ChannelController(firestoreChannelRepository);

/**
 * @swagger
 * tags:
 *   name: Channels
 *   description: Manajemen Channel & Whatsapp Channel
 */

/**
 * @swagger
 * /channels:
 *   post:
 *     summary: Create or update a Channel
 *     tags: [Channels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - crmChannelId
 *               - name
 *             properties:
 *               crmChannelId:
 *                 type: string
 *                 example: "crm-001"
 *               name:
 *                 type: string
 *                 example: "Main Channel"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Channel created
 *       200:
 *         description: Channel updated
 *       500:
 *         description: Server error
 */
router.post('/', (req, res) => channelController.save(req, res));

/**
 * @swagger
 * /channels/{id}:
 *   get:
 *     summary: Get a Channel by ID
 *     tags: [Channels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "channel-123"
 *     responses:
 *       200:
 *         description: Channel detail
 *       404:
 *         description: Channel not found
 *       500:
 *         description: Server error
 */
router.get('/:id', (req, res) => channelController.getChannel(req, res));

/**
 * @swagger
 * /channels/add-whatsapp-channel:
 *   post:
 *     summary: Add a Whatsapp Channel to an existing Channel
 *     tags: [Channels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channelId
 *               - waBusinessId
 *               - phoneNumberId
 *             properties:
 *               channelId:
 *                 type: string
 *                 example: "channel-123"
 *               waBusinessId:
 *                 type: string
 *                 example: "waba-123"
 *               phoneNumberId:
 *                 type: string
 *                 example: "wa-phone-id-456"
 *               displayPhoneNumber:
 *                 type: string
 *                 example: "+6281234567890"
 *               name:
 *                 type: string
 *                 example: "Support Line"
 *               accessToken:
 *                 type: string
 *                 example: "EAAJZCZCx..."
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               metadata:
 *                 type: object
 *                 example: { region: "Asia", department: "Support" }
 *     responses:
 *       200:
 *         description: Whatsapp channel added
 *       500:
 *         description: Server error
 */
router.post('/add-whatsapp-channel', (req, res) => channelController.addWhatsAppChannel(req, res));

/**
 * @swagger
 * /channels/find-by-phone:
 *   post:
 *     summary: Find Channel by Phone Number ID
 *     tags: [Channels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumberId
 *             properties:
 *               phoneNumberId:
 *                 type: string
 *                 example: "wa-phone-id-123"
 *     responses:
 *       200:
 *         description: Channel and WhatsappChannel found
 *       400:
 *         description: phoneNumberId required
 *       500:
 *         description: Server error
 */
router.post('/find-by-phone', (req, res) => channelController.findByPhoneNumber(req, res));

/**
 * @swagger
 * /channels/find-by-crm-channel:
 *   post:
 *     summary: Find Channel by CRM Channel ID
 *     tags: [Channels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - crmChannelId
 *             properties:
 *               crmChannelId:
 *                 type: string
 *                 example: "crm-001"
 *     responses:
 *       200:
 *         description: Channel found
 *       400:
 *         description: crmChannelId required
 *       404:
 *         description: Channel not found
 */
router.post('/find-by-crm-channel', (req, res) => channelController.findByCrmChannelId(req, res));

module.exports = router;