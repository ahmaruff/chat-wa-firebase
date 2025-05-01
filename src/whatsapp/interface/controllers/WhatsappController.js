const STATUS = require('../../../shared/constants/statusCodes');
const responseFormatter = require('../../../shared/utils/responseFormatter');

class WhatsappController {
  constructor(processWhatsappWebhook) {
    this.processWhatsappWebhook = processWhatsappWebhook;
  }

  /**
   * Menangani request POST webhook dari WhatsApp
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async webhookPost(req, res) {
    try {
      const payload = req.body;
      
      // Log payload yang diterima (hanya untuk development)
      if (process.env.NODE_ENV === 'development') {
        console.log('Received WhatsApp webhook payload:', JSON.stringify(payload, null, 2));
      }
      
      // Jika ini adalah ping/health check dari WhatsApp
      if (payload && payload.object === 'whatsapp_business_account' && 
          (!payload.entry || !payload.entry[0].changes || !payload.entry[0].changes[0].value.messages)) {
        console.log('Received WhatsApp ping or status update');
        return res.status(200).send('OK');
      }

      // Proses payload webhook
      const result = await this.processWhatsappWebhook.execute(payload);

      if(!result.success) {
        // always return 200 OK to avoid whatsapp attempted to send it again;
        res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'Webhook received but failed to process, success: false'));
      }
      
      const resp = {
        from: result.from,
        messageBody: result.messageBody,
        chatCreated: result.chatResult ? true : false
      }
      
      // Kirim respons sukses
      res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'Webhook processed successfully', resp));
    } catch (error) {
      console.error('Error processing webhook:', error);

      // Tetap kirim status 200 ke WhatsApp untuk menghindari retries
      // WhatsApp mengharapkan respons 200 bahkan jika terjadi error pada pemrosesan
      res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, `Webhook received but failed to process: ${error.meesage}`, null));
    }
  }

  /**
   * Menangani request GET verifikasi webhook dari WhatsApp
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async webhookGet(req, res) {
    try {
      // Extract params dari request verifikasi webhook
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];
      
      console.log(`Received verification request: mode=${mode}, token=${token?.substring(0, 3)}...`);
      
      // Validasi webhook
      const result = this.processWhatsappWebhook.verifyWebhook(mode, token, challenge);
      
      if (result.success) {
        console.log('Webhook verification successful');
        // Kirim challenge token sebagai respons
        res.status(200).send(result.challenge);
      } else {
        console.log('Webhook verification failed');
        // Unauthorized
        res.sendStatus(403);
      }
    } catch (error) {
      console.error('Webhook verification failed:', error);
      res.sendStatus(403);
    }
  }
}

module.exports = WhatsappController;