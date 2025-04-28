class ChatRepository {
  save(chat) {
    throw new Error('Method save() must be implemented');
  }

  read(chat) {
    throw new Error("Method read() must be implemented");
    
  }
  
  getById(id) {
    throw new Error("Method getById() must be implemented");
  }
}

module.exports = ChatRepository;
