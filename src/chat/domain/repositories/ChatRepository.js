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

  getByWamid(wamid) {
    throw new Error("Method getByWamid() must be implemented");
  }

  markAsRead(id) {
    throw new Error("Method markAsRead() must be implemented");
  }

  markAsReadByWamid(wamid) {
    throw new Error("Method markAsReadByWamid() must be implemented");
  }
}

module.exports = ChatRepository;
