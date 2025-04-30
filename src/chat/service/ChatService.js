const ChatServiceInterface = require('../interface/services/ChatServiceInterface');
const SaveChatWithThread = require('../application/usecase/SaveChatWithThread');
const ThreadRepository = require('../infrastructure/FirestoreThreadRepository');

class ChatService extends ChatServiceInterface {
  constructor() {
    super();
    this.threadRepository = new ThreadRepository();
    this.saveChatWithThread = new SaveChatWithThread(this.threadRepository);
  }

  async createChatFromExternalSource({ chatId, senderNumber,  recipientNumber, contactName, messageText, waBusinessId, status, unread, displayPhoneNumber, createdAt, replyTo, repliedBy }) {
    try {
      const result = await this.saveChatWithThread.execute({
        chatId: chatId,
        sender: senderNumber,
        recipientNumber: recipientNumber,
        contactName: contactName,
        messageText: messageText,
        waBusinessId: waBusinessId,
        status: status,
        unread: unread,
        displayPhoneNumber: displayPhoneNumber,
        createdAt: createdAt,
        replyTo: replyTo,
        repliedBy: repliedBy
      });

      return result;
    } catch (error) {
      console.log('Error create chat from external source: ', error);
      throw error;
    }
  }
}

module.exports = ChatService;
