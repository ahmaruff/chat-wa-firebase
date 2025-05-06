const Chat = require('../../domain/entities/Chat');
const Thread = require('../../domain/entities/Thread');
const InternalUserDetail = require('../../domain/valueObjects/InternalUserDetail');

const THREAD_STATUS = require('../../../shared/constants/chatStatus');

class SaveChatWithThread {
  constructor(threadRepository, chatRepository) {
    this.threadRepository = threadRepository;
    this.chatRepository = chatRepository;
  }

  async execute({
    waBusinessId,
    phoneNumberId,
    displayPhoneNumber,
    clientWaId,
    clientName,
    unreadCount,
    threadStatus,
    firstResponseDatetime = Date.now(),
    lastResponseDatetime = null,
    currentHandlerUserId = null,
    internalUserDetail = [],
    threadCreatedAt = Date.now(),
    threadUpdatedAt = Date.now(),
    wamid = null,
    mediaId = null,
    mediaType = null,
    mediaPathName = null,
    message,
    unread = true,
    replyTo,
    repliedBy,
    chatCreatedAt = Date.now(),
    chatUpdatedAt = Date.now(),
  }){

    let isNewThread = false;
    let originalThread = null;
    let thread = null;

    const rawInternalUserDetail = internalUserDetail ?? [];
    const internalUserDetailObj = rawInternalUserDetail.map(item =>
      item instanceof InternalUserDetail ? item : InternalUserDetail.fromJson(item)
    );

    try {
      thread = await this.threadRepository.getByWhatsappInfo(waBusinessId, clientWaId);

      if(!thread) {
        isNewThread  = true;
        thread = new Thread({
          id: null,
          waBusinessId: waBusinessId,
          phoneNumberId: phoneNumberId,
          displayPhoneNumber: displayPhoneNumber,
          clientWaId: clientWaId,
          clientName: clientName,
          unreadCount: unreadCount ?? 0,
          status: threadStatus,
          lastMessageMediaType: mediaType,
          lastMessage: message,
          firstResponseDatetime: firstResponseDatetime ?? Date.now(),
          lastResponseDatetime: lastResponseDatetime ?? null,
          currentHandlerUserId: currentHandlerUserId ?? null,
          internalUserDetail: internalUserDetailObj,
          createdAt:  threadCreatedAt ?? Date.now(),
          updatedAt: threadUpdatedAt ?? Date.now(),
        });

        const t = await this.threadRepository.save(thread);
        thread = t;
      } else {
        isNewThread = false;
        originalThread = thread.toJson();
        const updatedThread = new Thread({
          id: thread.id,
          waBusinessId: waBusinessId ?? thread.waBusinessId,
          clientWaId: clientWaId ?? thread.clientWaId,
          clientName: clientName ?? thread.clientName,
          phoneNumberId: phoneNumberId ?? thread.phoneNumberId,
          displayPhoneNumber: displayPhoneNumber ?? thread.displayPhoneNumber,
          unreadCount: unreadCount ?? thread.unreadCount,
          status: threadStatus ?? thread.status,
          lastMessageMediaType: mediaType ?? thread.lastMessageMediaType,
          lastMessage: message ?? thread.lastMessage,
          firstResponseDatetime: firstResponseDatetime ?? thread.firstResponseDatetime,
          lastResponseDatetime: lastResponseDatetime ?? thread.lastResponseDatetime,
          currentHandlerUserId: currentHandlerUserId ?? thread.currentHandlerUserId,
          internalUserDetail: internalUserDetail ?? thread.internalUserDetail,
          createdAt: threadCreatedAt ?? thread.createdAt,
          updatedAt: threadUpdatedAt ?? thread.updatedAt
        });

        const t = await this.threadRepository.save(updatedThread);
        thread = t;
      }  

      const chat = new Chat({
        id: null,
        threadId: thread.id,
        phoneNumberId: phoneNumberId,
        clientWaId: clientWaId,
        wamid: wamid ?? null,
        mediaId: mediaId ?? null,
        mediaType: mediaType ?? null,
        mediaPathName: mediaPathName ?? null,
        message: message,
        unread: unread ?? true,
        replyTo: replyTo ?? null,
        repliedBy: repliedBy ?? null,
        createdAt: chatCreatedAt ?? Date.now(),
        updatedAt: chatUpdatedAt ?? Date.now(),
      });

      const chatRes = await this.chatRepository.save(chat);
  
      return {
        chat : chatRes,
        thread: thread,
        isNewThread: isNewThread
      }; 

    } catch (error) {
      if (isNewThread && thread.id) {
        await this.threadRepository.delete(thread.id);
        console.log(`New thread ${thread.id} would be deleted due to chat save failure`);
      } else if (originalThread) {
        const t = Thread.fromJson(originalThread);
        await this.threadRepository.save(t);
        console.log(`Thread ${t.id} reverted to original state due to chat save failure`);
      }
      
      throw error;
    }
  }
}

module.exports = SaveChatWithThread;