const express = require('express');
const router = express.Router();
const WaConfigController = require('../controllers/WaConfigController');
const FirestoreWaConfigRepository = require('../../infrastructure/FirestoreWaConfigRepository');
const FirestoreChannelRepository = require('../../infrastructure/FirestoreChannelRepository');

const firestoreWaConfigRepository = new FirestoreWaConfigRepository();
const firestoreChannelRepository = new FirestoreChannelRepository();
const waConfigController = new WaConfigController(firestoreWaConfigRepository, firestoreChannelRepository);

/**
 * @swagger
 * tags:
 *   name: WaConfigs
 *   description: WhatsApp Configuration Management
 */

/**
 * @swagger
 * /wa-configs:
 *   post:
 *     summary: Create a new WhatsApp Configuration
 *     tags: [WaConfigs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - channel_id
 *               - wa_business_id
 *               - phone_number_id
 *               - display_phone_number
 *               - access_token
 *             properties:
 *               channel_id:
 *                 type: string
 *                 description: ID of the channel this WhatsApp config belongs to
 *                 example: "channel-123"
 *               is_active:
 *                 type: boolean
 *                 description: Whether this WhatsApp configuration is active
 *                 default: true
 *                 example: true
 *               name:
 *                 type: string
 *                 description: Account name
 *                 example: CS Dinda
 *               wa_business_id:
 *                 type: string
 *                 description: WhatsApp Business ID
 *                 example: "waba-123456789"
 *               phone_number_id:
 *                 type: string
 *                 description: WhatsApp Phone Number ID
 *                 example: "123456789"
 *               display_phone_number:
 *                 type: string
 *                 description: Display phone number for WhatsApp
 *                 example: "+6281234567890"
 *               access_token:
 *                 type: string
 *                 description: Access token for WhatsApp API
 *                 example: "EAAJZCZCx..."
 *               participants:
 *                 type: array
 *                 description: List of participant IDs who can access this WhatsApp channel
 *                 items:
 *                   type: string
 *                 example: ["user-123", "user-456"]
 *     responses:
 *       201:
 *         description: WhatsApp Configuration created successfully
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
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Create wa Config success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     wa_config:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "waconfig-123"
 *                         channelId:
 *                           type: string
 *                           example: "channel-123"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         name:
 *                           type: string
 *                           example: CS Dinda
 *                         waBusinessId:
 *                           type: string
 *                           example: "waba-123456789"
 *                         phoneNumberId:
 *                           type: string
 *                           example: "123456789"
 *                         displayPhoneNumber:
 *                           type: string
 *                           example: "+6281234567890"
 *                         accessToken:
 *                           type: string
 *                           example: "EAAJZCZCx..."
 *                         participants:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["user-123", "user-456"]
 *                         createdAt:
 *                           type: number
 *                           example: 1623674829000
 *                         updatedAt:
 *                           type: number
 *                           example: 1623674829000
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
 *                   example: "Create wa config failed: Error message"
 *                 data:
 *                   type: null
 */
router.post('/', (req, res) => waConfigController.save(req, res));

/**
 * @swagger
 * /wa-configs/{id}:
 *   get:
 *     summary: Get a WhatsApp Configuration by ID
 *     tags: [WaConfigs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "waconfig-123"
 *         description: WhatsApp Configuration ID
 *     responses:
 *       200:
 *         description: WhatsApp Configuration retrieved successfully
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
 *                   example: "Get wa config success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     wa_config:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "waconfig-123"
 *                         channelId:
 *                           type: string
 *                           example: "channel-123"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         waBusinessId:
 *                           type: string
 *                           example: "waba-123456789"
 *                         phoneNumberId:
 *                           type: string
 *                           example: "123456789"
 *                         displayPhoneNumber:
 *                           type: string
 *                           example: "+6281234567890"
 *                         accessToken:
 *                           type: string
 *                           example: "EAAJZCZCx..."
 *                         participants:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["user-123", "user-456"]
 *                         createdAt:
 *                           type: number
 *                           example: 1623674829000
 *                         updatedAt:
 *                           type: number
 *                           example: 1623674829000
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
 *                   example: "Error message"
 *                 data:
 *                   type: null
 */
router.get('/:id', (req, res) => waConfigController.getById(req, res));

/**
 * @swagger
 * /wa-configs/get-by-channel:
 *   post:
 *     summary: Get WhatsApp Configuration by Channel ID
 *     tags: [WaConfigs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channel_id
 *             properties:
 *               channel_id:
 *                 type: string
 *                 description: Channel ID to find WhatsApp configuration for
 *                 example: "channel-123"
 *     responses:
 *       200:
 *         description: WhatsApp Configuration retrieved successfully
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
 *                   example: "Get wa config success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     wa_config:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "waconfig-123"
 *                         channelId:
 *                           type: string
 *                           example: "channel-123"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         waBusinessId:
 *                           type: string
 *                           example: "waba-123456789"
 *                         phoneNumberId:
 *                           type: string
 *                           example: "123456789"
 *                         displayPhoneNumber:
 *                           type: string
 *                           example: "+6281234567890"
 *                         accessToken:
 *                           type: string
 *                           example: "EAAJZCZCx..."
 *                         participants:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["user-123", "user-456"]
 *                         createdAt:
 *                           type: number
 *                           example: 1623674829000
 *                         updatedAt:
 *                           type: number
 *                           example: 1623674829000
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
 *                   example: "Error message"
 *                 data:
 *                   type: null
 */
