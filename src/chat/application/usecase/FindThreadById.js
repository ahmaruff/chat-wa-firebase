const ThreadRepository = require('../../domain/repositories/ThreadRepository');

class FindThreadById {
  constructor(threadRepository) {
    this.threadRepository = threadRepository;
  }

  async execute(id) {
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
}

module.exports = FindThreadById;