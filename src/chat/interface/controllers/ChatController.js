const ManageThread = require('../../application/usecase/ManageThread');
const ManageChat = require('../../application/usecase/ManageChat');
const SaveChatWithThread = require('../../application/usecase/SaveChatWithThread');

const THREAD_STATUS = require('../../../shared/constants/chatStatus');
const STATUS = require('../../../shared/constants/statusCodes');
const CHAT_DIRECTION = require('../../../shared/constants/chatDirection');
const responseFormatter = require('../../../shared/utils/responseFormatter');

const ChannelServiceAdapter = require('../../service/ChannelServiceAdapter');
const WhatsAppServiceAdapter = require('../../service/WhatsAppServiceAdapter');
const path = require('path');

class ChatController {
  constructor(threadRepository, chatRepository) {
    this.threadRepository = threadRepository;
    this.chatRepository = chatRepository;
    this.manageChat = new ManageChat(this.chatRepository);
    this.manageThread = new ManageThread(this.threadRepository);
    this.saveChatWithThread = new SaveChatWithThread(threadRepository, chatRepository);
    this.channelServiceAdapter = new ChannelServiceAdapter();
    this.whatsAppServiceAdapter = new WhatsAppServiceAdapter(); 
  }

  async save(req, res) {
    try {
      const {
        wa_business_id,
        client_wa_id,
        client_name,
        current_handler_user_id,
        internal_user_detail,
        message,
        unread,
        reply_to,
        replied_by,
      } = req.body;

      const parsedUnread = (unread === 'false' || unread === false) ? false : true;
  
      const waConfig = await this.channelServiceAdapter.getWaConfigByWaBusinessId(wa_business_id);
  
      if(!waConfig) {
        console.error(`Unknown waBusinessId: ${wa_business_id} — ignoring message`);
        return res.status(400).json(responseFormatter(STATUS.FAIL, 400, `Unknown waBusinessId: ${wa_business_id} — ignoring message`, null));      
      }

      if(!waConfig.isActive) {
        console.error(`Config waBusinessId: ${wa_business_id} INACTIVE — ignoring message`);
        return res.status(400).json(responseFormatter(STATUS.FAIL, 400, `Config waBusinessId: ${wa_business_id} INACTIVE — ignoring message`, null));      
      }
  
      const timestamp = Date.now();
      
      let resWaApi;
      // Check if there's a media file from multer middleware
      if (req.file && req.file.path) {
        // This is a media message
        resWaApi = await this.whatsAppServiceAdapter.sendMediaToWhatsapApi({
          waBusinessId: wa_business_id ?? waConfig.waBusinessId,
          clientWaId: client_wa_id,
          mediaFile: req.file,
          mediaType: this._determineMediaTypeFromFile(req.file),
          caption: message || '' // Use message as caption if provided
        });
      } else {
        // This is a text message
        resWaApi = await this.whatsAppServiceAdapter.sendToWhatsapApi({
          waBusinessId: wa_business_id ?? waConfig.waBusinessId, 
          clientWaId: client_wa_id, 
          messageText: message
        });
      }

      // If resWaApi failed, throw an error
      if (!resWaApi || !resWaApi.success) {
        console.error('Failed to send message to WhatsApp API:', resWaApi);
        throw new Error('Failed to send message to WhatsApp API');
      }

      // Update media_id if it was returned from the WhatsApp API
      const updatedMediaId = (resWaApi.mediaId) ? resWaApi.mediaId : null;

      console.log(`Getting thread for waBusinessId: ${wa_business_id}, clientWaId: ${client_wa_id}`);
      const t = await this.manageThread.getByWhatsappInfo(wa_business_id, client_wa_id);

      // Log thread yang ditemukan untuk debugging
      console.log('Thread found in controller:', {
        found: !!t,
        id: t?.id,
        status: t?.status
      });

      // Save chat with thread dengan parameter yang konsisten
      const result = await this.saveChatWithThread.execute({
        waBusinessId: wa_business_id ?? waConfig.waBusinessId,
        clientWaId: client_wa_id,
        clientName: client_name,
        phoneNumberId: waConfig.phoneNumberId,
        displayPhoneNumber: waConfig.displayPhoneNumber,
        unreadCount: t?.unreadCount ?? 0,
        threadStatus: t?.status ?? THREAD_STATUS.QUEUE,
        firstResponseDatetime: t?.firstResponseDatetime ?? null,
        lastResponseDatetime: t?.lastResponseDatetime ?? null,
        currentHandlerUserId: current_handler_user_id ?? t?.currentHandlerUserId ?? null,
        internalUserDetail: internal_user_detail ?? t?.internalUserDetail ?? [],
        threadCreatedAt: t?.createdAt ?? timestamp,
        threadUpdatedAt: timestamp,
        wamid: (resWaApi.result?.messages && resWaApi.result.messages[0]?.id) ?? null,
        mediaId: updatedMediaId ?? null,
        mediaType: (req.file ? this._determineMediaTypeFromFile(req.file) : null),
        mediaPathName: this._determineFilePathName(req),
        message: message || '',
        unread: parsedUnread,
        replyTo: reply_to ?? null,
        repliedBy: replied_by ?? null,
        chatCreatedAt: timestamp,
        chatUpdatedAt: timestamp,
        chatDirection: CHAT_DIRECTION.OUTBOUND,
        sender: waConfig.displayPhoneNumber,
      });
      console.log('save chat to thread:', result);
  
      return res.status(200).json(
        responseFormatter(
          STATUS.SUCCESS, 
          200, 
          'Chat saved successfully', 
          {
            chat_id: result.chat.id,
            wamid: result.chat.wamid,
            thread_id: result.thread.id,
            is_new_thread: result.isNewThread,
            media_id: updatedMediaId
          }
        )
      );
      
    } catch (error) {
      console.error('Error saving chat:', error);
      return res.status(500).json(responseFormatter(STATUS.ERROR, 500, error.message, null));
    }
  }
  
