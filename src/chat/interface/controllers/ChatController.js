const SaveChatMessage = require('../../application/usecase/SaveChatMessage');

const responseFormatter = require('../../../shared/utils/responseFormatter');
const STATUS = require('../../../shared/constants/statusCodes');

class ChatController {
  constructor(chatRepository) {
    this.chatRepository = chatRepository;
    this.saveChatMessage = new SaveChatMessage(chatRepository);
  }

  async save(req, res) {
    try {
      const chat = await this.saveChatMessage.execute(req.body);
      res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'chat saved successfully', {chat_id: chat.id}));
    } catch (error) {
      console.error('Error saving chat:', error);
      res.status(500).json(responseFormatter(STATUS.ERROR, 500, 'Failed to save chat', null));
    }
  }
}