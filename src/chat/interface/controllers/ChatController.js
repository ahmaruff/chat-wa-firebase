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
        client_wa_id,
        client_name,
        client_phone_number_id,
        client_display_phone_number,
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
  
      // abis ini call ke wa api
  
      // terus call ke save thread
      const res = await this.saveChatWithThread.execute({
        waBusinessId: wa_business_id ?? waConfig.waBusinessId,
        clientWaId: client_wa_id,
        clientName: client_name,
        clientPhoneNumberId: client_phone_number_id,
        clientDisplayPhoneNumber: client_display_phone_number,
        unreadCount: unread_count,
        threadStatus: thread_status,
        firstResponseDatetime: first_response_datetime ?? timestamp,
        lastResponseDatetime: last_response_datetime ?? null,
        currentHandlerUserId: current_handler_user_id ?? null,
        internalUserDetail: internal_user_detail ?? [],
        threadCreatedAt: thread_created_at ?? timestamp,
        threadUpdatedAt: thread_updated_at ?? timestamp,
        wamid: wamid ?? null,
        mediaId: media_id ?? null,
        mediaType: media_type ?? null,
        mediaPathName: media_path_name ?? null,
        message: message,
        unread: unread,
        replyTo: reply_to ?? null,
        repliedBy: replied_by ?? null,
        chatCreatedAt: chat_created_at ?? timestamp,
        chatUpdatedAt: chat_updated_at ?? timestamp,
      });
  
      res.status(200).json(
        responseFormatter(
          STATUS.SUCCESS, 
          200, 
          'Chat saved successfully', 
          {
            chat_id: res.chat.id,
            wamid: res.chat.wamid,
            thread_id: res.thread.id,
            is_new_thread : res.isNewThread,
          }
        )
      );
      
    } catch (error) {
      console.error('Error saving chat:', error);
      res.status(500).json(responseFormatter(STATUS.ERROR, 500, error.message, null));
    }
  }
}

module.exports = ChatController;