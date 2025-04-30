class Thread {
  constructor({id, contactName, contactWaId, displayPhoneNumber, startTime = null, endTime = null, lastMessage, status, waBusinessId, lastUpdated = null}) {
    if (!contactName) throw new Error('Thread must have a contact name');
    if (!displayPhoneNumber) throw new Error('Thread must have a display phone number');
    // if (!startTime) throw new Error('Thread must have a start time');
    // if (!endTime) throw new Error('Thread must have an end time');
    if (!lastMessage) throw new Error('Thread must have a last message');
    if (!status) throw new Error('Thread must have a status');

    this.id = id || null;
    this.contactName = contactName;
    this.contactWaId = contactWaId || null;
    this.displayPhoneNumber = displayPhoneNumber;
    this.startTime = startTime || null;
    this.endTime = endTime || null;
    this.lastMessage = lastMessage;
    this.status = status;
    this.waBusinessId = waBusinessId || null;
    this.lastUpdated = lastUpdated || null;
  }

  toPrimitive() {
    return {
      id: this.id,
      contact_name: this.contactName,
      contact_wa_id: this.contactWaId,
      display_phone_number: this.displayPhoneNumber,
      start_time: this.startTime,
      end_time: this.endTime,
      last_message: this.lastMessage,
      status: this.status,
      wa_business_id: this.waBusinessId,
      last_updated: this.lastUpdated,
    };
  }

  static fromJson(data) {
    return new Thread({
      id: data.id,
      contactName: data.contact_name,
      contactWaId: data.contact_wa_id,
      displayPhoneNumber: data.display_phone_number,
      startTime: data.start_time,
      endTime: data.end_time,
      lastMessage: data.last_message,
      status: data.status,
      waBusinessId: data.wa_business_id,
      lastUpdated: data.last_updated,
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
  
    const data = doc.data();
    

    return new Thread({
      id: doc.id,
      contactName: data.contact_name,
      contactWaId: data.contact_wa_id,
      displayPhoneNumber: data.display_phone_number,
      startTime: data.start_time,
      endTime: data.end_time,
      lastMessage: data.last_message,
      status: data.status,
      waBusinessId: data.wa_business_id,
      lastUpdated: data.last_updated,
    });
  }
}

module.exports = Thread;
