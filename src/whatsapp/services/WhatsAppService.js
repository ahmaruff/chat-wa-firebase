const SendMessage = require('../application/usecase/SendMessage');
const SendMedia = require('../application/usecase/SendMedia');

class WhatsAppService {
  constructor() {
    this.sendMessage = new SendMessage();
    this.sendMedia = new SendMedia();
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
      if (!waBusinessId || !clientWaId || !messageText) {
        throw new Error('Missing required parameters: waBusinessId, clientWaId, messageText');
      }

      // Call the SendMessage send method with clientWaId
      const result = await this.sendMessage.send({
        waBusinessId: waBusinessId,
        clientWaId: clientWaId,
        messageText: messageText,
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
  async sendMediaToWhatsappApi({ waBusinessId, clientWaId, mediaFile, mediaType, caption }) {
    try {
      // Validate required parameters
      if (!waBusinessId || !clientWaId || !mediaFile || !mediaType) {
        throw new Error('Missing required parameters for sending media');
      }

      // Call the SendMedia send method
      const result = await this.sendMedia.send({
        waBusinessId: waBusinessId,
        clientWaId: clientWaId,
        mediaFile: mediaFile,
        mediaType: mediaType,
        caption: caption || '', // Make caption optional
      });

      return result;
    } catch (error) {
      console.error('Error sending media to WhatsApp API: ', error);
      throw error;
    }
  }
}

module.exports = WhatsAppService;