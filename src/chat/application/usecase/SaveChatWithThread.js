const Chat = require('../../domain/entities/Chat');
const Thread = require('../../domain/entities/Thread');
const MessageContent = require('../../domain/valueObjects/MessageContent');

const THREAD_STATUS = require('../../../shared/constants/chatStatus');

class SaveChatWithThread {
  constructor(threadRepository, chatRepository) {
    this.threadRepository = threadRepository;
    this.chatRepository = chatRepository;
  }

  async execute({
    id,
    chatId,
    sender,
    recipientNumber,
    contactName,
    contactWaId,
    messageText,
    waBusinessId,
    status = THREAD_STATUS.QUEUE,
    unread,
    displayPhoneNumber,
    createdAt = Date.now(),
    replyTo,
    repliedBy,
    endTime = null
  }) {
    let isNewThread = false;
    let originalThread = null;
    let thread = await this.threadRepository.getByWhatsappInfo(waBusinessId, recipientNumber);

    if (!thread) {
      isNewThread = true;

      thread = new Thread({
        id: null,
        waBusinessId: waBusinessId,
        contactName: contactName,
        contactWaId: contactWaId,
        displayPhoneNumber: displayPhoneNumber,
        startTime: Date.now(),
        endTime: null,
        lastMessage: messageText,
        lastUpdated: Date.now(),
        status: status,
        endTime: endTime || null
      });

      const t = await this.threadRepository.save(thread);
      thread = t;

      console.log('save thread: ', thread);
    } else {
      const updateThread = new Thread({
        id: thread.id,
        contactName: contactName || thread.contactName,
        contactWaId: contactWaId || thread.contactWaId,
        displayPhoneNumber: displayPhoneNumber || thread.displayPhoneNumber,
        startTime: startTime || thread.startTime,
        lastMessage: lastMessage || thread.lastMessage,
        lastUpdated: Date.now(),
        status: status || thread.status,
        waBusinessId: waBusinessId || thread.waBusinessId,
        endTime: endTime || null
      });

      const t = await this.threadRepository.save(updateThread);
      thread = t;

      originalThread = thread.toPrimitive();
    }

    try {
      const chat = new Chat({
        id: id,
        chatId: chatId,
        sender: sender,
        thread: thread.id,
        messageContent: new MessageContent(messageText),
        createdAt: null,
        unread: unread,
        createdAt: createdAt,
        repliedBy: repliedBy || null,
        replyTo: replyTo || null
      });
      
      const chatRes = await this.chatRepository.save(chat);
  
      if (!isNewThread) {
        thread.lastMessage = messageText;
        thread.lastUpdated = null;
        await this.threadRepository.save(thread);
      }
  
      return {
        chatId: chatRes.id,
        threadId: thread.id,
        isNewThread: isNewThread
      }; 
    } catch (error) {
      // Rollback thread creation if there was an error saving the chat
      if (isNewThread && thread.id) {
        await this.threadRepository.delete(thread.id);
        console.log(`New thread ${thread.id} would be deleted due to chat save failure`);
      } else if (originalThread) {
        await this.threadRepository.save(new Thread(originalThread));
        console.log(`Thread ${thread.id} reverted to original state due to chat save failure`);
      }
      
      throw error;
    }
  }
}

module.exports = SaveChatWithThread;