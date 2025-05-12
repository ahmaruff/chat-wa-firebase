const ChannelServiceAdapter = require('../../services/ChannelServiceAdapter');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { Readable } = require('stream');

const config = require('../../../shared/utils/configs');

const WHATSAPP_API_BASE_URL = config.whatsapp.api_base_url;

class SendMedia {
  constructor() {
    this.channelServiceAdapter = new ChannelServiceAdapter();
  }

  static generateMediaApiUrl(phoneNumberId) {
    return `${WHATSAPP_API_BASE_URL}/${phoneNumberId}/media`;
  }

  static generateMessageApiUrl(phoneNumberId) {
    return `${WHATSAPP_API_BASE_URL}/${phoneNumberId}/messages`;
  }

  async send({waBusinessId, clientWaId, mediaFile, mediaType, caption}) {
    const waConfig = await this.channelServiceAdapter.getWaConfigByWaBusinessId(waBusinessId);

    if (!waConfig) {
      console.log(`Unknown waBusinessId : ${waBusinessId} — ignoring message`);
      return null;
    }

    if(!waConfig.isActive) {
      console.error(`Config waBusinessId: ${wa_business_id} INACTIVE — ignoring message`);
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
      // Read file as buffer
      const fileBuffer = fs.readFileSync(mediaFile.path);
      
      // Create a form data instance
      const form = new FormData();
      
      // Add all required fields exactly as shown in Postman
      form.append('messaging_product', 'whatsapp');
      form.append('type', mediaType);
      
      // Create a readable stream from buffer (to avoid DelayedStream issues)
      const fileStream = new Readable();
      fileStream.push(fileBuffer);
      fileStream.push(null); // End of stream
      
      form.append('file', fileStream, {
        filename: path.basename(mediaFile.path),
        contentType: mediaFile.mimetype || 'image/png'
      });
      
      // Generate the upload URL
      const uploadUrl = SendMedia.generateMediaApiUrl(waConfig.phoneNumberId);
      console.log('Generated upload URL: ', uploadUrl);
      
      // Use Node.js http/https modules directly to avoid fetch issues with form-data
      const https = require('https');
      const url = new URL(uploadUrl);
      
      // Create a promise to handle the request
      const uploadPromise = new Promise((resolve, reject) => {
        const req = https.request({
          method: 'POST',
          hostname: url.hostname,
          path: url.pathname + url.search,
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${waConfig.getToken()}`
          }
        }, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            console.log('Response status:', res.statusCode);
            console.log('Response data:', data);
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(new Error(`Failed to parse response: ${data}`));
              }
            } else {
              reject(new Error(`Failed to upload media: ${data}`));
            }
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        // Pipe the form to the request
        form.pipe(req);
      });
      
      // Wait for upload to complete
      const uploadResponse = await uploadPromise;
      const mediaId = uploadResponse.id;
      console.log('Media uploaded successfully with ID:', mediaId);
      
      // Step 2: Send the message with the media ID
      // Remove the 'whatsapp:' prefix if it's there
      const recipientNumber = clientWaId.replace('whatsapp:', '');
      if (!recipientNumber) {
        throw new Error("Recipient number is invalid.");
      }

      // Prepare the message body
      const messageBody = {
        messaging_product: 'whatsapp',
        to: recipientNumber,
        type: mediaType
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
        case 'text':
          messageBody.text = { body: caption || '' };
          break;
        default:
          throw new Error(`Unsupported media type: ${mediaType}`);
      }

      // Send the message with the media
      const messageUrl = SendMedia.generateMessageApiUrl(waConfig.phoneNumberId);
      console.log('Send message URL: ', messageUrl);
      
      // Use fetch for the JSON request (which works fine)
      const messageRes = await fetch(messageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${waConfig.getToken()}`,
        },
        body: JSON.stringify(messageBody),
      });

      console.log('Message response status: ', messageRes.status);
      
      const result = await messageRes.json();
      console.log('Message response body: ', result);

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