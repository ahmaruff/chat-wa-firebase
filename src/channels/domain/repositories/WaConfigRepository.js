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

  getByWaBusinessId(waBusinessId) {
    throw new Error("Method getByCrmWaBusinessId() must be implemented"); 
  }

  getByParticipants(channelId, participantId) {
    throw new Error(`method getByParticipants() must be implemented`);
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