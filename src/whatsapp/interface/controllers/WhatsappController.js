const STATUS = require('../../../shared/constants/statusCodes');
const responseFormatter = require('../../../shared/utils/responseFormatter');
const ProcessWhatsappWebhook = require('../../application/usecase/ProcessWhatsappWebhook');

class WhatsappController {
  constructor() {
    this.processWhatsappWebhook = new ProcessWhatsappWebhook();
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
      if (
        payload &&
        payload.object === 'whatsapp_business_account' &&
        (!payload.entry || !payload.entry[0].changes || !payload.entry[0].changes[0].value.messages)
      ) {
        console.log('Received WhatsApp ping or status update');
        return res.status(200).send('OK');
      }
  
      // Proses payload webhook
      const result = await this.processWhatsappWebhook.execute(payload);
  
      if (!result.success) {
        // Always return 200 OK to avoid WhatsApp retries
        return res.status(200).json(
          responseFormatter(
            STATUS.SUCCESS,
            200,
            'Webhook received but failed to process, success: false'
          )
        );
      }
  
      // Format the response based on message type
      const formattedResults = result.results.map((r) => ({
        type: r.type,
        from: r.from,
        status: r.status,
        messageBody: r.messageBody,
        chatCreated: r.type === 'message' ? !!r.result : undefined,
        markedAsRead: r.type === 'status' && r.status === 'read' ? !!r.result : undefined,
        ignored: r.result === 'ignored' ? true : false,
        error: r.error,
      }));
  
      // Kirim respons sukses
      return res.status(200).json(
        responseFormatter(
          STATUS.SUCCESS,
          200,
          'Webhook processed successfully',
          {
            messagesProcessed: result.messagesProcessed,
            results: formattedResults,
          }
        )
      );
    } catch (error) {
      console.error('Error processing webhook:', error);
  
      return res.status(200).json(
        responseFormatter(
          STATUS.SUCCESS,
          200,
          `Webhook received but failed to process: ${error.message}`,
          null
        )
      );
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