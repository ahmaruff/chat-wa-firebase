const ChannelServiceAdapter = require('../../services/ChannelServiceAdapter');

class SendMessage {
  constructor() {
    
    this.channelServiceAdapter = new ChannelServiceAdapter();
  }

  static generateApiUrl(phoneNumberId) {
    const apiUrl = "https://graph.facebook.com/v20.0";
    return `${apiUrl}/${phoneNumberId}/messages`;
  }

  async send({ waBusinessId, recipientNumber, messageText }) {
    const waChannelResult = await this.channelServiceAdapter.getWhatsappChannel(waBusinessId);

    if (!waChannelResult) {
      console.warn(`Unknown WABA ID: ${waBusinessId} — ignoring message`);
      return null;
    }

    const waChannel = waChannelResult.whatsappChannel;
    const waba = waChannelResult.whatsAppBusinessId;
    console.log('waba: ',waba);
    console.log('phoneNumberId: ', waChannel.phoneNumberId);

    const url = SendMessage.generateApiUrl(waChannel.phoneNumberId);
    console.log(url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${waChannel.accessToken}`,
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
      console.warn(`Failed to send message:`, error);
      throw error;
    }
  }
}

module.exports = SendMessage;