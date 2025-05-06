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
 *     summary: Verifikasi webhook WhatsApp
 *     description: Endpoint untuk verifikasi webhook WhatsApp Business API
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: query
 *         name: hub.mode
 *         schema:
 *           type: string
 *         required: true
 *         description: Mode verifikasi (selalu 'subscribe')
 *       - in: query
 *         name: hub.verify_token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token verifikasi yang harus cocok dengan konfigurasi
 *       - in: query
 *         name: hub.challenge
 *         schema:
 *           type: string
 *         required: true
 *         description: Challenge string yang harus dikembalikan jika verifikasi berhasil
 *     responses:
 *       200:
 *         description: Webhook terverifikasi dengan sukses
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: Challenge string
 *       403:
 *         description: Verifikasi webhook gagal
 */
router.get('/webhook', (req, res) => whatsappController.webhookGet(req, res));

/**
 * @swagger
 * /whatsapp/webhook:
 *   post:
 *     summary: Menerima notifikasi webhook WhatsApp
 *     description: Endpoint untuk menerima pesan dan notifikasi dari WhatsApp Business API
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
 *                 description: Tipe objek (selalu 'whatsapp_business_account')
 *               entry:
 *                 type: array
 *                 description: Array data perubahan
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID WhatsApp Business Account
 *                     changes:
 *                       type: array
 *                       description: Array perubahan
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
 *         description: Webhook berhasil diproses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                     messageBody:
 *                       type: string
 *                     chatCreated:
 *                       type: boolean
 */
router.post('/webhook', (req, res) => whatsappController.webhookPost(req, res));

module.exports = router;