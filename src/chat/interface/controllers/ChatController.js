const SaveChatMessage = require('../../application/usecase/SaveChatMessage');
const FindThreadByWaInfo = require('../../application/usecase/FindThreadByWaInfo');
const FindThreadById = require('../../application/usecase/FindThreadById');
const SaveThread = require('../../application/usecase/SaveThread');
const SaveChatWithThread = require('../../application/usecase/SaveChatWithThread');

const ChatRepository = require('../../domain/repositories/ChatRepository');
const ThreadRepository = require('../../domain/repositories/ThreadRepository');

const THREAD_STATUS = require('../../../shared/constants/chatStatus');
const STATUS = require('../../../shared/constants/statusCodes');
const responseFormatter = require('../../../shared/utils/responseFormatter');

const config = require('../../../shared/utils/configs');
const Thread = require('../../domain/entities/Thread');
const ChannelServiceAdapter = require('../../service/ChannelServiceAdapter');

class ChatController {
  constructor(threadRepository, chatRepository) {
    this.threadRepository = threadRepository;
    this.chatRepository = chatRepository;
    this.saveChatMessage = new SaveChatMessage(chatRepository);
    this.findThreadByWaInfo = new FindThreadByWaInfo(threadRepository);
    this.findThreadById = new FindThreadById(threadRepository);
    this.saveThread = new SaveThread(threadRepository);
    this.saveChatWithThread = new SaveChatWithThread(threadRepository, chatRepository);
    this.channelServiceAdapter = new ChannelServiceAdapter();
  }

  async save(req, res) {
    const { waBusinessId, recipientNumber, messageText, contactName, repliedBy, replyTo } = req.body;

    const waChannelResult = this.channelServiceAdapter.getWhatsappChannel(waBusinessId);

    if(!waChannelResult) {
      console.warn(`Unknown WABA ID: ${waBusinessId} — ignoring message`);
      return res.status(400).json(responseFormatter(STATUS.FAIL, 400, `Unknown WABA ID: ${waBusinessId} — ignoring message`, null));      
    }

    const waChannel = waChannelResult.whatsappChannel;
    const wabaId = waChannelResult.whatsAppBusinessId;
    const senderNumber = waChannel.displayPhoneNumber;

    try {
      const result = await this.saveChatWithThread.execute({
        id: null,
        chatId: null,
        repliedBy: repliedBy || null,
        replyTo: replyTo || null,
        waBusinessId: wabaId,
        recipientNumber: recipientNumber,
        displayPhoneNumber: senderNumber,
        messageText: messageText,
        contactName: contactName || 'Unknown',
        sender: senderNumber,
        unread: true
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