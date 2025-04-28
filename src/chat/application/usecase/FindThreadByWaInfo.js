const ThreadRepository = require('../../domain/repositories/ThreadRepository');

class FindThreadByWaInfo {
  constructor(threadRepository) {
    this.threadRepository = threadRepository;
  }

  async execute({waBusinessId, contactWaId}) {
    try {
      const thread = await this.threadRepository.getByWhatsappInfo(waBusinessId, contactWaId);

      if (!thread) {
        throw new Error('Thread not found');
      }

      return thread;
    } catch (error) {
      console.error('Error finding thread by WA info:', error);
      throw error;
    }
  }
}

module.exports = FindThreadByWaInfo;