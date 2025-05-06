const SendMessage = require('../application/usecase/SendMessage');

class WhatsAppService {
  constructor() {
    this.sendMessage = new SendMessage();
  }

  async sendToWhatsapApi({ waBusinessId, clientWaId, messageText }) {
    try {
      // Call the SendMessage send method with clientWaId instead of recipientNumber
      const result = await this.sendMessage.send({
        waBusinessId: waBusinessId,
        clientWaId: clientWaId,
        messageText: messageText,
      });

      return result;
    } catch (error) {
      console.error('Error sending to WhatsApp API: ', error);
      throw error;
    }
  }
}

module.exports = WhatsAppService;