const ChatServiceInterface = require('../interface/services/ChatServiceInterface');
const SaveChatWithThread = require('../application/usecase/SaveChatWithThread');

class ChatService extends ChatServiceInterface {
  constructor(threadRepository) {
    this.threadRepository = threadRepository;
    this.saveChatWithThread = new SaveChatWithThread(threadRepository);
  }

  async createChatFromExternalSource({ waBusinessId, recipientNumber, messageText, contactName }) {
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
  
      return result;
    } catch (error) {
      console.log('Error create chat from external source: ', error);
      throw error;
    }
  }
}

module.exports = ChatService;
