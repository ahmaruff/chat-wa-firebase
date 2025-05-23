const ChannelServiceAdapter = require('../../services/ChannelServiceAdapter');

const config = require('../../../shared/utils/configs');
const WHATSAPP_API_BASE_URL = config.whatsapp.api_base_url;

class SendMessage {
  constructor() {
    this.channelServiceAdapter = new ChannelServiceAdapter();
  }

  static generateApiUrl(phoneNumberId) {
    return `${WHATSAPP_API_BASE_URL}/${phoneNumberId}/messages`;
  }

  async send({ waBusinessId, clientWaId, messageText }) {
    const waConfig = await this.channelServiceAdapter.getWaConfigByWaBusinessId(waBusinessId);

    if (!waConfig) {
      console.log(`Unknown waBusinessId : ${waBusinessId} — ignoring message`);
      return null;
    }

    if(!waConfig.isActive) {
      console.error(`Config waBusinessId: ${wa_business_id} INACTIVE — ignoring message`);
      return null;
    }

    console.log('waBusinessId: ', waConfig.waBusinessId);
    console.log('phoneNumberId: ', waConfig.phoneNumberId);
    console.log('clientWaId: ', clientWaId);

    const url = SendMessage.generateApiUrl(waConfig.phoneNumberId);
    console.log('send to whatsapp api url: ', url);

    try {
      // Remove the 'whatsapp:' prefix if it's there
      const recipientNumber = clientWaId.replace('whatsapp:', '');
      if (!recipientNumber) {
        throw new Error("Recipient number is invalid.");
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${waConfig.getToken()}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientNumber,
          text: { body: messageText },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error from WhatsApp API:', result);
        throw new Error(`WhatsApp API error: ${response.status} ${result.error?.message || ''}`);
      }

      console.log('Message sent successfully:', result);

      return {
        success: true,
        result: result,
      };
    } catch (error) {
      console.error(`Failed to send message:`, error);
      throw error;
    }
  }
}

module.exports = SendMessage;