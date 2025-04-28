const Thread = require('../../domain/entities/Thread');
const ThreadRepository = require('../../domain/repositories/ThreadRepository');

class SaveThread {
  constructor(threadRepository) {
    this.threadRepository = threadRepository;
  }

  async execute({id, contactName, contactWaId, displayPhoneNumber, startTime = null, endTime = null, lastMessage, status, waBusinessId, lastUpdated = null}) {
    try {
      const thread = new Thread({
        id: id || null,  
        contactName: contactName, 
        contactWaId: contactWaId, 
        displayPhoneNumber: displayPhoneNumber, 
        startTime: startTime || null, 
        endTime: endTime || null, 
        lastMessage: lastMessage, 
        status: status, 
        waBusinessId: waBusinessId, 
        lastUpdated: lastUpdated || null
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
