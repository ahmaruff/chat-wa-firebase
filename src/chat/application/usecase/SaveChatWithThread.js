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
    firstResponseDatetime,
    lastResponseDatetime = null,
    currentHandlerUserId = null,
    internalUserDetail = [],
    threadCreatedAt,
    threadUpdatedAt,
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
    chatDirection,
    sender,
  }){

    console.log('SaveChatWithThread.execute - Initial thread status:', threadStatus);


    let isNewThread = false;
    let originalThread = null;
    let thread = null;
    const timestamp = Date.now();

    try {
      thread = await this.threadRepository.getByWhatsappInfo(waBusinessId, clientWaId);

      console.log('Thread from repository:', {
        found: !!thread,
        id: thread?.id,
        status: thread?.status,
        shouldCreateNew: thread?.status === THREAD_STATUS.COMPLETED
      });
      
      if (thread && thread.status === THREAD_STATUS.COMPLETED) {
        isNewThread = true;
        originalThread = thread.toJson();
        thread = null;
      } else if (!thread) {
        isNewThread = true;
      } else {
        isNewThread = false;
        originalThread = thread.toJson();
      }

      const rawInternalUserDetail = internalUserDetail ?? [];
      const internalUserDetailObj = rawInternalUserDetail.map(item =>
        item instanceof InternalUserDetail ? item : InternalUserDetail.fromJson(item)
      );

      let newUnreadCount = (parseInt(unreadCount, 10) || 0);
      if (isNewThread) {
        newUnreadCount = 1;
      }

      let newStatus;
      if (isNewThread) {
        newStatus = THREAD_STATUS.QUEUE;
      } else if (threadStatus !== undefined) {
        newStatus = parseInt(threadStatus, 10);
      } else if (thread && thread.status !== undefined) {
        newStatus = parseInt(thread.status, 10);
      } else {
        newStatus = THREAD_STATUS.QUEUE;
      }

      if (isNewThread) {
        thread = new Thread({
          id: null,
          waBusinessId: waBusinessId,
          phoneNumberId: phoneNumberId,
          displayPhoneNumber: displayPhoneNumber,
          clientWaId: clientWaId,
          clientName: clientName,
          unreadCount: newUnreadCount,
          status: THREAD_STATUS.QUEUE,
          lastMessageMediaType: mediaType,
          lastMessage: message || mediaType,
          firstResponseDatetime: null,
          lastResponseDatetime: null,
          currentHandlerUserId: null,
          internalUserDetail: [],
          createdAt: timestamp,
          updatedAt: timestamp,
        });

        console.log('Creating a new thread');
      } else {
        thread = new Thread({
          id: thread.id,
          waBusinessId: waBusinessId ?? thread.waBusinessId,
          clientWaId: clientWaId ?? thread.clientWaId,
          clientName: clientName ?? thread.clientName,
          phoneNumberId: phoneNumberId ?? thread.phoneNumberId,
          displayPhoneNumber: displayPhoneNumber ?? thread.displayPhoneNumber,
          unreadCount: newUnreadCount,
          status: newStatus,
          lastMessageMediaType: mediaType ?? thread.lastMessageMediaType,
          lastMessage: message?.trim() ? message : mediaType ?? thread.lastMessage,
          firstResponseDatetime: thread.firstResponseDatetime ?? null,
          lastResponseDatetime: lastResponseDatetime ?? thread.lastResponseDatetime,
          currentHandlerUserId: currentHandlerUserId ?? thread.currentHandlerUserId,
          internalUserDetail: internalUserDetailObj,
          createdAt: thread.createdAt ?? threadCreatedAt,
          updatedAt: threadUpdatedAt ?? timestamp,
        });

        console.log('Updating existing thread:', thread.id);
      }

      console.log('About to save thread:', { 
        id: thread.id,
        isNewThread: isNewThread,
        status: thread.status
      });

      const savedThread = await this.threadRepository.save(thread);
      thread = savedThread;
      console.log('Thread saved:', thread.id);

      const chat = new Chat({
        id: null,
        threadId: thread.id,
        phoneNumberId: phoneNumberId,
        clientWaId: clientWaId,
        wamid: wamid ?? null,
        mediaId: mediaId ?? null,
        mediaType: mediaType ?? null,
        mediaPathName: mediaPathName ?? null,
        message: message || '',
        unread: unread,
        replyTo: replyTo ?? null,
        repliedBy: repliedBy ?? null,
        createdAt: chatCreatedAt ?? timestamp,
        updatedAt: chatUpdatedAt ?? timestamp,
        direction: chatDirection,
        sender: sender
      });

      console.log('Saving chat with threadId:', thread.id);
      const chatRes = await this.chatRepository.save(chat);
  
      return {
        chat: chatRes,
        thread: thread,
        isNewThread: isNewThread
      }; 

    } catch (error) {
      console.error('Error in SaveChatWithThread:', error);

      if (isNewThread && thread && thread.id) {
        try {
          await this.threadRepository.delete(thread.id);
          console.log(`New thread ${thread.id} deleted due to chat save failure`);
        } catch (rollbackError) {
          console.error('Error during thread deletion rollback:', rollbackError);          
        }
      } else if (originalThread) {
        try {
          const t = Thread.fromJson(originalThread);
          await this.threadRepository.save(t);
          console.log(`Thread ${t.id} reverted to original state due to chat save failure`);
        } catch (rollbackError) {
          console.error('Error during thread restore rollback:', rollbackError);
        }
      }
      
      throw error;
    }
  }
}

module.exports = SaveChatWithThread;