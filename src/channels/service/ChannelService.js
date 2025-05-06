const ManageChannel = require('../application/usecase/ManageChannel');
const ManageWaConfig = require('../application/usecase/ManageWaConfig');
const Channel = require('../domain/entities/Channel');
const WaConfig = require('../domain/entities/WaConfig');

class ChannelService {
  constructor(channelRepository, waConfigRepository) {
    this.channelRepository = channelRepository;
    this.waConfigRepository = waConfigRepository;
    this.manageChannel = new ManageChannel(this.channelRepository);
    this.manageWaConfig = new ManageWaConfig(this.waConfigRepository);
  }

  async saveChannel({
    id = null,
    crmChannelId,
    name,
    isActive,
    createdAt,
    updatedAt
  }) {
    try {
      const c = new Channel({
        id: id,
        crmChannelId: crmChannelId,
        isActive: isActive,
        name: name,
        createdAt: createdAt ?? Date.now(),
        updatedAt: updatedAt ?? Date.now(),
      });

      const result = await this.manageChannel.save(c);

      return result;
    } catch (error) {
      console.error('Service - Create Channel failed: ', error);
      throw error;
    }
  }

  async getChannelById(id) {
    try {
      const result = await this.manageChannel.getById(id);

      return result;
    } catch (error) {
      console.error('service - Get Channel by Id failed: ', error);
      throw error;
    }
  }

  async getChannelByCrmChannelId(crmChannelId) {
    try {
      const result = await this.manageChannel.getByCrmChannelId(crmChannelId);
      return result;
    } catch (error) {
      console.error('Service - Get Channel by CRM Channel Id failed: ', error);
      throw error;
    }
  }

  async getAllChannels(activeOnly = false){
    try {
      const result = await this.manageChannel.getAll(activeOnly);

      return result;
    } catch (error) {
      console.error('Service - Get All Channels failed: ', error);
      throw error;
    }
  }

  async deleteChannel(id) {
    try {
      const result = await this.manageChannel.delete(id);

      return result;
    } catch (error) {
      console.error('Service - Delete Channel failed: ', error);
      throw error;
    }
  }

  async saveWaConfig({
    id = null,
    channelId,
    isActive,
    name,
    waBusinessId,
    phoneNumberId,
    displayPhoneNumber,
    accessToken,
    createdAt,
    updatedAt
  }) {
    try {
      const wa = new WaConfig({
        id: id,
        channelId: channelId,
        isActive: isActive,
        name: name,
        waBusinessId: waBusinessId,
        phoneNumberId: phoneNumberId,
        displayPhoneNumber: displayPhoneNumber,
        accessToken: accessToken,
        createdAt: createdAt ?? Date.now(),
        updatedAt: updatedAt ?? Date.now(),
      });

      const result = await this.manageWaConfig.save(wa);
      return result;
    } catch (error) {
      console.error('Service - Create wa config failed: ', error);
      throw error;
    }
  }

  async getWaConfigByChannelId(channelId) {
    try {
      const result = await this.manageWaConfig.getByChannelId(channelId);
      return result;
    } catch (error) {
      console.error('Service - Get wa config by channel id failed: ', error);
      throw error;
    }
  }

  async getWaConfigById(id) {
    try {
      const result = await this.manageWaConfig.getById(id);
      return result;
    } catch (error) {
      console.error('Service - Get wa config by id failed: ', error);
      throw error;
    }
  }

  async getWaConfigByWaBusinessId(waBusinessId) {
    try {
      const result = await this.manageWaConfig.getByWaBusinessId(waBusinessId);
      return result;
    } catch (error) {
      console.error('Service - Get wa config by wa business id failed: ', error);
      throw error;
    }
  }

  async deleteWaConfig(id) {
    try {
      const result = await this.manageWaConfig.delete(id);
      return result;
    } catch (error) {
      console.error('Service - delete wa config failed: ', error);
      throw error;
    }
  }
}

module.exports = ChannelService;