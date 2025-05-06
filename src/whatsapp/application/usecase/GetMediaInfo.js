const ChannelServiceAdapter = require('../../services/ChannelServiceAdapter');

/**
 * Use case for retrieving WhatsApp media information
 */
class GetMediaInfo {
  constructor() {
    this.channelServiceAdapter = new ChannelServiceAdapter();
  }

  /**
   * Get media metadata from WhatsApp API
   * @param {string} waBusinessId - The WhatsApp Business ID
   * @param {string} mediaId - The WhatsApp media ID
   * @param {string} baseUrl - Base URL for the proxy URL
   * @returns {Promise<Object>} - Media info including proxy URL and MIME type
   */
  async execute({ waBusinessId, mediaId, baseUrl }) {
    // Get WhatsApp Business configuration
    const waConfig = await this.channelServiceAdapter.getWaConfigByWaBusinessId(waBusinessId);
    
    if (!waConfig) {
      throw new Error(`Unknown waBusinessId: ${waBusinessId}`);
    }

    try {
      // Get the media metadata from Graph API
      const mediaResponse = await fetch(
        `https://graph.facebook.com/v20.0/${mediaId}`,
        {
          headers: { 
            Authorization: `Bearer ${waConfig.accessToken}`
          },
        }
      );

      if (!mediaResponse.ok) {
        const errorData = await mediaResponse.json();
        throw new Error(errorData.error?.message || `Failed to fetch media metadata: ${mediaResponse.status}`);
      }

      const mediaData = await mediaResponse.json();
      const fileUrl = mediaData.url;
      
      if (!fileUrl) {
        throw new Error('Media URL not found or expired');
      }

      // Fetch file headers to get MIME type
      const fileResponse = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${waConfig.accessToken}`
        }
      });

      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch media content: ${fileResponse.status}`);
      }

      // Get content type from headers
      const mimeType = fileResponse.headers.get('content-type');

      // Generate a proxy URL for the client to use
      const proxiedUrl = `${baseUrl}/media-proxy/${mediaId}?waBusinessId=${waBusinessId}`;

      // Return the media information
      return {
        url: proxiedUrl,
        mime_type: mimeType,
        original_url: fileUrl,
        media_id: mediaId
      };
    } catch (error) {
      console.error('Error fetching media metadata:', error.message);
      throw new Error(error.message || 'Failed to fetch media metadata');
    }
  }
}

module.exports = GetMediaInfo;