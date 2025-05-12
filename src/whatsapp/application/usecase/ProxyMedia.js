const { Readable } = require('stream');
const ChannelServiceAdapter = require('../../services/ChannelServiceAdapter');

const config = require('../../../shared/utils/configs');
const WHATSAPP_API_BASE_URL = config.whatsapp.api_base_url;

/**
 * Use case for proxying WhatsApp media content
 */
class ProxyMedia {
  constructor() {
    this.channelServiceAdapter = new ChannelServiceAdapter();
  }

  /**
   * Stream media content from WhatsApp API to response
   * @param {string} waBusinessId - The WhatsApp Business ID
   * @param {string} mediaId - The WhatsApp media ID
   * @param {Object} responseStream - The HTTP response object to pipe the media to
   * @returns {Promise<void>}
   */
  async execute({ waBusinessId, mediaId, responseStream }) {
    // Get WhatsApp Business configuration
    const waConfig = await this.channelServiceAdapter.getWaConfigByWaBusinessId(waBusinessId);
    
    if (!waConfig) {
      throw new Error(`Unknown waBusinessId: ${waBusinessId}`);
    }

    if(!waConfig.isActive) {
      console.error(`Config waBusinessId: ${wa_business_id} INACTIVE — ignoring message`);
      throw new Error(`Config waBusinessId: ${wa_business_id} INACTIVE`);
    }

    try {
      // Get the media URL from Graph API
      const mediaResponse = await fetch(
        `${WHATSAPP_API_BASE_URL}/${mediaId}`,
        { 
          headers: { Authorization: `Bearer ${waConfig.getToken()}` } 
        }
      );

      if (!mediaResponse.ok) {
        const errorData = await mediaResponse.json();
        throw new Error(errorData.error?.message || `Graph API error: ${mediaResponse.status}`);
      }

      const mediaData = await mediaResponse.json();
      const fileUrl = mediaData.url;
      
      if (!fileUrl) {
        throw new Error('Media URL not found or expired');
      }

      // Fetch the actual file
      const fileResponse = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${waConfig.getToken()}`
        }
      });

      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch media content: ${fileResponse.status}`);
      }

      // Set response headers from the original file
      responseStream.setHeader('Content-Type', fileResponse.headers.get('content-type') || 'application/octet-stream');
      
      const contentLength = fileResponse.headers.get('content-length');
      if (contentLength) {
        responseStream.setHeader('Content-Length', contentLength);
      }
      
      // Set caching headers
      responseStream.setHeader('Cache-Control', 'public, max-age=86400');
      
      // Stream the file to the response
      const body = await fileResponse.arrayBuffer();
      const readable = new Readable();
      readable._read = () => {}; // _read is required but we don't need to do anything
      readable.push(Buffer.from(body));
      readable.push(null);
      
      readable.pipe(responseStream);
      
      // Return control - the streaming continues in the background
      return;
    } catch (error) {
      console.error('Error proxying media file:', error.message);
      throw new Error(error.message || 'Failed to proxy media file');
    }
  }
}

module.exports = ProxyMedia;