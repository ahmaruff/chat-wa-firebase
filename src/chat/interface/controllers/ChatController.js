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

class ChatController {
  constructor(threadRepository, chatRepository) {
    this.threadRepository = threadRepository;
    this.chatRepository = chatRepository;
    this.saveChatMessage = new SaveChatMessage(chatRepository);
    this.findThreadByWaInfo = new FindThreadByWaInfo(threadRepository);
    this.findThreadById = new FindThreadById(threadRepository);
    this.saveThread = new SaveThread(threadRepository);
    this.saveChatWithThread = new SaveChatWithThread(threadRepository, chatRepository);
  }

  async save(req, res) {
    const waConfig = config.wa_config;
    const senderNumber = waConfig.display_phone_number;

    if(!senderNumber) {
      throw new Error("Whatsapp config not found");
    }

    const { waBusinessId, recipientNumber, messageText, contactName } = req.body;
    let threadId;

    try {
      const result = await this.saveChatWithThread.execute({
        id: null,
        waBusinessId: waBusinessId,
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