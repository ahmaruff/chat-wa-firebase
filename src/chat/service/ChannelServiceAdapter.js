const ChannelService = require('../../channels/service/ChannelService');
const FirestoreChannelRepository = require('../../channels/infrastructure/FirestoreChannelRepository');
const FirestoreWaConfigRepository = require('../../channels/infrastructure/FirestoreWaConfigRepository');

const firestoreChannelRepository = new FirestoreChannelRepository();
const firestoreWaConfigRepository = new FirestoreWaConfigRepository();
class ChannelServiceAdapter {
  constructor() {
    this.channelService = new ChannelService(firestoreChannelRepository, firestoreWaConfigRepository);
  }

  async getAllChannels(activeOnly = false) {
    try {
      const result = await this.channelService.getAllChannels(activeOnly);
      return result;
    } catch (error) {
      console.error('Chat Channel Adapter: Get all channels failed: ', error);
      throw error;
    }
  }

  async getChannelById(id) {
    try {
      const result = await this.channelService.getChannelById(id);
      return result;
    } catch (error) {
      console.error('Chat Channel Adapter: Get channel by id failed: ', error);
      throw error;
    }
  }

  async getChannelByCrmChannelId(crmChannelId) {
    try {
      const result = await this.channelService.getChannelByCrmChannelId(crmChannelId);
      return result;
    } catch (error) {
      console.error('Chat Channel Adapter: Get channel by crm channel id failed: ', error);
      throw error;
    }
  }

  async getWaConfigById(id) {
    try {
      const result = await this.channelService.getWaConfigById(id);
      return result;
    } catch (error) {
      console.error('Chat Channel Adapter: Get wa config by id failed: ', error);
      throw error;
    }
  }

  async getWaConfigByWaBusinessId(waBusinessId) {
    try {
      const result = await this.channelService.getWaConfigByWaBusinessId(waBusinessId);
      return result;
    } catch (error) {
      console.error('Chat Channel Adapter: Get wa config by wa business id failed: ', error);
      throw error;
    }
  }

  async getWaConfigByParticipants(channelId, participantId) {
    try {
      const result = await this.channelService.getWaConfigByParticipants(channelId, participantId);
      return result;
    } catch (error) {
      console.error('Chat Channel Adapter: Get wa config by participants failed: ', error);
      throw error;
    }
  }

  async saveWaConfig({
    id = null,
    channelId,
    isActive = true,
    name,
    waBusinessId,
    phoneNumberId,
    displayPhoneNumber,
    accessToken,
    createdAt = Date.now(),
    updatedAt = Date.now(),
  }) {
    try {
      const result = await this.channelService.saveWaConfig({
        id: id ?? null,
        channelId: channelId,
        isActive: isActive,
        name: name,
        waBusinessId: waBusinessId,
        phoneNumberId: phoneNumberId,
        displayPhoneNumber: displayPhoneNumber,
        accessToken: accessToken,
        createdAt: createdAt,
        updatedAt: updatedAt,
      });

      return result;
    } catch (error) {
      console.error('Chat Channel Adapter: Save wa config failed: ', error);
      throw error;
    }
  }
}

module.exports = ChannelServiceAdapter;