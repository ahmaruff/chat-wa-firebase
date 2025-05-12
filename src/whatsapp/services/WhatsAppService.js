const SendMessage = require('../application/usecase/SendMessage');
const SendMedia = require('../application/usecase/SendMedia');
const GetMediaInfo = require('../application/usecase/GetMediaInfo');
const ProxyMedia = require('../application/usecase/ProxyMedia');
const ChannelServiceAdapter = require('../services/ChannelServiceAdapter');

class WhatsAppService {
  constructor() {
    this.channelServiceAdapter = new ChannelServiceAdapter();
    this.sendMessage = new SendMessage();
    this.sendMedia = new SendMedia();
    this.getMediaInfo = new GetMediaInfo();
    this.proxyMedia = new ProxyMedia();
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

      if(!result.success) {
        console.error("Failed send media to whatsapp:", result);
        throw new Error("Failed send media to whatsapp");
      }

      return result;
    } catch (error) {
      console.error('Error sending media to WhatsApp API: ', error);
      throw error;
    }
  }

  /**
   * Get media info including a proxied URL for client use
   * @param {Object} params - Parameters
   * @param {string} params.waBusinessId - The WhatsApp Business ID
   * @param {string} params.mediaId - The WhatsApp media ID
   * @param {string} params.baseUrl - Base URL for creating proxy URL
   * @returns {Promise<Object>} - Media info with proxy URL
   */
  async mediaInfo({ waBusinessId, mediaId, baseUrl }) {
    try {
      if (!mediaId || !waBusinessId || !baseUrl) {
        throw new Error('Missing required parameters: mediaId, waBusinessId, baseUrl');
      }

      return await this.getMediaInfo.execute({ 
        waBusinessId,
        mediaId, 
        baseUrl 
      });
    } catch (error) {
      console.error('Error getting media info from WhatsApp API: ', error);
      throw error;
    }
  }

  /**
   * Stream media content to client
   * @param {Object} params - Parameters
   * @param {string} params.waBusinessId - The WhatsApp Business ID
   * @param {string} params.mediaId - The WhatsApp media ID
   * @param {Object} params.responseStream - HTTP response object to pipe media to
   * @returns {Promise<void>}
   */
  async streamMedia({ waBusinessId, mediaId, responseStream }) {
    try {
      if (!mediaId || !waBusinessId || !responseStream) {
        throw new Error('Missing required parameters: mediaId, waBusinessId, responseStream');
      }

      await this.proxyMedia.execute({
        waBusinessId,
        mediaId,
        responseStream
      });
    } catch (error) {
      console.error('Error streaming media from WhatsApp API: ', error);
      throw error;
    }
  }
}

module.exports = WhatsAppService;