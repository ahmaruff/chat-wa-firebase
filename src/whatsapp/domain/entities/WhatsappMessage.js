const THREAD_STATUS = require('../../../shared/constants/chatStatus');

class WhatsappMessage {
  constructor({
    wamid = null,
    waBusinessId = null,
    phoneNumberId = null,
    displayPhoneNumber = null,

    from = null,
    to = null,
    type = null,
    body = null,
    mediaType = null,
    mediaId = null,
    mediaPath = null,
    timestamp = null,
    direction = null,

    clientWaId = null,
    clientName = null,

    status = null,
    statusUpdatedAt = null,
  }) {
    this.wamid = wamid;
    this.waBusinessId = waBusinessId;
    this.phoneNumberId = phoneNumberId;
    this.displayPhoneNumber = displayPhoneNumber;

    this.from = from;
    this.to = to;
    this.type = type;
    this.body = body;
    this.mediaType = mediaType;
    this.mediaId = mediaId;
    this.mediaPath = mediaPath;
    this.timestamp = timestamp;
    this.direction = direction;

    this.clientWaId = clientWaId;
    this.clientName = clientName;

    this.status = status;
    this.statusUpdatedAt = statusUpdatedAt;
  }

  toJson() {
    return {
      wamid: this.wamid,
      wa_business_id: this.waBusinessId,
      phone_number_id: this.phoneNumberId,
      display_phone_number: this.displayPhoneNumber,

      from: this.from,
      to: this.to,
      type: this.type,
      body: this.body,
      media_type: this.mediaType,
      media_id: this.mediaId,
      media_path: this.mediaPath,
      timestamp: this.timestamp,
      direction: this.direction,

      client_wa_id: this.clientWaId,
      client_name: this.clientName,

      status: this.status,
      status_updated_at: this.statusUpdatedAt,
    };
  }

  static fromPayload(payload) {
    if (
      !payload ||
      !payload.entry?.length ||
      !payload.entry[0].changes?.length
    ) {
      return null;
    }

    const entry = payload.entry[0];
    const change = entry.changes[0];
    const value = change.value || {};
    const metadata = value.metadata || {};

    const waBusinessId = entry.id || null;
    const phoneNumberId = metadata.phone_number_id || null;
    const displayPhoneNumber = metadata.display_phone_number || null;

    // Case: Incoming message
    if (value.messages?.length) {
      const msg = value.messages[0];
      const contact = value.contacts?.[0] || {};
      const profile = contact.profile || {};

      let mediaType = null;
      let body = null;
      let mediaId = null;
      let mediaPath = null;

      switch (msg.type) {
        case 'text':
          mediaType = 'text';
          body = msg.text?.body || null;
          break;
        case 'image':
          mediaType = 'image';
          body = msg.image?.caption || 'Image';
          mediaId = msg.image?.id || null;
          mediaPath = msg.image?.mime_type || null;
          break;
        case 'document':
          mediaType = 'document';
          body = msg.document?.caption || 'Document';
          mediaId = msg.document?.id || null;
          mediaPath = msg.document?.filename || null;
          break;
        case 'video':
          mediaType = 'video';
          body = msg.video?.caption || 'Video';
          mediaId = msg.video?.id || null;
          mediaPath = msg.video?.mime_type || null;
          break;
        case 'audio':
          mediaType = 'audio';
          body = 'Audio message';
          mediaId = msg.audio?.id || null;
          mediaPath = msg.audio?.mime_type || null;
          break;
        case 'sticker':
          mediaType = 'sticker';
          body = 'Sticker';
          mediaId = msg.sticker?.id || null;
          break;
        default:
          mediaType = msg.type;
          body = `Received ${msg.type}`;
      }

      return new WhatsappMessage({
        wamid: msg.id,
        waBusinessId,
        phoneNumberId,
        displayPhoneNumber,

        from: msg.from,
        to: phoneNumberId,
        type: msg.type,
        body,
        mediaType,
        mediaId,
        mediaPath,
        timestamp: parseInt(msg.timestamp) * 1000,
        direction: 'inbound',

        clientWaId: contact.wa_id || null,
        clientName: profile.name || null,
      });
    }

    // Case: Status update
    if (value.statuses?.length) {
      const status = value.statuses[0];
      return new WhatsappMessage({
        wamid: status.id,
        waBusinessId,
        phoneNumberId,
        displayPhoneNumber,

        from: phoneNumberId,
        to: status.recipient_id,
        type: 'status',
        body: null,
        mediaType: null,
        mediaId: null,
        mediaPath: null,
        timestamp: parseInt(status.timestamp) * 1000,
        direction: 'outbound',

        clientWaId: status.recipient_id,
        status: status.status,
        statusUpdatedAt: parseInt(status.timestamp) * 1000,
      });
    }

    return null;
  }

  toChatServiceAdapterPayload({
    unreadCount = 0,
    threadStatus = THREAD_STATUS.QUEUE,
    firstResponseDatetime = null,
    lastResponseDatetime = null,
    currentHandlerUserId = null,
    internalUserDetail = [],
    threadCreatedAt = null,
    threadUpdatedAt = null,
    replyTo = null,
    repliedBy = null,
    chatCreatedAt = null,
    chatUpdatedAt = null
  } = {}) {
    return {
      waBusinessId: this.waBusinessId,
      clientWaId: this.clientWaId,
      clientName: this.clientName,
      phoneNumberId: this.phoneNumberId,
      displayPhoneNumber: this.displayPhoneNumber,
      unreadCount,
      threadStatus,
      firstResponseDatetime,
      lastResponseDatetime,
      currentHandlerUserId,
      internalUserDetail,
      threadCreatedAt,
      threadUpdatedAt,
  
      wamid: this.wamid,
      mediaId: this.mediaId,
      mediaType: this.mediaType,
      mediaPathName: this.mediaPath,
      message: this.body,
      unread: this.direction === 'inbound',
      replyTo,
      repliedBy,
      chatCreatedAt: chatCreatedAt || Date.now(),
      chatUpdatedAt: chatUpdatedAt || Date.now(),
    };
  }  
}

module.exports = WhatsappMessage;