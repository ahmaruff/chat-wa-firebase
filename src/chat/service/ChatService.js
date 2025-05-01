const ChatServiceInterface = require('../interface/services/ChatServiceInterface');
const SaveChatWithThread = require('../application/usecase/SaveChatWithThread');
const FirestoreThreadRepository = require('../infrastructure/FirestoreThreadRepository');
const FirestoreChatRepository = require('../infrastructure/FirestoreChatRepository');

class ChatService extends ChatServiceInterface {
  constructor() {
    super();
    this.threadRepository = new FirestoreThreadRepository();
    this.chatRepository = new FirestoreChatRepository();
    this.saveChatWithThread = new SaveChatWithThread(this.threadRepository, this.chatRepository);
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

      console.log('chat ext:', result);

      return result;
    } catch (error) {
      console.log('Error create chat from external source: ', error);
      throw error;
    }
  }
}

module.exports = ChatService;
