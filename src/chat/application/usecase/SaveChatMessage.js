const Chat = require('../../domain/entities/Chat');
const ChatRepository = require('../../domain/repositories/ChatRepository');

class SaveChatMessage {
  constructor(chatRepository) {
    this.chatRepository = chatRepository;
  }

  async execute({id, sender, thread, message, createdAt, unread = true}) {
    const chat = new Chat(id, sender, thread, message, createdAt, unread);

    await this.chatRepository.save(chat);
  }
}

module.exports = SaveChatMessage;
