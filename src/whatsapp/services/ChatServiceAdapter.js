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
    if(!whatsappMessage || whatsappMessage == null) {
      throw new Error("whatsapp Message null, require instance of WhatsappMessage"); 
    }

    if(!(whatsappMessage instanceof WhatsappMessage)) {
      throw new Error("Invalid whatsappMessage object");
    }

    if(!whatsappMessage.wamid) {
      throw new Error("wamid is required");
    }

    if(!whatsappMessage.waBusinessId) {
      throw new Error("waBusinessId is required");
    }
    
    try {
      let thread = null;
      thread = await this.chatService.getThread(whatsappMessage.waBusinessId, whatsappMessage.clientWaId);

      if(!thread) {
        thread = await this.chatService.createThread({
          waBusinessId: whatsappMessage.waBusinessId,
          phoneNumberId: whatsappMessage.phoneNumberId,
          displayPhoneNumber: whatsappMessage.displayPhoneNumber,
          clientWaId: whatsappMessage.clientWaId,
          clientName: whatsappMessage.clientName,
          unreadCount: 0,
          status: THREAD_STATUS.QUEUE,
          lastMessageMediaType: whatsappMessage.mediaType,
          lastMessage: whatsappMessage.body,
          firstResponseDatetime: null,
          lastResponseDatetime: null,
          currentHandlerUserId: null,
          internalUserDetail: [],
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }

      const timestamp = Date.now();
      const waData = whatsappMessage.toChatServiceAdapterPayload({
        unreadCount: thread.unreadCount + 1,
        threadStatus : thread.status ?? THREAD_STATUS.QUEUE,
        firstResponseDatetime: thread.firstResponseDatetime ?? timestamp,
        lastResponseDatetime: thread.lastResponseDatetime ?? null,
        currentHandlerUserId: thread.currentHandlerUserId,
        internalUserDetail: thread.internalUserDetail,
        threadCreatedAt: thread.createdAt,
        threadUpdatedAt: timestamp,
        replyTo: null,
        repliedBy: null,
        chatCreatedAt: timestamp,
        chatUpdatedAt: timestamp,
      });
      
      const result = await this.chatService.createChatFromExternalSource(waData);

      console.log('result save chat:', result);
      return result;
    } catch (error) {
      console.error('Error in ChatServiceAdapter:', error);
      throw error;
    }
  }
}

module.exports = ChatServiceAdapter;