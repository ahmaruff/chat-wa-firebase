const SaveChatMessage = require('../../application/usecase/SaveChatMessage');
const FindThreadByWaInfo = require('../../application/usecase/FindThreadByWaInfo');
const SaveThread = require('../../application/usecase/SaveThread');

const ChatRepository = require('../../domain/repositories/ChatRepository');
const ThreadRepository = require('../../domain/repositories/ThreadRepository');

const THREAD_STATUS = require('../../../shared/constants/chatStatus');
const STATUS = require('../../../shared/constants/statusCodes');
const responseFormatter = require('../../../shared/utils/responseFormatter');

const config = require('../../../shared/utils/configs');

class ChatController {
  constructor(threadRepository, chatRepository) {
    this.threadRepository = threadRepository;
    this.chatRepository = chatRepository;
    this.saveChatMessage = new SaveChatMessage(chatRepository);
    this.findThreadByWaInfo = new FindThreadByWaInfo(threadRepository);
    this.saveThread = new SaveThread(threadRepository);
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
      const existingThread = await this.findThreadByWaInfo.execute({
        waBusinessId,
        contactWaId: recipientNumber
      });

      if (!existingThread) {
        await this.saveThread.execute({
          id,
          contactName,
          contactWaId: recipientNumber,
          displayPhoneNumber: waBusinessId,
          waBusinessId,
          lastMessage: messageText,
          lastUpdated: null,
          status: THREAD_STATUS.QUEUE,
          startTime: null,
          endTime: null,
        });

        const newThread = await this.findThreadByWaInfo.execute({
          waBusinessId,
          contactWaId: recipientNumber
        });

        threadId = newThread.id;
      } else {
        threadId = existingThread.id;
      }

      const chat = await this.saveChatMessage.execute(null, senderNumber, threadId, message, null, true);
      res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'chat saved successfully', {chat_id: chat.id}));
    } catch (error) {
      console.error('Error saving chat:', error);
      res.status(500).json(responseFormatter(STATUS.ERROR, 500, 'Failed to save chat', null));
    }
  }
}

module.exports = ChatController;