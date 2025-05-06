const SaveChatWithThread = require('../application/usecase/SaveChatWithThread');
const FirestoreThreadRepository = require('../infrastructure/FirestoreThreadRepository');
const FirestoreChatRepository = require('../infrastructure/FirestoreChatRepository');

class ChatService {
  constructor() {
    this.threadRepository = new FirestoreThreadRepository();
    this.chatRepository = new FirestoreChatRepository();
    this.saveChatWithThread = new SaveChatWithThread(this.threadRepository, this.chatRepository);
  }

  async createChatFromExternalSource({
    waBusinessId,
    clientWaId,
    clientName,
    phoneNumberId,
    displayPhoneNumber,
    unreadCount,
    threadStatus,
    firstResponseDatetime,
    lastResponseDatetime,
    currentHandlerUserId,
    internalUserDetail,
    threadCreatedAt,
    threadUpdatedAt,
    wamid,
    mediaId,
    mediaType,
    mediaPathName,
    message,
    unread,
    replyTo,
    repliedBy,
    chatCreatedAt,
    chatUpdatedAt
  }) {
    try {
      const result = await this.saveChatWithThread.execute({
        waBusinessId: waBusinessId,
        clientWaId: clientWaId,
        clientName: clientName,
        phoneNumberId: phoneNumberId,
        displayPhoneNumber: displayPhoneNumber,
        unreadCount: unreadCount,
        threadStatus: threadStatus,
        firstResponseDatetime: firstResponseDatetime,
        lastResponseDatetime: lastResponseDatetime,
        currentHandlerUserId: currentHandlerUserId,
        internalUserDetail: internalUserDetail ?? [],
        threadCreatedAt: threadCreatedAt,
        threadUpdatedAt: threadUpdatedAt,
        wamid: wamid,
        mediaId: mediaId,
        mediaType : mediaType,
        mediaPathName: mediaPathName,
        message : message,
        unread: unread ?? true,
        replyTo: replyTo ?? null,
        repliedBy: repliedBy ?? null,
        chatCreatedAt: chatCreatedAt,
        chatUpdatedAt: chatUpdatedAt
      });

      console.log('success create chat from external source:', result);

      return result;
    } catch (error) {
      console.error('Error create chat from external source:', error);
      throw error;
    }
  }
}

module.exports = ChatService;
