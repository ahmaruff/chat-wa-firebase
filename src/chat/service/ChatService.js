const SaveChatWithThread = require('../application/usecase/SaveChatWithThread');
const FirestoreThreadRepository = require('../infrastructure/FirestoreThreadRepository');
const FirestoreChatRepository = require('../infrastructure/FirestoreChatRepository');
const Thread = require('../domain/entities/Thread');
const ManageThread = require('../application/usecase/ManageThread');
const ManageChat = require('../application/usecase/ManageChat');
const InternalUserDetail = require('../domain/valueObjects/InternalUserDetail');


const THREAD_STATUS = require('../../shared/constants/chatStatus');

class ChatService {
  constructor() {
    this.threadRepository = new FirestoreThreadRepository();
    this.chatRepository = new FirestoreChatRepository();
    this.saveChatWithThread = new SaveChatWithThread(this.threadRepository, this.chatRepository);
    this.manageThread = new ManageThread(this.threadRepository);
    this.manageChat = new ManageChat(this.chatRepository);
  }

  async createThread({
    waBusinessId,
    phoneNumberId,
    displayPhoneNumber,
    clientWaId,
    clientName,
    unreadCount = 0,
    status = THREAD_STATUS.QUEUE,
    lastMessageMediaType,
    lastMessage,
    firstResponseDatetime,
    lastResponseDatetime,
    currentHandlerUserId,
    internalUserDetail = [],
    createdAt = Date.now(),
    updatedAt = Date.now(),
  }) {
    try {
      const rawInternalUserDetail = internalUserDetail ?? [];
      const internalUserDetailObj = rawInternalUserDetail.map(item =>
        item instanceof InternalUserDetail ? item : InternalUserDetail.fromJson(item)
      );

      const t = new Thread({
        id: null,
        waBusinessId: waBusinessId,
        phoneNumberId: phoneNumberId,
        displayPhoneNumber: displayPhoneNumber,
        clientWaId: clientWaId,
        clientName: clientName,
        unreadCount: unreadCount,
        status: status,
        lastMessageMediaType: lastMessageMediaType,
        lastMessage: lastMessage,
        firstResponseDatetime: firstResponseDatetime,
        lastResponseDatetime: lastResponseDatetime,
        currentHandlerUserId: currentHandlerUserId,
        internalUserDetail: internalUserDetailObj,
        createdAt: createdAt,
        updatedAt: updatedAt,
      });

      const result = await this.manageThread.save(t);
    } catch (error) {
      console.error('Error create thread:', error);
      throw error;
    }
  }
  
  async getThread(waBusinessId, clientWaId) {
    try {
      const result = await this.manageThread.getByWhatsappInfo(waBusinessId, clientWaId);

      return result;
    } catch (error) {
      console.error('Error get thread:', error);
      throw error;
    }
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

  async markAsRead(wamid){
    try {
      const result = await this.manageChat.markAsReadByWamid(wamid);

      return result;
    } catch (error) {
      console.error('Error marking as read chat by wamid:', error);
      throw error;
    }
  }
}

module.exports = ChatService;
