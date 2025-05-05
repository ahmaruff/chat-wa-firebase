const Channel = require('../../domain/entities/Channel');


class ManageChannel{
  constructor(channelRepository) {
    this.channelRepository = channelRepository;
  }

  async save(channel) {
    try {
      const savedChannel = await this.channelRepository.save(channel);
      return savedChannel;
    } catch (error) {
      console.error('Error create channel:', error);
    }
  }

  async getById(id) {
    try {
      const channel = await this.channelRepository.getById(id);
      if (!channel) {
        throw new Error(`Channel with ID ${id} not found`);
      }
      return channel;
    } catch (error) {
      console.error('Error getting Channel by ID:', error);
      throw error;
    }
  }

  async getByCrmChannelId(crmChannelId) {
    try {
      const channel = this.channelRepository.getByCrmChannelId(crmChannelId);
      if (!channel) {
        throw new Error(`Channel with CRM channel ID ${crmChannelId} not found`);
      }
      return channel;
    } catch (error) {
      console.error('Error finding Channel by crmChannelId:', error);
      throw error;
    }
  }

  async getAll(activeOnly = false) {
    try {
      const allChannels = await this.channelRepository.getAll();
      
      if (activeOnly) {
        return allChannels.filter(channel => channel.isActive);
      }
      
      return allChannels;
    } catch (error) {
      console.error('Error getting all Channels:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.channelRepository.delete(id);
      return result;
    } catch (error) {
      console.error('Error deleting Channel:', error);
      throw error;
    }
  }
}

module.exports = ManageChannel;