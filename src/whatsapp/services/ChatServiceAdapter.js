const ChatService = require('../../chat/service/ChatService');
const THREAD_STATUS = require('../../shared/constants/chatStatus');

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
    
    try {      
      const waData = whatsappMessage.toChatServiceFormat();
      
      // Panggil Chat service untuk menyimpan pesan
      const result = await this.chatService.createChatFromExternalSource({
        chatId: waData.chatId,
        senderNumber: waData.senderNumber,
        recipientNumber: waData.recipientNumber,
        contactName: waData.contactName,
        messageText: waData.messageText,
        waBusinessId: waData.waBusinessId,
        status: THREAD_STATUS.QUEUE,
        unread: waData.unread,
        displayPhoneNumber: waData.displayPhoneNumber,
        createdAt: waData.createdAt,
        replyTo: waData.replyTo,
        repliedBy: waData.repliedBy,
      });
      console.log('result save chat:', result);
      return result;
    } catch (error) {
      console.error('Error in ChatServiceAdapter:', error);
      throw error;
    }
  }
}

module.exports = ChatServiceAdapter;