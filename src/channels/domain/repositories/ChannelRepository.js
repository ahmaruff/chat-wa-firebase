class ChannelRepository {
  constructor() {
  }

  save(channel) {
    throw new Error("Method save() must be implemented"); 
  }

  getById(id) {
    throw new Error("Method getById() must be implemented"); 
  }

  getByCrmChannelId(crmChannelId) {
    throw new Error("Method getByCrmChannelId() must be implemented"); 
  }

  getAll() {
    throw new Error("Method getAll() must be implemented"); 
  }

  getAllActive() {
    throw new Error("Method getAllActive() must be implemented"); 
  }

  delete() {
    throw new Error("Method delete() must be implemented"); 
  }
}

module.exports = ChannelRepository;