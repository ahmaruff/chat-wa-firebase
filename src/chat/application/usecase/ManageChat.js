class ManageChat{
  constructor(chatRepository) {
    this.chatRepository = chatRepository;
  }

  async getById(id) {
    try {
      const chat = await this.chatRepository.getById(id);

      if (!chat) {
        throw new Error('Chat not found');
      }

      return chat;
    } catch (error) {
      console.error('Error finding chat by ID:', error);
      throw error;
    }
  }

  async getByWamid(wamid) {
    try {
      const chat = await this.chatRepository.getByWamid(wamid);

      if (!chat) {
        throw new Error('Chat not found');
      }

      return chat;
    } catch (error) {
      console.error('Error finding chat by wamid:', error);
      throw error;
    }
  }

  async markAsRead(id) {
    try {
      const chat = await this.chatRepository.markAsRead(id);

      if (!chat) {
        throw new Error('Failed marking chat as read');
      }

      return chat;
    } catch (error) {
      console.error('Error marking chat as read:', error);
      throw error;
    }
  }

  async markAsReadByWamid(wamid) {
    try {
      const isTrue = await this.chatRepository.markAsReadByWamid(wamid);
      console.log(`marked as read for wamid ${wamid}: `, isTrue);
      
      if (!isTrue) {
        throw new Error('Failed marking chat as read');
      }

      return isTrue;
    } catch (error) {
      console.error('Error marking chat as read by wamid:', error);
      throw error;
    }
  }

  async markAsReadUpToWamid({wamid, phoneNumberId, direction}) {
    try {
      const isTrue = await this.chatRepository.markAsReadUpToWamid({
        wamid: wamid,
        phone_number_id: phoneNumberId,
        direction: direction
      });

      if (!isTrue) {
        throw new Error(`Failed marking chat as read: ${isTrue}`,);
      }

      return isTrue;
    } catch (error) {
      console.error('Error marking chat as read:', error);
      throw error;
    }
  }

  async save(chat) {
    try {
      const c = await this.chatRepository.save(chat);
      return c;
    } catch (error) {
      console.error('Error saving chat:', error);
      throw error;
    }
  }
}

module.exports = ManageChat;