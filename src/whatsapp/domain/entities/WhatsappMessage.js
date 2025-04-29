class WhatsappMessage {
  constructor(data) {
    // Core message properties
    this.id = data.id || null; // WhatsApp message ID (wamid.ID)
    this.from = data.from || null;
    this.timestamp = data.timestamp || Date.now();
    this.type = data.type || 'text';
    this.body = data.body || null;
    
    // Metadata
    this.waBusinessAccountId = data.waBusinessAccountId || null;
    this.phoneNumberId = data.phoneNumberId || null;
    this.displayPhoneNumber = data.displayPhoneNumber || null;
    
    // Contact information
    this.contactName = data.contactName || null;
    this.contactWaId = data.contactWaId || null;
    
    // Additional fields
    this.status = data.status || 'received';
    this.processedAt = data.processedAt || Date.now();
  }

  toJSON() {
    return {
      id: this.id,
      from: this.from,
      timestamp: this.timestamp,
      type: this.type,
      body: this.body,
      waBusinessAccountId: this.waBusinessAccountId,
      phoneNumberId: this.phoneNumberId,
      displayPhoneNumber: this.displayPhoneNumber,
      contactName: this.contactName,
      contactWaId: this.contactWaId,
      status: this.status,
      processedAt: this.processedAt
    };
  }

  /**
   * Creates a WhatsappMessage instance from a WhatsApp webhook payload
   * @param {Object} payload - The webhook payload from WhatsApp
   * @returns {WhatsappMessage|null} - A WhatsappMessage instance or null if parsing fails
   */
  static fromWhatsAppPayload(payload) {
    try {
      if (!payload || !payload.object || !payload.entry || !payload.entry.length) {
        console.error('Invalid WhatsApp payload structure');
        return null;
      }

      const entry = payload.entry[0];
      const change = entry.changes[0];
      
      if (!change || !change.value || !change.value.messages || !change.value.messages.length) {
        console.error('No messages in WhatsApp payload');
        return null;
      }

      const metadata = change.value.metadata;
      const message = change.value.messages[0];
      const contact = change.value.contacts && change.value.contacts.length ? 
                      change.value.contacts[0] : null;

      // Extract message body based on message type
      let body = null;
      if (message.type === 'text' && message.text) {
        body = message.text.body;
      } else if (message.type === 'image' && message.image) {
        body = message.image.caption || 'Image received';
      } else if (message.type === 'document' && message.document) {
        body = message.document.caption || 'Document received';
      } else if (message.type === 'audio' && message.audio) {
        body = 'Audio received';
      } else if (message.type === 'video' && message.video) {
        body = message.video.caption || 'Video received';
      } else {
        body = `Message of type ${message.type} received`;
      }

      return new WhatsappMessage({
        id: message.id,
        from: message.from,
        timestamp: parseInt(message.timestamp) * 1000,
        type: message.type,
        body: body,
        waBusinessAccountId: entry.id,
        phoneNumberId: metadata.phone_number_id,
        displayPhoneNumber: metadata.display_phone_number,
        contactName: contact && contact.profile ? contact.profile.name : null,
        contactWaId: contact ? contact.wa_id : null,
        status: 'received',
        processedAt: Date.now()
      });
    } catch (error) {
      console.error('Error parsing WhatsApp payload:', error);
      return null;
    }
  }

  /**
   * Converts a WhatsappMessage to the format expected by ChatService
   * @returns {Object} Data formatted for ChatService
   */
  toChatServiceFormat() {
    return {
      waBusinessId: this.phoneNumberId,
      recipientNumber: this.displayPhoneNumber,
      messageText: this.body,
      contactName: this.contactName || 'Unknown',
      senderNumber: this.from,
      displayPhoneNumber: this.displayPhoneNumber
    };
  }
}

module.exports = WhatsappMessage;