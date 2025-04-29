const ManageChannel = require('../application/usecase/ManageChannel');

class ChannelService {
  constructor(channelRepository) {
    this.channelRepository = channelRepository;
    this.manageChannel = new ManageChannel(this.channelRepository);
  }

  async createChannel({id=null, crmChannelId = null, name, isActive=true, waChannels={}}){
    try {
      const result = await this.manageChannel.createChannel({
        id: id,
        crmChannelId: crmChannelId || null,
        name: name,
        isActive,
        waChannels: waChannels
      }); 

      return result;
    } catch (error) {
      console.log('Create Channel failed: ', error);
      throw error;
    }
  }

  async addWhatsAppChannel({channelId, wabaId, phoneNumberId, name, displayPhoneNumber = null, accessToken= null, isActive = null, metadata = {}}) {
    try {
        const wa = {
          phoneNumberId: phoneNumberId,
          name: name,
          displayPhoneNumber: displayPhoneNumber || phoneNumberId,
          accessToken: accessToken || null,
          isActive: isActive || true,
          metadata: metadata || {}
        }

        const result = await this.manageChannel.addWhatsAppChannel(channelId, wabaId, wa);

        return result;
    } catch (error) {
      console.log('Add Whatsapp to Channel failed: ', error);
      throw error;
    }
  }

  async removeWhatsAppChannel(channelId, wabaId) {
    try {
      const result = await this.manageChannel.removeWhatsAppChannel(channelId, wabaId);

      return result;
    } catch (error) {
      console.log('Remove Whatsapp to Channel failed: ', error);
      throw error;
    }
  }

  async getChannelById(id) {
    try {
      const result = await this.manageChannel.getChannelById(id);

      return result;
    } catch (error) {
      console.log('Get Channel by Id failed: ', error);
      throw error;
    }
  }

  async findByPhoneNumber(phoneNumberId) {
    try {
      const result = await this.manageChannel.findByPhoneNumberId(phoneNumberId);

      if(result) {
        return {
          channel: result.channel,
          whatsappChannel: result.whatsappChannel
        }
      }
      return null;
    } catch (error) {
      console.log('Find By Phone Number Id failed: ', error);
      throw error;
    }
  }

  async getAllChannels(activeOnly = false){
    try {
      const result = await this.manageChannel.getAllChannels(activeOnly);

      return result;
    } catch (error) {
      console.log('Get All Channels failed: ', error);
      throw error;
    }
  }

  async updateChannel(id, data = {}) {
    try {
      const result = await this.manageChannel.updateChannel(id, data);

      return result;
    } catch (error) {
      console.log('Update Channel failed: ', error);
      throw error;
    }
  }

  async deleteChannel(id) {
    try {
      const result = await this.manageChannel.deleteChannel(id);

      return result;
    } catch (error) {
      console.log('Delete Channel failed: ', error);
      throw error;
    }
  }
}

module.exports = ChannelService;