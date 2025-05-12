const ChannelServiceAdapter = require('../../services/ChannelServiceAdapter');
const ChatServiceAdapter = require('../../services/ChatServiceAdapter');

const config = require('../../../shared/utils/configs');
const WHATSAPP_API_BASE_URL = config.whatsapp.api_base_url;

const CHAT_DIRECTION = require('../../../shared/constants/chatDirection');
class SendReadStatus{
  constructor() {
    this.channelServiceAdapter = new ChannelServiceAdapter();
    this.chatServiceAdapter = new ChatServiceAdapter();
  }
  static generateApiUrl(phoneNumberId) {
    return `${WHATSAPP_API_BASE_URL}/${phoneNumberId}/messages`;
  }

  async send(waBusinessId, wamid) {
    const waConfig = await this.channelServiceAdapter.getWaConfigByWaBusinessId(waBusinessId);

    if (!waConfig) {
      console.log(`Unknown waBusinessId : ${waBusinessId} — ignoring message`);
      return null;
    }

    if(!waConfig.isActive) {
      console.error(`Config waBusinessId: ${wa_business_id} INACTIVE — ignoring message`);
      return null;
    }

    const url = SendReadStatus.generateApiUrl(waConfig.phoneNumberId);
    console.log('send to whatsapp api url: ', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${waConfig.getToken()}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: "read",
          message_id: wamid,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error from WhatsApp API:', result);
        throw new Error(`WhatsApp API error: ${response.status} ${result.error?.message || ''}`);
      }

      console.log('Message sent successfully:', result);

      try {
        const isReadAll = await this.chatServiceAdapter.markAsReadUpToWamid({
          wamid: wamid,
          phoneNumberId: waConfig.phoneNumberId,
          direction: CHAT_DIRECTION.INBOUND,
        });
      } catch (error) {
        console.error('Error marking all chat:', error);
      }

      return {
        success: true,
        result: result,
      };
    } catch (error) {
      console.error(`Failed to send read status:`, error);
      throw error;
    }
  }
}

module.exports = SendReadStatus;