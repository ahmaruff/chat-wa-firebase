class ThreadRepository {
  save(thread) {
    throw new Error('Method save() must be implemented');
  }

  read(thread) {
    throw new Error("Method read() must be implemented");
    
  }

  getById(id) {
    throw new Error("Method getById() must be implemented");
  }

  getByWhatsappInfo(waBusinessId, clientWaId) {
    throw new Error("Method getByWhatsappInfo() must be implemented");
  }
}

module.exports = ThreadRepository;
