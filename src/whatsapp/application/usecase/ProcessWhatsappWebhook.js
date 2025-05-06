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
      if (!payload || !payload.object || payload.object !== 'whatsapp_business_account') {
        console.log('Invalid payload or not from WhatsApp Business:', payload);
        throw new Error('Invalid webhook payload');
      }

      const whatsappMessage = WhatsappMessage.fromPayload(payload);
      
      if (!whatsappMessage) {
        return {
          success: false,
          payload: payload,
        }
      }

      if(whatsappMessage == null) {
        return {
          success: false,
          payload: payload,
        }
      }

      console.log(`Received WhatsApp message: ${whatsappMessage.body} from ${whatsappMessage.from}`);
      
      const chatResult = await this.chatServiceAdapter.createChatFromWhatsApp(whatsappMessage);
      
      return {
        success: true,
        from: whatsappMessage.from,
        messageBody: whatsappMessage.body,
        chatResult: chatResult
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