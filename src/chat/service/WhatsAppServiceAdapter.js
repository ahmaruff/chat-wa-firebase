const WhatsAppService = require('../../whatsapp/services/WhatsAppService');

class WhatsAppServiceAdapter {
  constructor() {
    this.whatsappService = new WhatsAppService();
  }

  /**
   * Send text message to WhatsApp API
   * @param {Object} params - Message parameters
   * @param {string} params.waBusinessId - WhatsApp Business ID
   * @param {string} params.clientWaId - Recipient's WhatsApp ID
   * @param {string} params.messageText - Text message to send
   * @returns {Promise<Object>} - API response
   */
  async sendToWhatsapApi({ waBusinessId, clientWaId, messageText }) {
    try {
      // Call the sendToWhatsapApi method with clientWaId
      const result = await this.whatsappService.sendToWhatsapApi({
        waBusinessId, 
        clientWaId, 
        messageText
      });

      return result;
    } catch (error) {
      console.error('Error sending text message to WhatsApp API: ', error);
      throw error;
    }
  }

  /**
   * Send media message to WhatsApp API
   * @param {Object} params - Message parameters
   * @param {string} params.waBusinessId - WhatsApp Business ID
   * @param {string} params.clientWaId - Recipient's WhatsApp ID
   * @param {Object} params.mediaFile - Uploaded file object from multer
   * @param {string} params.mediaType - Media type (image, video, audio, document, sticker)
   * @param {string} [params.caption] - Optional caption for the media
   * @returns {Promise<Object>} - API response
   */
  async sendMediaToWhatsapApi({ waBusinessId, clientWaId, mediaFile, mediaType, caption }) {
    try {
      // Call the sendMediaToWhatsappApi method
      const result = await this.whatsappService.sendMediaToWhatsappApi({
        waBusinessId,
        clientWaId,
        mediaFile,
        mediaType,
        caption
      });

      return result;
    } catch (error) {
      console.error('Error sending media message to WhatsApp API: ', error);
      throw error;
    }
  }
}

module.exports = WhatsAppServiceAdapter;