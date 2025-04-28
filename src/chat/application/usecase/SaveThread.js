const Thread = require('../../domain/entities/Thread');
const ThreadRepository = require('../../domain/repositories/ThreadRepository');

class SaveThread {
  constructor(threadRepository) {
    this.threadRepository = threadRepository;
  }

  async execute({id, contactName, contactWAId, displayPhoneNumber, startTime, endTime, lastMessage, status, waBusinessId, lastUpdated}) {
    try {
      const thread = new Thread({
        id, 
        contactName, 
        contactWAId, 
        displayPhoneNumber, 
        startTime, 
        endTime, 
        lastMessage, 
        status, 
        waBusinessId, 
        lastUpdated
      });

      const savedThread = await this.threadRepository.save(thread);

      return savedThread;
    } catch (error) {
      console.error('Error saving thread:', error);
      throw error;
    }
  }
}

module.exports = SaveThread;