  /**
   * Determine media type from file mimetype
   * @param {Object} file - File object from multer
   * @returns {string} - WhatsApp media type
   * @private
   */
  _determineMediaTypeFromFile(file) {
    const mimetype = file.mimetype;
    
    if (mimetype.startsWith('image/')) {
      return mimetype === 'image/webp' ? 'sticker' : 'image';
    } else if (mimetype.startsWith('video/')) {
      return 'video';
    } else if (mimetype.startsWith('audio/')) {
      return 'audio';
    } else {
      return 'document';
    }
  }

  _determineFilePathName(req) {
    if(req.file) {
      const mime = this._determineMediaTypeFromFile(req.file);
      if(mime == 'document') {
        return path.basename(req.file.path) ?? null;
      }
      return req.file.mimetype ?? null;
    }
    return null;
  }
  
  /**
   * Send a media message via WhatsApp
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendMedia(req, res) {
    try {
      const { wa_business_id, client_wa_id, media_type, caption } = req.body;
      
      // Check if there's a file upload
      if (!req.file) {
        return res.status(400).json(
          responseFormatter(STATUS.FAIL, 400, 'No media file uploaded', null)
        );
      }
      
      const waConfig = await this.channelServiceAdapter.getWaConfigByWaBusinessId(wa_business_id);
      
      if(!waConfig) {
        console.error(`Unknown waBusinessId: ${wa_business_id} — ignoring message`);
        return res.status(400).json(
          responseFormatter(STATUS.FAIL, 400, `Unknown waBusinessId: ${wa_business_id} — ignoring message`, null)
        );      
      }

      if(!waConfig.isActive) {
        console.error(`Config waBusinessId: ${wa_business_id} INACTIVE — ignoring message`);
        return res.status(400).json(responseFormatter(STATUS.FAIL, 400, `Config waBusinessId: ${wa_business_id} INACTIVE — ignoring message`, null));      
      }
      
      // Determine media type if not provided
      const determinedMediaType = media_type || this._determineMediaTypeFromFile(req.file);
      
      // Send media message
      const result = await this.whatsAppServiceAdapter.sendMediaToWhatsapApi({
        waBusinessId: wa_business_id,
        clientWaId: client_wa_id,
        mediaFile: req.file,
        mediaType: determinedMediaType,
        caption: caption || ''
      });
      
      if (!result || !result.success) {
        throw new Error('Failed to send media message to WhatsApp API');
      }
      
      return res.status(200).json(
        responseFormatter(
          STATUS.SUCCESS,
          200,
          'Media message sent successfully',
          {
            media_id: result.mediaId,
            wamid: result.result?.messages && result.result.messages[0]?.id
          }
        )
      );
      
    } catch (error) {
      console.error('Error sending media message:', error);
      return res.status(500).json(
        responseFormatter(STATUS.ERROR, 500, error.message, null)
      );
    }
  }

  /**
   * Get media information with proxy URL
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMediaInfo(req, res) {
    try {
      const { mediaId } = req.params;
      const { wa_business_id } = req.query;

      // Validate required parameters
      if (!mediaId || !wa_business_id) {
        return res.status(400).json(
          responseFormatter(STATUS.FAIL, 400, 'Missing required parameters: mediaId, wa_business_id', null)
        );
      }

      const waConfig = await this.channelServiceAdapter.getWaConfigByWaBusinessId(wa_business_id);

      if (!waConfig) {
        console.error(`Unknown waBusinessId: ${wa_business_id} — ignoring request`);
        return res.status(400).json(
          responseFormatter(STATUS.FAIL, 400, `Unknown waBusinessId: ${wa_business_id} — ignoring request`, null)
        );
      }

      if(!waConfig.isActive) {
        console.error(`Config waBusinessId: ${wa_business_id} INACTIVE — ignoring message`);
        return res.status(400).json(responseFormatter(STATUS.FAIL, 400, `Config waBusinessId: ${wa_business_id} INACTIVE — ignoring message`, null));      
      }

      // Generate base URL for proxy
      const baseUrl = `${req.protocol}://${req.get('host')}/api/chats`;

      // Get media info using the adapter
      const mediaInfo = await this.whatsAppServiceAdapter.getMediaInfo({
        waBusinessId: wa_business_id,
        mediaId,
        baseUrl
      });

      // Set cache headers for better performance
      res.setHeader('Cache-Control', 'public, max-age=3600');

      return res.status(200).json(
        responseFormatter(
          STATUS.SUCCESS,
          200,
          'Media info retrieved successfully',
          mediaInfo
        )
      );
    } catch (error) {
      console.error('Error getting media info:', error);

      // Handle specific error cases
      if (error.message.includes('Unknown waBusinessId')) {
        return res.status(400).json(
          responseFormatter(STATUS.FAIL, 400, error.message, null)
        );
      }

      if (error.message.includes('Media URL not found')) {
        return res.status(404).json(
          responseFormatter(STATUS.FAIL, 404, error.message, null)
        );
      }

      return res.status(500).json(
        responseFormatter(STATUS.ERROR, 500, error.message, null)
      );
    }
  }

  /**
   * Stream media content to client
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async proxyMedia(req, res) {
    try {
      const { mediaId } = req.params;
      const { wa_business_id } = req.query;

      // Validate required parameters
      if (!mediaId || !wa_business_id) {
        return res.status(400).json(
          responseFormatter(STATUS.FAIL, 400, 'Missing required parameters: mediaId, wa_business_id', null)
        );
      }

      const waConfig = await this.channelServiceAdapter.getWaConfigByWaBusinessId(wa_business_id);

      if (!waConfig) {
        console.error(`Unknown waBusinessId: ${wa_business_id} — ignoring request`);
        return res.status(400).json(
          responseFormatter(STATUS.FAIL, 400, `Unknown waBusinessId: ${wa_business_id} — ignoring request`, null)
        );
      }

      if(!waConfig.isActive) {
        console.error(`Config waBusinessId: ${wa_business_id} INACTIVE — ignoring message`);
        return res.status(400).json(responseFormatter(STATUS.FAIL, 400, `Config waBusinessId: ${wa_business_id} INACTIVE — ignoring message`, null));      
      }

      // Stream media directly to response using the adapter
      await this.whatsAppServiceAdapter.streamMedia({
        waBusinessId: wa_business_id,
        mediaId,
        responseStream: res
      });

      // The response is handled by the streaming process
      // No need to return anything here as the stream handles the response
    } catch (error) {
      console.error('Error proxying media:', error);

      // Handle specific error cases
      if (error.message.includes('Unknown waBusinessId')) {
        return res.status(400).json(
          responseFormatter(STATUS.FAIL, 400, error.message, null)
        );
      }

      if (error.message.includes('Media URL not found')) {
        return res.status(404).json(
          responseFormatter(STATUS.FAIL, 404, error.message, null)
        );
      }

      // Don't send headers if they're already sent by the streaming process
      if (!res.headersSent) {
        return res.status(500).json(
          responseFormatter(STATUS.ERROR, 500, error.message, null)
        );
      }
    }
  }

  async getThread(req, res) {
    try {
      const {
        wa_business_id,
        client_wa_id,
      } = req.body;
  
      const x = await this.manageThread.getByWhatsappInfo(wa_business_id, client_wa_id);
  
      return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'get thread succes', {
        thread: x
      }));
    } catch (error) {
      return res.status(500).json(
        responseFormatter(STATUS.ERROR, 500, error.message, null)
      );
    }
  }
}

module.exports = ChatController;