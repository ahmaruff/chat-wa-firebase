const WhatsAppService = require('../../whatsapp/services/WhatsAppService');

class WhatsAppServiceAdapter {
  constructor() {
    this.whatsappService = new WhatsAppService();
  }

  async sendToWhatsapApi({
    waBusinessId, recipientNumber, messageText
  }) {
    try {
      const result = await this.whatsappService.sendToWhatsapApi({
        waBusinessId, recipientNumber, messageText
      });

      return result;
    } catch (error) {
      console.log('error send to whatsapp api: ', error);
      throw error;
    }
  }
}

module.exports = WhatsAppServiceAdapter;