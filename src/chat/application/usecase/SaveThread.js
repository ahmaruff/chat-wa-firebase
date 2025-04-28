const Thread = require('../../domain/entities/Thread');
const ThreadRepository = require('../../domain/repositories/ThreadRepository');

class SaveThread {
  constructor(threadRepository) {
    this.threadRepository = threadRepository;
  }

  async execute({id, contactName, contactWAId, displayPhoneNumber, startTime, endTime, lastMessage, status, waBusinessId, lastUpdated}) {
    const thread = new Thread({id, contactName, contactWAId, displayPhoneNumber, startTime, endTime, lastMessage, status, waBusinessId, lastUpdated});
    await this.threadRepository.save(thread);
  }
}

module.exports = SaveThread;
