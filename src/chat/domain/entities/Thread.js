class Thread {
  constructor({id, contactName, contactWaId, displayPhoneNumber, startTime, endTime, lastMessage, status, waBusinessId, lastUpdated}) {
    if (!contactName) throw new Error('Thread must have a contact name');
    if (!displayPhoneNumber) throw new Error('Thread must have a display phone number');
    if (!startTime) throw new Error('Thread must have a start time');
    if (!endTime) throw new Error('Thread must have an end time');
    if (!lastMessage) throw new Error('Thread must have a last message');
    if (!status) throw new Error('Thread must have a status');
    if (!lastUpdated) throw new Error('Thread must have a last updated timestamp');

    this.id = id || null;
    this.contactName = contactName;
    this.contactWaId = contactWaId || null;
    this.displayPhoneNumber = displayPhoneNumber;
    this.startTime = startTime;
    this.endTime = endTime;
    this.lastMessage = lastMessage;
    this.status = status;
    this.waBusinessId = waBusinessId || null;
    this.lastUpdated = lastUpdated;
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
}

module.exports = Thread;
