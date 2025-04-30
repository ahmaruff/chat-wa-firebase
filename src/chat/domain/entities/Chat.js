const MessageContent = require('../valueObjects/MessageContent');

class Chat {
  constructor({id, sender, thread, messageContent, createdAt = null, unread = true, chatId = null, replyTo = null, repliedBy = null}){
    if (!sender) throw new Error('Chat must have a sender');
    if (!thread) throw new Error('Chat must have a thread');
    if (!(messageContent instanceof MessageContent)) {
      throw new Error('messageContent must be instance of MessageContent');
    }

    this.id = id || null;
    this.chatId = chatId || null;
    this.sender = sender;
    this.thread = thread || null;
    this.messageContent = messageContent;
    this.unread = unread;
    this.createdAt = createdAt || null;
    this.replyTo = replyTo || null;
    this.repliedBy = this.repliedBy | null;
  }

  toPrimitive() {
    return {
      id: this.id,
      sender: this.sender,
      thread: this.thread,
      message: this.messageContent.getValue(),
      created_at: this.createdAt,
      chat_id: this.chatId,
      reply_to: this.replyTo,
      replied_by: this.repliedBy
    }
  }

  static fromJson(data) {
    return new Chat({
      id: data.id,
      sender: data.sender,
      thread: data.thread,
      messageContent: new MessageContent(data.message),
      createdAt: data.created_at,
      unread: data.unread,
      chatId: data.chat_id,
      replyTo: data.reply_to,
      repliedBy: data.replied_by
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
  
    const data = doc.data();
    
    return new Chat({
      id: doc.id,
      sender: data.sender,
      thread: data.thread,
      messageContent: new MessageContent(data.message),
      createdAt: data.created_at,
      unread: data.unread,
      chatId: data.chat_id,
      replyTo: data.reply_to,
      repliedBy: data.replied_by
    });
  }
}

module.exports = Chat;