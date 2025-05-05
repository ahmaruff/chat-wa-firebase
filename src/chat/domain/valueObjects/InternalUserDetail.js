const { randomUUID } = require('crypto');

class InternalUserDetail {
  constructor({
    id = null,
    threadId,
    crmUserId = null,
    name,
    imgProfileUrl = null,
    firstResponseDatetime,
    lastResponseDatetime = null
  }) {
    this.id = id ?? InternalUserDetail.generateId();
    this.threadId = threadId;
    this.crmUserId = crmUserId ?? null;
    this.name = name;
    this.imgProfileUrl = imgProfileUrl ?? null;
    this.firstResponseDatetime = firstResponseDatetime ?? null;
    this.lastResponseDatetime = lastResponseDatetime ?? null;
  }

  static generateId() {
    return randomUUID();
  }

  static fromJson(data) {
    return new InternalUserDetail({
      id: data.id ?? InternalUserDetail.generateId,
      threadId: data.thread_id,
      crmUserId: data.crm_user_id,
      name: data.name,
      imgProfileUrl: data.img_profile_user ?? null,
      firstResponseDatetime: data.first_response_datetime ?? null,
      lastResponseDatetime: data.last_response_datetime ?? null,
    });
  }

  toJson(){
    return {
      id: this.id,
      thread_id: this.threadId,
      crm_user_id: this.crmUserId,
      name: this.name,
      img_profile_url: this.imgProfileUrl,
      first_response_datetime: this.firstResponseDatetime,
      last_response_datetime: this.lastResponseDatetime,
    }
  }
}

module.exports = InternalUserDetail;