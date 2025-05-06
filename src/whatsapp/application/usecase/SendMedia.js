const ChannelServiceAdapter = require('../../services/ChannelServiceAdapter');
const fs = require('fs');
const path = require('path');

class SendMedia {
  constructor() {
    this.channelServiceAdapter = new ChannelServiceAdapter();
  }

  static generateMediaApiUrl(phoneNumberId) {
    const apiUrl = "https://graph.facebook.com/v20.0";
    return `${apiUrl}/${phoneNumberId}/media`;
  }

  static generateMessageApiUrl(phoneNumberId) {
    const apiUrl = "https://graph.facebook.com/v20.0";
    return `${apiUrl}/${phoneNumberId}/messages`;
  }

  async send({waBusinessId, clientWaId, mediaFile, mediaType, caption}){
    const waConfig = await this.channelServiceAdapter.getWaConfigByWaBusinessId(waBusinessId);

    if (!waConfig) {
      console.log(`Unknown waBusinessId : ${waBusinessId} — ignoring message`);
      return null;
    }

    console.log('waBusinessId: ', waConfig.waBusinessId);
    console.log('phoneNumberId: ', waConfig.phoneNumberId);
    console.log('clientWaId: ', clientWaId);

    // Validate mediaType
    const validMediaTypes = ['image', 'video', 'audio', 'document', 'sticker'];
    if (!validMediaTypes.includes(mediaType)) {
      throw new Error(`Invalid media type: ${mediaType}. Supported types: ${validMediaTypes.join(', ')}`);
    }

    try {
      // Step 1: Upload the media file
      // Create FormData for media upload
      const form = new FormData();
      form.append('file', fs.createReadStream(mediaFile.path));
      form.append('type', mediaType);
      form.append('messaging_product', 'whatsapp');

      // Generate the upload URL
      const uploadUrl = SendMedia.generateMediaApiUrl(waConfig.phoneNumberId);
      console.log('generated upload url: ', uploadUrl);

      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${waConfig.accessToken}`,
          // Let fetch set content-type with boundary
        },
        body: form,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.text();
        throw new Error(`Failed to upload media: ${error}`);
      }

      const { id: mediaId } = await uploadRes.json();
      console.log('Media uploaded successfully with ID:', mediaId);

      // Step 2: Send the message with the media ID
      // Instead of using SendMessage, implement the sending part here directly
      
      // Remove the 'whatsapp:' prefix if it's there
      const recipientNumber = clientWaId.replace('whatsapp:', '');
      if (!recipientNumber) {
        throw new Error("Recipient number is invalid.");
      }

      // Prepare the message body
      const messageBody = {
        messaging_product: 'whatsapp',
        to: recipientNumber,
      };

      // Add media object based on type
      const mediaObject = {
        id: mediaId
      };
      
      // Add caption if provided
      if (caption) {
        mediaObject.caption = caption;
      }
      
      // Set the correct media type in the request body
      switch (mediaType) {
        case 'image':
          messageBody.image = mediaObject;
          break;
        case 'video':
          messageBody.video = mediaObject;
          break;
        case 'audio':
          messageBody.audio = mediaObject;
          break;
        case 'document':
          messageBody.document = mediaObject;
          break;
        case 'sticker':
          messageBody.sticker = mediaObject;
          break;
        default:
          throw new Error(`Unsupported media type: ${mediaType}`);
      }

      // Send the message with the media
      const messageUrl = SendMedia.generateMessageApiUrl(waConfig.phoneNumberId);
      console.log('send message url: ', messageUrl);
      
      const messageRes = await fetch(messageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${waConfig.accessToken}`,
        },
        body: JSON.stringify(messageBody),
      });

      const result = await messageRes.json();

      if (!messageRes.ok) {
        console.error('Error from WhatsApp API:', result);
        throw new Error(`WhatsApp API error: ${messageRes.status} ${result.error?.message || ''}`);
      }

      console.log('Media message sent successfully:', result);

      return {
        success: true,
        mediaId: mediaId,
        result: result,
      };
    } catch (error) {
      console.error(`Failed to send media:`, error);
      throw error;
    }
  }
}

module.exports = SendMedia;