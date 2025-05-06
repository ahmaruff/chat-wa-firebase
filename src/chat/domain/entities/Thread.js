const InternalUserDetail = require('../valueObjects/InternalUserDetail');

class Thread {
  constructor({
    id = null,
    waBusinessId,
    phoneNumberId,
    displayPhoneNumber,
    clientWaId,
    clientName,
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
    Thread.validateInput({
      waBusinessId,
      clientWaId,
      clientName,
      phoneNumberId,
      internalUserDetail,
    });

    this.id = id || null;
    this.waBusinessId = waBusinessId;
    this.phoneNumberId = phoneNumberId;
    this.displayPhoneNumber = displayPhoneNumber;
    this.clientWaId = clientWaId;
    this.clientName = clientName;
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

  static validateInput(data) {
    if (!data.waBusinessId) throw new Error("waBusinessId is required");
    if (!data.phoneNumberId) throw new Error("phoneNumberId is required");
    if (!data.clientWaId) throw new Error("clientWaId is required");
    if (!data.clientName) throw new Error("clientName is required");

    if (!Array.isArray(data.internalUserDetail)) throw new Error("internalUserDetail must be an array");
  
    for (const item of data.internalUserDetail) {
      if (
        typeof item !== 'object' ||
        (!('threadId' in item) || !('name' in item)) // basic checks
      ) {
        throw new Error("Each internalUserDetail must be a valid object with threadId and name");
      }
    }
  
    return true;
  }
  

  toJson() {
    return {
      id: this.id,
      wa_business_id: this.waBusinessId,
      phone_number_id: this.phoneNumberId,
      display_phone_number: this.displayPhoneNumber,
      client_wa_id: this.clientWaId,
      client_name: this.clientName,
      unread_count: this.unreadCount,
      status: this.status,
      last_message_media_type: this.lastMessageMediaType,
      last_message: this.lastMessage,
      first_response_datetime: this.firstResponseDatetime,
      last_response_datetime: this.lastResponseDatetime,
      current_handler_user_id: this.currentHandlerUserId,
      internal_user_detail: this.convertInternalUserDetailToJson(),
      created_at: this.createdAt,
      updated_at: this.updatedAt
    }
  }

  static fromJson(data) {
    const rawInternalUserDetail = data.internal_user_detail ?? [];

    const internalUserDetail = rawInternalUserDetail.map(item =>
      item instanceof InternalUserDetail ? item : InternalUserDetail.fromJson(item)
    );

    Thread.validateInput({
      waBusinessId: data.wa_business_id,
      phoneNumberId: data.phone_number_id,
      clientWaId: data.client_wa_id,
      clientName: data.client_name,
      internalUserDetail: internalUserDetail,
    });

    return new Thread({
      id: data.id,
      waBusinessId: data.wa_business_id,
      phoneNumberId: data.phone_number_id,
      displayPhoneNumber: data.display_phone_number,
      clientWaId: data.client_wa_id,
      clientName: data.client_name,
      unreadCount: data.unread_count,
      status: data.status,
      lastMessageMediaType: data.last_message_media_type,
      lastMessage: data.last_message,
      firstResponseDatetime: data.first_response_datetime,
      lastResponseDatetime: data.last_response_datetime,
      currentHandlerUserId: data.current_handler_user_id,
      internalUserDetail: internalUserDetail,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
  
    const data = doc.data();

    const rawInternalUserDetail = data.internal_user_detail ?? [];

    const internalUserDetail = rawInternalUserDetail.map(item =>
      item instanceof InternalUserDetail ? item : new InternalUserDetail.fromJson(item)
    );

    Thread.validateInput({
      waBusinessId: data.wa_business_id,
      phoneNumberId: data.phone_number_id,
      clientWaId: data.client_wa_id,
      clientName: data.client_name,
      internalUserDetail: internalUserDetail,
    });

    return new Thread({
      id: doc.id,
      waBusinessId: data.wa_business_id,
      phoneNumberId: data.phone_number_id,
      displayPhoneNumber: data.display_phone_number,
      clientWaId: data.client_wa_id,
      clientName: data.client_name,
      unreadCount: data.unread_count,
      status: data.status,
      lastMessageMediaType: data.last_message_media_type,
      lastMessage: data.last_message,
      firstResponseDatetime: data.first_response_datetime,
      lastResponseDatetime: data.last_response_datetime,
      currentHandlerUserId: data.current_handler_user_id,
      internalUserDetail: internalUserDetail,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }

  convertInternalUserDetailToJson() {
    try {
      const internalUserDetail = Array.isArray(this.internalUserDetail)
        ? this.internalUserDetail
        : [];
  
      return internalUserDetail.map(item => {
        if (item instanceof InternalUserDetail) {
          return item.toJson();
        }
  
        // Optional: handle invalid items
        if (typeof item === 'object' && item !== null) {
          return item;
        }
  
        console.warn('Invalid internalUserDetail item:', item);
        return null;
      }).filter(Boolean);
    } catch (error) {
      console.error('Failed to convert internalUserDetail to JSON:', error);
      return [];
    }
  }  
}

module.exports = Thread;
