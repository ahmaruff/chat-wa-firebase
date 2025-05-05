class WaConfigRepository{
  constructor(){
  }

  save(waConfig) {
    throw new Error("Method save() must be implemented"); 
  }

  getById(id) {
    throw new Error("Method getById() must be implemented"); 
  }

  getByChannelId(channelId) {
    throw new Error("Method getByChannelId() must be implemented"); 
  }

  getByCrmChannelId(crmChannelId) {
    throw new Error("Method getByCrmChannelId() must be implemented"); 
  }

  getAll(channelId) {
    throw new Error("Method getAll() must be implemented"); 
  }

  getAllActive(channelId) {
    throw new Error("Method getAllActive() must be implemented"); 
  }

  delete(id){
    throw new Error("Method delete() must be implemented"); 
  }
}

module.exports = WaConfigRepository;