const WhatsappChannel = require("./WhatsappChannel");

class Channel {
  /**
   * Constructor untuk Channel
   * @param {Object} data - Data untuk Channel
   * @param {string|null} data.id - ID unik Channel (opsional)
   * @param {string} data.crmChannelId - ID channel dari CRM
   * @param {Object} data.waChannels - Map dari WhatsApp channels dengan wabaId sebagai key
   * @param {string} data.name - Nama Channel (opsional)
   * @param {boolean} data.isActive - Status Channel (active/inactive)
   * @param {number} data.createdAt - Timestamp pembuatan (opsional)
   * @param {number} data.updatedAt - Timestamp update terakhir (opsional)
   */
  constructor(data) {
    if (!data.crmChannelId) {
      throw new Error("crmChannelId is required");
    }
    if (typeof data.waChannels !== 'object' || data.waChannels === null) {
      throw new Error("waChannels must be an object");
    }

    this.id = data.id || null;
    this.crmChannelId = data.crmChannelId;
    this.waChannels = data.waChannels || {}; // Object/Map dengan wabaId sebagai key
    this.name = data.name || null;
    this.isActive = typeof data.isActive === 'boolean' ? data.isActive : true;
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  /**
   * Mengecek apakah Meta Channel memiliki WhatsApp channel dengan wabaId tertentu
   * @param {string} wabaId - WhatsApp Business Account ID
   * @returns {boolean} - true jika channel ada
   */
  hasWhatsAppChannel(wabaId) {
    return Boolean(this.waChannels[wabaId]);
  }

  /**
   * Mendapatkan WhatsApp channel berdasarkan wabaId
   * @param {string} wabaId - WhatsApp Business Account ID
   * @returns {Object|null} - Data WhatsApp channel atau null jika tidak ditemukan
   */
  getWhatsAppChannel(wabaId) {
    return this.waChannels[wabaId] || null;
  }

  /**
   * Mencari WhatsApp channel berdasarkan phoneNumberId
   * @param {string} phoneNumberId - Phone Number ID yang dicari
   * @returns {Object|null} - WhatsApp channel details dan wabaId, atau null jika tidak ditemukan
   */
  findWhatsAppChannelByPhoneNumberId(phoneNumberId) {
    for (const [wabaId, channel] of Object.entries(this.waChannels)) {
      if (channel.phoneNumberId === phoneNumberId) {

        const waChannel = new WhatsappChannel({
          phoneNumberId: channel.phoneNumberId,
          displayPhoneNumber: channel.displayPhoneNumber,
          accessToken: channel.accessToken,
          createdAt: channel.createdAt,
          isActive: channel.isActive,
          metadata: channel.metadata,
          name: channel.name,
          updatedAt: channel.updatedAt
        });

        return {
          wabaId: wabaId,
          whatsappChannel: waChannel
        }
      }
    }
    return null;
  }

  /**
   * Mendapatkan semua WhatsApp channels yang aktif
   * @returns {Object} - Map dari WhatsApp channels yang aktif dengan wabaId sebagai key
   */
  getActiveWhatsAppChannels() {
    const activeChannels = {};
    
    for (const [wabaId, channel] of Object.entries(this.waChannels)) {
      if (channel.isActive === true) {
        activeChannels[wabaId] = channel;
      }
    }
    
    return activeChannels;
  }
  /**
   * Convert Meta Channel ke JSON untuk penyimpanan
   * @returns {Object} - Representasi JSON dari Meta Channel
   */
  toJSON() {
    return {
      id: this.id,
      crm_channel_id: this.crmChannelId,
      wa_channels: this.waChannels,
      name: this.name,
      is_active: this.isActive,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
  
    const data = doc.data();
  
    return new Channel({
      id: doc.id,
      crmChannelId: data.crm_channel_id,
      waChannels: data.wa_channels,
      name: data.name,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  }
}

module.exports = Channel;