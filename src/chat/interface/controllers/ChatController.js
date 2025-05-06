const ManageThread = require('../../application/usecase/ManageThread');
const ManageChat = require('../../application/usecase/ManageChat');
const SaveChatWithThread = require('../../application/usecase/SaveChatWithThread');

const THREAD_STATUS = require('../../../shared/constants/chatStatus');
const STATUS = require('../../../shared/constants/statusCodes');
const responseFormatter = require('../../../shared/utils/responseFormatter');

const config = require('../../../shared/utils/configs');
const Thread = require('../../domain/entities/Thread');
const ChannelServiceAdapter = require('../../service/ChannelServiceAdapter');
const WhatsAppServiceAdapter = require('../../service/WhatsAppServiceAdapter');

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
        phone_number_id,
        display_phone_number,
        client_wa_id,
        client_name,
        unread_count,
        thread_status,
        first_response_datetime,
        last_response_datetime,
        current_handler_user_id,
        internal_user_detail,
        thread_created_at,
        thread_updated_at,
        wamid,
        media_id,
        media_type,
        media_path_name,
        message,
        unread,
        reply_to,
        replied_by,
        chat_created_at,
        chat_updated_at,
      } = req.body;
  
      const waConfig = await this.channelServiceAdapter.getWaConfigByWaBusinessId(wa_business_id);
  
      if(!waConfig) {
        console.error(`Unknown waBusinessId: ${wa_business_id} — ignoring message`);
        return res.status(400).json(responseFormatter(STATUS.FAIL, 400, `Unknown waBusinessId: ${wa_business_id} — ignoring message`, null));      
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
          mediaType: media_type || this._determineMediaTypeFromFile(req.file),
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
      const updatedMediaId = (resWaApi.mediaId) ? resWaApi.mediaId : media_id;
      
      // Save chat with thread
      const result = await this.saveChatWithThread.execute({
        waBusinessId: wa_business_id ?? waConfig.waBusinessId,
        clientWaId: client_wa_id,
        clientName: client_name,
        phoneNumberId: phone_number_id,
        displayPhoneNumber: display_phone_number,
        unreadCount: unread_count,
        threadStatus: thread_status,
        firstResponseDatetime: first_response_datetime ?? timestamp,
        lastResponseDatetime: last_response_datetime ?? null,
        currentHandlerUserId: current_handler_user_id ?? null,
        internalUserDetail: internal_user_detail ?? [],
        threadCreatedAt: thread_created_at ?? timestamp,
        threadUpdatedAt: thread_updated_at ?? timestamp,
        wamid: wamid ?? (resWaApi.result?.messages && resWaApi.result.messages[0]?.id) ?? null,
        mediaId: updatedMediaId ?? null,
        mediaType: media_type ?? (req.file ? this._determineMediaTypeFromFile(req.file) : null),
        mediaPathName: media_path_name ?? (req.file ? req.file.path : null),
        message: message,
        unread: unread,
        replyTo: reply_to ?? null,
        repliedBy: replied_by ?? null,
        chatCreatedAt: chat_created_at ?? timestamp,
        chatUpdatedAt: chat_updated_at ?? timestamp,
      });
  
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
}

module.exports = ChatController;