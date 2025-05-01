const ChannelService = require('../../channels/service/ChannelService');
const FirestoreChannelRepository = require('../../channels/infrastructure/FirestoreChannelRepository');

const firestoreChannelRepository = new FirestoreChannelRepository();

class ChannelServiceAdapter{
  constructor() {
    this.channelService = new ChannelService(firestoreChannelRepository);
  }

  async addWhatsappChannel({wabaId, phoneNumberId, name, displayPhoneNumber, accessToken= null, isActive = null, metadata = {}, participants = []}) {
    try {
      const number = phoneNumberId || wabaId;
      const channel = await this.channelService.findByPhoneNumber(phoneNumberId);

      if(!channel) {
        console.log('WA Channel Adapter - cannot find channel by phone id/waba id');
        return null;
      }

      const result = await this.channelService.addWhatsAppChannel({
        channelId: channel.id,
        wabaId: wabaId,
        phoneNumberId: phoneNumberId || wabaId,
        name: name,
        displayPhoneNumber: displayPhoneNumber,
        accessToken: accessToken || null,
        isActive: isActive || true,
        metadata: metadata | {},
        participants: participants || []
      });

      if(!result) {
        console.log('WA Channel Adapter - cannot add whatsapp channel');

        return null;
      }

      return result;
    } catch (error) {
      console.log('WA Adapter: Error Add Whatsapp Channel: ', error);
      throw error;
    }
  }

  async getWhatsappChannel(wabaId) {
    try {
      const result = await this.channelService.findByWabaId(wabaId);
      
      if(!result) {
        return null;
      }

      return result;
    } catch (error) {
      console.log('WA Adapter: Error Get Whatsapp Channel: ', error);
      throw error;
    }
  }

  async getWhatsappChannelByParticipantId(channelId, participantId) {
    try {
      const result = await this.channelService.findByParticipantId(channelId, participantId);
      if(!result) {
        return null;
      }

      return result;
    } catch (error) {
      console.log('WA Adapter: Error Get Whatsapp Channel By participant id: ', error);
      throw error;
    }
  }
}

module.exports = ChannelServiceAdapter;