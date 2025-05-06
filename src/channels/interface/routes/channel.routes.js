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
 *   description: Channel Management API
 */

/**
 * @swagger
 * /channels:
 *   post:
 *     summary: Create a new Channel
 *     tags: [Channels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - crm_channel_id
 *               - name
 *             properties:
 *               crm_channel_id:
 *                 type: string
 *                 example: "crm-001"
 *               name:
 *                 type: string
 *                 example: "Main Channel"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Channel created successfully
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
 *                   example: "Create channel Success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     channel:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "channel123"
 *                         crmChannelId:
 *                           type: string
 *                           example: "crm-001"
 *                         name:
 *                           type: string
 *                           example: "Main Channel"
 *                         isActive:
 *                           type: boolean
 *                           example: true
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
 *                   example: "Create channel failed: Error message"
 *                 data:
 *                   type: null
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
 *         description: Channel ID
 *     responses:
 *       200:
 *         description: Channel retrieved successfully
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
 *                   example: "Get channel success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     channel:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "channel123"
 *                         crmChannelId:
 *                           type: string
 *                           example: "crm-001"
 *                         name:
 *                           type: string
 *                           example: "Main Channel"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: number
 *                           example: 1623674829000
 *                         updatedAt:
 *                           type: number
 *                           example: 1623674829000
 *       404:
 *         description: Channel not found
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
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Channel not found"
 *                 data:
 *                   type: null
 */
router.get('/:id', (req, res) => channelController.getById(req, res));

/**
 * @swagger
 * /channels/get-by-crm-channel:
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
 *               - crm_channel_id
 *             properties:
 *               crm_channel_id:
 *                 type: string
 *                 example: "crm-001"
 *     responses:
 *       200:
 *         description: Channel found successfully
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
 *                   example: "get channel by crmChannel Id success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     channel:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "channel123"
 *                         crmChannelId:
 *                           type: string
 *                           example: "crm-001"
 *                         name:
 *                           type: string
 *                           example: "Main Channel"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: number
 *                           example: 1623674829000
 *                         updatedAt:
 *                           type: number
 *                           example: 1623674829000
 *       400:
 *         description: CRM Channel ID is required
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
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Error: crm_channel_id required"
 *                 data:
 *                   type: null
 *       404:
 *         description: Channel not found
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
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Channel not found"
 *                 data:
 *                   type: null
 */
router.post('/get-by-crm-channel', (req, res) => channelController.getByCrmChannelId(req, res));

module.exports = router;