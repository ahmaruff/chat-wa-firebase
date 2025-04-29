const ChatServiceInterface = require('../interface/services/ChatServiceInterface');
const SaveChatWithThread = require('../application/usecase/SaveChatWithThread');
const ThreadRepository = require('../infrastructure/FirestoreThreadRepository');

class ChatService extends ChatServiceInterface {
  constructor() {
    this.threadRepository = new ThreadRepository();
    this.saveChatWithThread = new SaveChatWithThread(this.threadRepository);
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
