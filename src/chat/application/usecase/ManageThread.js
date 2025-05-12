class ManageThread {
  constructor(threadRepository) {
    this.threadRepository = threadRepository;
  }

  async getById(id) {
    try {
      const thread = await this.threadRepository.getById(id);

      if (!thread) {
        throw new Error('Thread not found');
      }

      return thread;
    } catch (error) {
      console.error('Error finding thread by WA info:', error);
      throw error;
    }
  }

  async getByWhatsappInfo(waBusinessId, clientWaId) {
    try {
      const thread = await this.threadRepository.getByWhatsappInfo(waBusinessId, clientWaId);

      if (!thread) {
        console.log(`Thread by wa info waBusinessId: ${waBusinessId} and clientWaId: ${clientWaId} not found`);
        return null;
      }

      return thread;
    } catch (error) {
      console.error('Error finding thread by WA info:', error);
      throw error;
    }
  }

  async save(thread) {
    try {
      const savedThread = await this.threadRepository.save(thread);
      return savedThread;
    } catch (error) {
      console.error('Error saving thread:', error);
      throw error;
    }
  }
}

module.exports = ManageThread;