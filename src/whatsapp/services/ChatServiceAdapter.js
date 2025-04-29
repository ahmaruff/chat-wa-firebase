const ChatService = require('../../chat/service/ChatService');

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
    try {
      // Gunakan metode toChatServiceFormat dari entity WhatsappMessage
      const chatData = whatsappMessage.toChatServiceFormat();
      
      // Panggil Chat service untuk menyimpan pesan
      const result = await this.chatService.createChatFromExternalSource(chatData);
      
      return result;
    } catch (error) {
      console.error('Error in ChatServiceAdapter:', error);
      throw error;
    }
  }
}

module.exports = ChatServiceAdapter;