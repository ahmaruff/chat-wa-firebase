
class Thread {
  constructor({
    id = null,
    waBusinessId,
    clientWaId,
    clientName,
    clientPhoneNumberId,
    clientDisplayPhoneNumber,
    unreadCount,
    status,
    lastMessageMediaType,
    lastMessage,
    firstResponseDatetime,
    lastResponseDatetime,
    currentHandlerUserId = null,
    internalUserDetail = [],
    createdAt = null,
    updatedAt = null,
  }){
    this.id = id || null;
    this.waBusinessId = waBusinessId;
    this.clientWaId = clientWaId;
    this.clientName = clientName;
    this.clientPhoneNumberId = clientPhoneNumberId;
    this.clientDisplayPhoneNumber = clientDisplayPhoneNumber;
    this.unreadCount = unreadCount || 0;
    this.status = status;
    this.lastMessageMediaType = lastMessageMediaType;
    this.lastMessage = lastMessage;
    this.firstResponseDatetime = firstResponseDatetime || null;
    this.lastResponseDatetime = lastResponseDatetime || null;
    this.currentHandlerUserId = currentHandlerUserId || null;
    this.internalUserDetail = internalUserDetail || [];
    this.createdAt = createdAt || Date.now();
    this.updatedAt = updatedAt || Date.now();
  }

  toJson() {
    return {
      id: this.id,
      wa_business_id: this.waBusinessId,
      client_wa_id: this.clientWaId,
      client_name: this.clientName,
      client_phone_number_id: this.clientPhoneNumberId,
      client_display_phone_number: this.clientDisplayPhoneNumber,
      unread_count: this.unreadCount,
      status: this.status,
      last_message_media_type: this.lastMessageMediaType,
      last_message: this.lastMessage,
      first_response_datetime: this.firstResponseDatetime,
      last_response_datetime: this.lastResponseDatetime,
      current_handler_user_id: this.currentHandlerUserId,
      internal_user_detail: this.internalUserDetail,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    }
  }

  static fromJson(data) {
    return new Thread({
      id: data.id,
      waBusinessId: data.wa_business_id,
      clientWaId: data.client_wa_id,
      clientName: data.client_name,
      clientPhoneNumberId: data.client_phone_number_id,
      clientDisplayPhoneNumber: data.client_display_phone_number,
      unreadCount: data.unread_count,
      status: data.status,
      lastMessageMediaType: data.last_message_media_type,
      lastMessage: data.last_message,
      firstResponseDatetime: data.first_response_datetime,
      lastResponseDatetime: data.last_response_datetime,
      currentHandlerUserId: data.current_handler_user_id,
      internalUserDetail: data.internal_user_detail,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
  
    const data = doc.data();

    return new Thread({
      id: doc.id,
      waBusinessId: data.wa_business_id,
      clientWaId: data.client_wa_id,
      clientName: data.client_name,
      clientPhoneNumberId: data.client_phone_number_id,
      clientDisplayPhoneNumber: data.client_display_phone_number,
      unreadCount: data.unread_count,
      status: data.status,
      lastMessageMediaType: data.last_message_media_type,
      lastMessage: data.last_message,
      firstResponseDatetime: data.first_response_datetime,
      lastResponseDatetime: data.last_response_datetime,
      currentHandlerUserId: data.current_handler_user_id,
      internalUserDetail: data.internal_user_detail,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }
}

module.exports = Thread;
