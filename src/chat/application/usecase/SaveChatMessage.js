const Chat = require('../../domain/entities/Chat');
const MessageContent = require('../../domain/valueObjects/MessageContent');

class SaveChatMessage {
  constructor(chatRepository) {
    this.chatRepository = chatRepository;
  }

  async execute({id, sender, thread, message, createdAt = null, unread = true}) {
    try {
      const messageContent = new MessageContent(message);

      const chat = new Chat({
        id: id, 
        sender: sender, 
        thread: thread, 
        messageContent: messageContent, 
        createdAt: createdAt, 
        unread: unread
      });

      // Save the chat using the repository
      await this.chatRepository.save(chat);
      
      return chat.id;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }
}

module.exports = SaveChatMessage;