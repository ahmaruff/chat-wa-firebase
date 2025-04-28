const Thread = require('../../domain/entities/Thread');
const ThreadRepository = require('../../domain/repositories/ThreadRepository');

class FindThreadByWaInfo {
  constructor(threadRepository) {
    this.threadRepository = threadRepository;
  }

  async execute({waBusinessId, contactWaId}) {
    try {
      const thread = await this.threadRepository.getByWhatsappInfo(waBusinessId, contactWaId);
      return thread;
    } catch (error) {
      console.log('ERROR find thread by WA info: ', error);
      throw error;
    }
  }
}

module.exports = FindThreadByWaInfo;
