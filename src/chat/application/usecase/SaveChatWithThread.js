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
    messageText,
    waBusinessId,
    status = THREAD_STATUS.QUEUE,
    unread,
    displayPhoneNumber,
    createdAt = Date.now(),
    replyTo,
    repliedBy
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
        contactWaId: recipientNumber,
        displayPhoneNumber: displayPhoneNumber,
        startTime: null,
        endTime: null,
        lastMessage: messageText,
        lastUpdated: null,
        status: status
      });

      thread = await this.threadRepository.save(thread);
    } else {
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