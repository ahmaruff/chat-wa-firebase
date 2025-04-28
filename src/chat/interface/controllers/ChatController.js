const SaveChatMessage = require('../../application/usecase/SaveChatMessage');
const FindThreadByWaInfo = require('../../application/usecase/FindThreadByWaInfo');
const FindThreadById = require('../../application/usecase/FindThreadById');
const SaveThread = require('../../application/usecase/SaveThread');

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

      const chatId = await this.saveChatMessage.execute({
        id: null,
        sender: senderNumber,
        thread: threadId,
        message: messageText,
        createdAt: null,
        unread: true
      });

      if(chatId) {
        const t = await this.findThreadById.execute(threadId);
        console.log(t);
        const tData = new Thread({
          id: t.id,
          contactName: t.contactName,
          contactWaId: t.contactWaId || recipientNumber,
          displayPhoneNumber: t.displayPhoneNumber,
          startTime: t.startTime,
          endTime: t.endTime,
          lastMessage: messageText,
          status: t.status,
          waBusinessId: t.waBusinessId || waBusinessId,
          lastUpdated: null
        });
        console.log(tData);

        const updatedThread = await this.saveThread.execute(tData);
      }

      res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'chat saved successfully', {chat_id: chatId}));
    } catch (error) {
      console.error('Error saving chat:', error);
      res.status(500).json(responseFormatter(STATUS.ERROR, 500, 'Failed to save chat', null));
    }
  }
}

module.exports = ChatController;