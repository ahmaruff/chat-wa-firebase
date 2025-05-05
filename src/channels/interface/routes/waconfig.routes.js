const express = require('express');
const router = express.Router();
const FirestoreWaConfigRepository = require('../../infrastructure/FirestoreWaConfigRepository');
const WaConfigController = require('../controllers/WaConfigController');

const firestoreWaConfigRepository = new FirestoreWaConfigRepository();
const waConfigController = new WaConfigController(firestoreWaConfigRepository);

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

module.exports = router;