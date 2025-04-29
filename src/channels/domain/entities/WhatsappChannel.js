/**
 * Entity untuk WhatsApp Channel
 * Merepresentasikan satu nomor WhatsApp Business
 */
class WhatsappChannel {
  /**
   * Constructor untuk WhatsApp Channel
   * @param {Object} data - Data untuk WhatsApp Channel
   * @param {string} data.phoneNumberId - Phone Number ID dari WhatsApp Business API
   * @param {string} data.displayPhoneNumber - Nomor telepon yang ditampilkan
   * @param {string|null} data.accessToken - Token akses untuk WhatsApp API (opsional)
   * @param {string|null} data.name - Nama channel (opsional)
   * @param {boolean} data.isActive - Status channel (active/inactive)
   * @param {Object} data.metadata - Metadata tambahan (opsional)
   * @param {number} data.createdAt - Timestamp pembuatan (opsional)
   * @param {number} data.updatedAt - Timestamp update terakhir (opsional)
   */
  constructor(data) {
    this.phoneNumberId = data.phoneNumberId;
    this.displayPhoneNumber = data.displayPhoneNumber;
    this.accessToken = data.accessToken || null;
    this.name = data.name || null;
    this.isActive = data.isActive || true;
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
  }

  /**
   * Mengecek apakah WhatsApp channel memiliki token akses
   * @returns {boolean} - true jika memiliki token akses
   */
  hasAccessToken() {
    return Boolean(this.accessToken);
  }

  /**
   * Mengecek apakah data WhatsApp channel valid
   * @returns {boolean} - true jika valid
   */
  isValid() {
    return Boolean(this.phoneNumberId && this.displayPhoneNumber);
  }

  /**
   * Mendapatkan nama display untuk channel
   * @returns {string} - Nama atau nomor telepon jika nama tidak ada
   */
  getDisplayName() {
    return this.name || this.displayPhoneNumber;
  }

  /**
   * Convert WhatsApp Channel ke JSON untuk penyimpanan
   * @returns {Object} - Representasi JSON dari WhatsApp Channel
   */
  toJSON() {
    return {
      phone_number_id: this.phoneNumberId,
      display_phone_number: this.displayPhoneNumber,
      access_token: this.accessToken,
      name: this.name,
      is_active: this.isActive,
      metadata: this.metadata,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}

module.exports = WhatsappChannel;