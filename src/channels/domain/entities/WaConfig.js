const EncryptionService = require('../../../shared/utils/EncryptionService');

class WaConfig {
  constructor({
    id,
    channelId,
    isActive,
    name,
    waBusinessId,
    phoneNumberId,
    displayPhoneNumber,
    accessToken,
    participants,
    createdAt,
    updatedAt
  }){
    this.id = id ?? null;
    this.channelId = channelId;
    this.isActive = isActive;
    this.name = name;
    this.waBusinessId = waBusinessId;
    this.phoneNumberId = phoneNumberId;
    this.displayPhoneNumber = displayPhoneNumber;
    this.accessToken = accessToken ?? null;
    this.participants = participants ?? [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJson(){
    return {
      id: this.id,
      channel_id: this.channelId,
      is_active: this.isActive,
      name: this.name,
      wa_business_id: this.waBusinessId,
      phone_number_id: this.phoneNumberId,
      display_phone_number: this.displayPhoneNumber,
      access_token: this.accessToken,
      participants: this.participants,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    }
  }

  static fromJson(data){
    return new WaConfig({
      id: data.id,
      channelId: data.channel_id,
      isActive: data.is_active,
      name: data.name,
      waBusinessId: data.wa_business_id,
      phoneNumberId: data.phone_number_id,
      displayPhoneNumber: data.display_phone_number,
      accessToken: data.access_token,
      participants: data.participants,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
  
    const data = doc.data();
    return new WaConfig({
      id: doc.id,
      channelId: data.channel_id,
      isActive: data.is_active,
      name: data.name,
      waBusinessId: data.wa_business_id,
      phoneNumberId: data.phone_number_id,
      displayPhoneNumber: data.display_phone_number,
      accessToken: data.access_token,
      participants: data.participants,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }

  getToken(){
    try {
      const t = EncryptionService.decrypt(this.accessToken);
      return t;
    } catch (error) {
      console.error('Error getToken', error);
      throw error;
    }
  }
}

module.exports = WaConfig;