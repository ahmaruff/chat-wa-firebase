class ChatServiceInterface {
  static async createChatFromExternalSource({ waBusinessId, recipientNumber, messageText, contactName }) {
    throw new Error('Method not implemented');
  }
}

module.exports = ChatServiceInterface;
