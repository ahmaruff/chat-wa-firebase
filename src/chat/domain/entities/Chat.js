class Chat {
  constructor({
    id,
    threadId,
    phoneNumberId,
    clientWaId,
    wamid,
    mediaId,
    mediaType,
    mediaPathName,
    message,
    unread,
    replyTo,
    repliedBy,
    createdAt,
    updatedAt,
    direction,
    sender,
  }){

    Chat.validateInput({
      threadId,
      phoneNumberId,
      clientWaId,
      message
    });

    this.id = id ?? null;
    this.threadId = threadId;
    this.phoneNumberId = phoneNumberId;
    this.clientWaId = clientWaId;
    this.wamid = wamid ?? null;
    this.mediaId = mediaId ?? null;
    this.mediaType = mediaType;
    this.mediaPathName = mediaPathName ?? null;
    this.message = message || '';
    this.unread = unread ?? true;
    this.replyTo = replyTo ?? null;
    this.repliedBy = repliedBy ?? null;
    this.createdAt = createdAt ?? Date.now();
    this.updatedAt = updatedAt ?? Date.now();
    this.direction = direction;
    this.sender = sender
  }

  static validateInput(data) {
    if (!data.threadId) throw new Error("threadId is required");
    if (!data.phoneNumberId) throw new Error("phoneNumberId is required");
    if (!data.clientWaId) throw new Error("clientWaId is required");
    return true;
  }

  static fromJson(data) {
    return new Chat({
      id: data.id ?? null,
      threadId: data.thread_id,
      phoneNumberId: data.phone_number_id,
      clientWaId: data.client_wa_id,
      wamid: data.wamid,
      mediaId: data.media_id,
      mediaType: data.media_type,
      mediaPathName: data.media_path_name,
      message: data.message || '',
      unread: data.unread,
      replyTo: data.reply_to,
      repliedBy: data.replied_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      direction: data.direction,
      sender: data.sender,
    });
  }

  toJson() {
    return {
      id: this.id,
      thread_id: this.threadId,
      phone_number_id: this.phoneNumberId,
      client_wa_id: this.clientWaId,
      wamid: this.wamid,
      media_id: this.mediaId,
      media_type: this.mediaType,
      media_path_name: this.mediaPathName,
      message: this.message || '',
      unread: this.unread,
      reply_to: this.replyTo,
      replied_by: this.repliedBy,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      direction: this.direction,
      sender: this.sender,
    }
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
  
    const data = doc.data();

    return new Chat({
      id: data.id ?? null,
      threadId: data.thread_id,
      phoneNumberId: data.phone_number_id,
      clientWaId: data.client_wa_id,
      wamid: data.wamid,
      mediaId: data.media_id,
      mediaType: data.media_type,
      mediaPathName: data.media_path_name,
      message: data.message || '',
      unread: data.unread,
      replyTo: data.reply_to,
      repliedBy: data.replied_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      direction: data.direction,
      sender: data.sender,
    });
  }
}

module.exports = Chat;