class Channel {
  constructor({
    id,
    crmChannelId,
    isActive,
    name,
    createdAt = Date.now(),
    updatedAt = Date.now(),
  }){
    this.id = id ?? null;
    this.crmChannelId = crmChannelId ?? null;
    this.isActive = isActive ?? true;
    this.name = name;
    this.createdAt = createdAt ?? Date.now();
    this.updatedAt = updatedAt ?? Date.now();
  }

  toJson(){
    return {
      id: this.id,
      crm_channel_id: this.crmChannelId,
      name: this.name,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    }
  }

  static fromJson(data) {
    return new Channel({
      id: data.id,
      crmChannelId: data.crm_channel_id,
      name: data.name,
      isActive: data.is_active,
      name: data.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
  
    const data = doc.data();
    return new Channel({
      id: doc.id,
      crmChannelId: data.crm_channel_id,
      name: data.name,
      isActive: data.is_active,
      name: data.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  }
}

module.exports = Channel;