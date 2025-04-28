class ChatRepository {
  save(chat) {
    throw new Error('Method save() must be implemented');
  }

  read(chat) {
    throw new Error("Method read() must be implemented");
    
  }
}

module.exports = ChatRepository;
