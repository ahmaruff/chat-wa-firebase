const SendMessage = require('../application/usecase/SendMessage');

class WhatsAppService {
  constructor() {
    this.sendMessage = new SendMessage();
  }

  async sendToWhatsapApi({ waBusinessId, recipientNumber, messageText}) {
    try {
      const result = await this.sendMessage.send({
        waBusinessId: waBusinessId,
        recipientNumber: recipientNumber,
        messageText: messageText,
      });

      return result;
    } catch (error) {
      console.log('error send to whatsapp api: ', error);
      throw error;
    }
  }
}

module.exports = WhatsAppService;