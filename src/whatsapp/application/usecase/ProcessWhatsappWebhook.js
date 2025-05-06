const WhatsappMessage = require('../../domain/entities/WhatsappMessage');
const config = require('../../../shared/utils/configs');
const ChannelServiceAdapter = require('../../services/ChannelServiceAdapter');
const ChatServiceAdapter = require('../../services/ChatServiceAdapter');
class ProcessWhatsappWebhook {
  constructor() {
    this.chatServiceAdapter = new ChatServiceAdapter();
    this.channelServiceAdapter = new ChannelServiceAdapter();
  }

  /**
 * Memproses payload webhook dari WhatsApp
 * @param {Object} payload - Payload webhook WhatsApp
 * @returns {Promise<Object>} - Hasil pemrosesan
 */
  async execute(payload) {
    try {
      if (!payload || payload.object !== 'whatsapp_business_account') {
        console.log('Invalid payload or not from WhatsApp Business:', payload);
        throw new Error('Invalid webhook payload');
      }

      const whatsappMessages = WhatsappMessage.fromPayload(payload);

      if (!Array.isArray(whatsappMessages) || whatsappMessages.length === 0) {
        return {
          success: false,
          payload: payload,
          reason: 'No valid messages in payload',
        };
      }

      const results = [];

      for (const msg of whatsappMessages) {
        try {
          console.log(`Processing message type: ${msg.type}, from: ${msg.from}`);
      
          if (msg.type === 'status') {
            // Only mark as read if status is 'read'
            if (msg.status === 'read') {
              const res = await this.chatServiceAdapter.markAsRead(msg.wamid);
              results.push({
                type: 'status',
                status: msg.status,
                from: msg.from,
                result: res,
              });
            } else {
              console.log(`Ignoring status: ${msg.status} for message ${msg.wamid}`);
              results.push({
                type: 'status',
                status: msg.status,
                from: msg.from,
                result: 'ignored',
              });
            }
          } else {
            const chatResult = await this.chatServiceAdapter.createChatFromWhatsApp(msg);
            results.push({
              type: 'message',
              from: msg.from,
              messageBody: msg.body,
              result: chatResult,
            });
          }
        } catch (err) {
          console.error('Error handling message:', msg, err);
          results.push({
            type: msg.type,
            from: msg.from,
            error: err.message,
          });
        }
      }      

      return {
        success: true,
        messagesProcessed: results.length,
        results,
      };
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
      throw error;
    }
  }

  /**
   * Verifikasi webhook WhatsApp
   * @param {string} mode - Mode verifikasi
   * @param {string} token - Token verifikasi
   * @param {string} challenge - Challenge string
   * @returns {Object} - Hasil verifikasi
   */
  verifyWebhook(mode, token, challenge) {
    const verifyToken = config.whatsapp.verify_token;
    
    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('SUCES VERIFY WHATSAPP TOKEN');
        return { success: true, challenge };
      } else {
        throw new Error('Verification failed: token mismatch');
      }
    }
    
    throw new Error('Missing parameters for webhook verification');
  }
}

module.exports = ProcessWhatsappWebhook;