const Chat = require('../../domain/entities/Chat');
const MessageContent = require('../../domain/valueObjects/MessageContent');

class SaveChatMessage {
  constructor(chatRepository) {
    this.chatRepository = chatRepository;
  }

  async execute({id, sender, thread, messageContent, createdAt = null, unread = true}) {
    try {
      if (!(messageContent instanceof MessageContent)) {
        throw new Error('Invalid message content');
      }

      const chat = new Chat({
        id, 
        sender, 
        thread, 
        messageContent, 
        createdAt, 
        unread
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