router.post('/get-by-channel', (req, res) => waConfigController.getByChannelId(req, res));

/**
 * @swagger
 * /wa-configs/get-by-wa-business-id:
 *   post:
 *     summary: Get WhatsApp Configuration by WA business ID
 *     tags: [WaConfigs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wa_business_id
 *             properties:
 *               wa_business_id:
 *                 type: string
 *                 description: WA Business ID to find WhatsApp configuration for
 *                 example: "123149743264"
 *     responses:
 *       200:
 *         description: WhatsApp Configuration retrieved successfully
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
 *                   example: "Get wa config success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     wa_config:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "waconfig-123"
 *                         channelId:
 *                           type: string
 *                           example: "channel-123"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         waBusinessId:
 *                           type: string
 *                           example: "waba-123456789"
 *                         phoneNumberId:
 *                           type: string
 *                           example: "123456789"
 *                         displayPhoneNumber:
 *                           type: string
 *                           example: "+6281234567890"
 *                         accessToken:
 *                           type: string
 *                           example: "EAAJZCZCx..."
 *                         participants:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["user-123", "user-456"]
 *                         createdAt:
 *                           type: number
 *                           example: 1623674829000
 *                         updatedAt:
 *                           type: number
 *                           example: 1623674829000
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
 *                   example: "Error message"
 *                 data:
 *                   type: null
 */
router.post('/get-by-wa-business-id', (req, res) => waConfigController.getByWaBusinessId(req, res));

/**
 * @swagger
 * /wa-configs/get-by-crm-channel:
 *   post:
 *     summary: Get WhatsApp Configuration by CRM Channel ID
 *     tags: [WaConfigs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - crm_channel_id
 *             properties:
 *               crm_channel_id:
 *                 type: string
 *                 description: CRM Channel ID to find WhatsApp configuration for
 *                 example: "crm-001"
 *     responses:
 *       200:
 *         description: WhatsApp Configuration retrieved successfully
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
 *                   example: "Get wa config success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     wa_config:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "waconfig-123"
 *                         channelId:
 *                           type: string
 *                           example: "channel-123"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         waBusinessId:
 *                           type: string
 *                           example: "waba-123456789"
 *                         phoneNumberId:
 *                           type: string
 *                           example: "123456789"
 *                         displayPhoneNumber:
 *                           type: string
 *                           example: "+6281234567890"
 *                         accessToken:
 *                           type: string
 *                           example: "EAAJZCZCx..."
 *                         participants:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["user-123", "user-456"]
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
 *                   example: "Error message"
 *                 data:
 *                   type: null
 */
router.post('/get-by-crm-channel', (req, res) => waConfigController.getByCrmChannelId(req, res));

/**
 * @swagger
 * /wa-configs/get-by-participant:
 *   post:
 *     summary: Find WhatsApp Configurations by Channel ID and Participant ID
 *     tags: [WaConfigs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channel_id
 *               - participant_id
 *             properties:
 *               channel_id:
 *                 type: string
 *                 description: Channel ID to filter WhatsApp configurations
 *                 example: "channel-123"
 *               participant_id:
 *                 type: string
 *                 description: Participant ID to filter WhatsApp configurations (must be in participants array)
 *                 example: "user-123"
 *     responses:
 *       200:
 *         description: WhatsApp Configurations retrieved successfully
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
 *                   example: "Get wa config success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     wa_config:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "waconfig-123"
 *                           channelId:
 *                             type: string
 *                             example: "channel-123"
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           waBusinessId:
 *                             type: string
 *                             example: "waba-123456789"
 *                           phoneNumberId:
 *                             type: string
 *                             example: "123456789"
 *                           displayPhoneNumber:
 *                             type: string
 *                             example: "+6281234567890"
 *                           accessToken:
 *                             type: string
 *                             example: "EAAJZCZCx..."
 *                           participants:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["user-123", "user-456"]
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
 *                   example: "Error message"
 *                 data:
 *                   type: null
 */
router.post('/get-by-participant', (req, res) => waConfigController.getByParticipants(req, res));

/**
 * @swagger
 * /wa-configs/{id}:
 *   delete:
 *     summary: Delete a WhatsApp Configuration
 *     tags: [WaConfigs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "waconfig-123"
 *         description: ID of the WhatsApp configuration to delete
 *     responses:
 *       200:
 *         description: WhatsApp Configuration deleted successfully
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
 *                   example: "Success delete wa config"
 *                 data:
 *                   type: null
 *       400:
 *         description: Failed to delete WhatsApp Configuration
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
 *                   example: "Failed delete wa config"
 *                 data:
 *                   type: null
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
 *                   example: "Error message"
 *                 data:
 *                   type: null
 */
router.delete('/:id', (req, res) => waConfigController.delete(req, res));

module.exports = router;