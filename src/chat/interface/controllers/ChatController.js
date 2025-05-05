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

  async saveNew(req, res) {
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
      message,
      reply_to,
      replied_by,
    } = req.body;

    const waChannelResult = await this.channelServiceAdapter.getWhatsappChannel(wa_business_id);

    if(!waChannelResult) {
      console.error(`Unknown WABA ID: ${wa_business_id} — ignoring message`);
      return res.status(400).json(responseFormatter(STATUS.FAIL, 400, `Unknown WABA ID: ${wa_business_id} — ignoring message`, null));      
    }

  }

  async save(req, res) {
    const { waBusinessId, recipientNumber, messageText, contactName, repliedBy, replyTo, chatId = null, contactWaId = null, status = null, endTime } = req.body;

    const waChannelResult = await this.channelServiceAdapter.getWhatsappChannel(waBusinessId);

    if(!waChannelResult) {
      console.warn(`Unknown WABA ID: ${waBusinessId} — ignoring message`);
      return res.status(400).json(responseFormatter(STATUS.FAIL, 400, `Unknown WABA ID: ${waBusinessId} — ignoring message`, null));      
    }

    const waChannel = waChannelResult.whatsappChannel;
    const wabaId = waChannelResult.whatsAppBusinessId;
    const senderNumber = waChannel.displayPhoneNumber;

    try {
      const waApiRes = await this.whatsAppServiceAdapter.sendToWhatsapApi({
        waBusinessId: wabaId,
        recipientNumber: recipientNumber,
        messageText: messageText,
      });
      // const waApiRes = await  this.sendMessage.send({
      //   waBusinessId: whatsappMessage.waBusinessAccountId,
      //   recipientNumber: whatsappMessage.phoneNumberId,
      //   messageText: whatsappMessage.body
      // });

      console.log('wa response: ', waApiRes);
      
      
      const result = await this.saveChatWithThread.execute({
        id: null,
        chatId: chatId,
        repliedBy: repliedBy || null,
        replyTo: replyTo || null,
        waBusinessId: wabaId,
        recipientNumber: recipientNumber,
        displayPhoneNumber: senderNumber,
        messageText: messageText,
        contactName: contactName || 'Unknown',
        sender: senderNumber,
        unread: true,
        contactWaId: contactWaId,
        createdAt: Date.now(),
        status: status,
        endTime: endTime || null
      });
      
      res.status(200).json(
        responseFormatter(
          STATUS.SUCCESS, 
          200, 
          'Chat saved successfully', 
          {
            chat_id: result.chatId,
            thread_id: result.threadId,
            is_new_thread: result.isNewThread
          }
        )
      );
    } catch (error) {
      console.error('Error saving chat:', error);
      res.status(500).json(responseFormatter(STATUS.ERROR, 500, 'Failed to save chat', null));
    }
  }
}

module.exports = ChatController;