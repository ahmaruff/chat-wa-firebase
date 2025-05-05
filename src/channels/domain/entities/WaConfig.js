class WaConfig {
  constructor({
    id,
    channelId,
    isActive,
    waBusinessId,
    phoneNumberId,
    displayPhoneNumber,
    accessToken,
    participants,
  }){
    this.id = id ?? null;
    this.channelId = channelId;
    this.isActive = isActive;
    this.waBusinessId = waBusinessId;
    this.phoneNumberId = phoneNumberId;
    this.displayPhoneNumber = displayPhoneNumber;
    this.accessToken = accessToken ?? null;
    this.participants = participants ?? [];
  }

  toJson(){
    return {
      id: this.id,
      channel_id: this.channelId,
      is_active: this.isActive,
      wa_business_id: this.waBusinessId,
      phone_number_id: this.phoneNumberId,
      display_phone_number: this.displayPhoneNumber,
      access_token: this.accessToken,
      participants: this.participants,
    }
  }

  static fromJson(data){
    return new WaConfig({
      id: data.id,
      channelId: data.channel_id,
      isActive: data.is_active,
      waBusinessId: data.wa_business_id,
      phoneNumberId: data.phone_number_id,
      displayPhoneNumber: data.display_phone_number,
      accessToken: data.access_token,
      participants: data.participants,
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
  
    const data = doc.data();
    return new WaConfig({
      id: doc.id,
      channelId: data.channel_id,
      isActive: data.is_active,
      waBusinessId: data.wa_business_id,
      phoneNumberId: data.phone_number_id,
      displayPhoneNumber: data.display_phone_number,
      accessToken: data.access_token,
      participants: data.participants,
    });
  }
}

module.exports = WaConfig;