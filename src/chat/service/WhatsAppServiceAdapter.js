const WhatsAppService = require('../../whatsapp/services/WhatsAppService');

class WhatsAppServiceAdapter {
  constructor() {
    this.whatsappService = new WhatsAppService();
  }

  async sendToWhatsapApi({ waBusinessId, clientWaId, messageText }) {
    try {
      // Call the sendToWhatsapApi method with clientWaId instead of recipientNumber
      const result = await this.whatsappService.sendToWhatsapApi({
        waBusinessId, clientWaId, messageText
      });

      return result;
    } catch (error) {
      console.log('Error sending to WhatsApp API: ', error);
      throw error;
    }
  }
}

module.exports = WhatsAppServiceAdapter;