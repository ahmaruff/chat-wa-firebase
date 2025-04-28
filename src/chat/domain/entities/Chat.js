const MessageContent = require('../valueObjects/MessageContent');

class Chat {
  constructor({id, sender, thread, messageContent, createdAt, unread = true}){
    if (!sender) throw new Error('Chat must have a sender');
    if (!thread) throw new Error('Chat must have a thread');
    if (!(messageContent instanceof MessageContent)) {
      throw new Error('messageContent must be instance of MessageContent');
    }
    if(!createdAt) throw new Error('Chat must have created_at timestamp');

    this.id = id || null;
    this.sender = sender;
    this.thread = thread || null;
    this.messageContent = messageContent;
    this.unread = unread;
    this.createdAt = createdAt;
  }

  toPrimitive() {
    return {
      id: this.id,
      sender: this.sender,
      thread: this.thread,
      message: this.messageContent.getValue(),
      created_at: this.createdAt,
    }
  }
}

module.exports = Chat;