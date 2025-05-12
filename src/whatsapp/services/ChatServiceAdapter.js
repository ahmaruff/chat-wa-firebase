const ChatService = require('../../chat/service/ChatService');
const THREAD_STATUS = require('../../shared/constants/chatStatus');
const WhatsappMessage = require('../domain/entities/WhatsappMessage');

class ChatServiceAdapter {
  constructor() {
    this.chatService = new ChatService();
  }

  /**
   * Membuat chat dari pesan WhatsApp
   * @param {WhatsappMessage} whatsappMessage - Pesan WhatsApp
   * @returns {Promise<Object>} - Hasil pembuatan chat
   */
  async createChatFromWhatsApp(whatsappMessage) {
    if (!(whatsappMessage instanceof WhatsappMessage)) {
      throw new Error("Parameter must be an instance of WhatsappMessage.");
    }
  
    if (!whatsappMessage.wamid) {
      throw new Error("Missing required 'wamid'.");
    }
  
    if (!whatsappMessage.waBusinessId) {
      throw new Error("Missing required 'waBusinessId'.");
    }
  
    try {
      const timestamp = Date.now();
  
      // Fetch thread from chat service
      console.log(`Getting thread for waBusinessId: ${whatsappMessage.waBusinessId}, clientWaId: ${whatsappMessage.clientWaId}`);
      let thread = await this.chatService.getThread(
        whatsappMessage.waBusinessId,
        whatsappMessage.clientWaId
      );

      // Log thread info for debugging
      console.log('Thread found:', { 
        found: !!thread, 
        id: thread?.id,
        status: thread?.status,
        unreadCount: thread?.unreadCount
      });
  
      // Safely access thread properties with defaults
      const unreadCount = (parseInt(thread?.unreadCount ?? 0, 10) || 0);
      const threadStatus = thread?.status ?? THREAD_STATUS.QUEUE; 
      const firstResponseDatetime = thread?.firstResponseDatetime ?? null; 
      const lastResponseDatetime = thread?.lastResponseDatetime ?? null; 
      const currentHandlerUserId = thread?.currentHandlerUserId ?? null; 
      const internalUserDetail = thread?.internalUserDetail ?? []; 
      const threadCreatedAt = thread?.createdAt ?? timestamp; 
      const threadUpdatedAt = thread?.updatedAt ?? timestamp;
      
      console.log('Thread status being passed to payload:', threadStatus);
  
      // Prepare the chat payload
      const chatPayload = whatsappMessage.toChatServiceAdapterPayload({
        unreadCount: unreadCount + 1,
        threadStatus: threadStatus,
        firstResponseDatetime: firstResponseDatetime,
        lastResponseDatetime: lastResponseDatetime,
        currentHandlerUserId: currentHandlerUserId,
        internalUserDetail: internalUserDetail,
        threadCreatedAt: threadCreatedAt,
        threadUpdatedAt: threadUpdatedAt,
        replyTo: null,
        repliedBy: null,
        chatCreatedAt: timestamp,
        chatUpdatedAt: timestamp,
      });
      
      console.log('Chat payload prepared:', {
        waBusinessId: chatPayload.waBusinessId,
        clientWaId: chatPayload.clientWaId,
        threadStatus: chatPayload.threadStatus,
        unreadCount: chatPayload.unreadCount
      });
  
      // Call the chat service to create the chat with the prepared payload
      console.log('Calling createChatFromExternalSource with payload');
      const result = await this.chatService.createChatFromExternalSource(chatPayload);
  
      console.log('Chat saved successfully:', {
        chatId: result?.chat?.id,
        threadId: result?.thread?.id,
        isNewThread: result?.isNewThread,
        threadStatus: result?.thread?.status
      });
      
      return result;
    } catch (error) {
      console.error('Error while creating chat from WhatsApp:', error);
      throw error; // Rethrow the error after logging it
    }
  }  

  async markAsRead(wamid) {
    try {
      const isTrue = await this.chatService.markAsRead(wamid);
      return isTrue;
    } catch (error) {
      console.error('Error while marking as read chat:', error);
      throw error;
    }
  }

  async markAsReadUpToWamid({wamid, phoneNumberId, direction}) {
    try {
      const isTrue = await this.chatService.markAsReadUpToWamid({wamid, phoneNumberId, direction});

      return isTrue;
    } catch (error) {
      console.error('Error while marking as read chat:', error);
      throw error;
    }
  }
}

module.exports = ChatServiceAdapter;
