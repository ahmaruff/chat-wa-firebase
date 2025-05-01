const WhatsappMessage = require('../../domain/entities/WhatsappMessage');
const config = require('../../../shared/utils/configs');
const ChannelServiceAdapter = require('../../services/ChannelServiceAdapter');
class ProcessWhatsappWebhook {
  constructor(chatServiceAdapter) {
    this.chatServiceAdapter = chatServiceAdapter;
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

      const whatsappMessage = await this.handlePayload(payload);
      
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

  async handlePayload(payload){
    try {
      if (!payload || !payload.object || !payload.entry || !payload.entry.length) {
        console.error('Invalid WhatsApp payload structure');
        return null;
      }

      const entry = payload.entry[0];
      const change = entry.changes[0];
      
      if (!change || !change.value || !change.value.messages || !change.value.messages.length) {
        console.error('No messages in WhatsApp payload');
        return null;
      }

      const metadata = change.value.metadata;
      const message = change.value.messages[0];
      const contact = change.value.contacts && change.value.contacts.length ? 
                      change.value.contacts[0] : null;

      // Extract message body based on message type
      let body = null;
      if (message.type === 'text' && message.text) {
        body = message.text.body;
      } else if (message.type === 'image' && message.image) {
        body = message.image.caption || 'Image received';
      } else if (message.type === 'document' && message.document) {
        body = message.document.caption || 'Document received';
      } else if (message.type === 'audio' && message.audio) {
        body = 'Audio received';
      } else if (message.type === 'video' && message.video) {
        body = message.video.caption || 'Video received';
      } else {
        body = `Message of type ${message.type} received`;
      }

      const waChannelResult = await this.channelServiceAdapter.getWhatsappChannel(entry.id);

      if(!waChannelResult) {
        console.warn(`Unknown WABA ID: ${entry.id} — ignoring message`);
        return null;
      }

      const waChannel = waChannelResult.whatsappChannel;

      const wa = new WhatsappMessage({
        id: message.id,
        from: message.from,
        timestamp: parseInt(message.timestamp) * 1000,
        type: message.type,
        body: body,
        waBusinessAccountId: waChannelResult.whatsAppBusinessId,
        phoneNumberId: waChannel.phoneNumberId,
        displayPhoneNumber: metadata.display_phone_number,
        contactName: contact && contact.profile ? contact.profile.name : null,
        contactWaId: contact ? contact.wa_id : null,
        status: 'received',
        createdAt: Date.now()
      });

      return wa;
    } catch (error) {
      console.error('Error parsing WhatsApp payload:', error);
      return null;
    }
  }
}

module.exports = ProcessWhatsappWebhook;