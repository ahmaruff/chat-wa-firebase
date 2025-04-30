const STATUS = require("../../../shared/constants/statusCodes");
const responseFormatter = require("../../../shared/utils/responseFormatter");
const WhatsappChannel = require("../../domain/entities/WhatsappChannel");
const ChannelService = require("../../service/ChannelService");

class ChannelController {
  constructor(channelRepository) {
    this.channelRepository = channelRepository;
    this.channelService = new ChannelService(this.channelRepository);
  }

  async save(req, res) {
    try {
      const {crmChannelId, name, isActive = true} = req.body;

      const existingChannel = await this.channelService.getChannelByCrmChannelId(crmChannelId);

      if(existingChannel) {
        const updatedChannel = await this.channelService.updateChannel(existingChannel.id, {
          name: name || existingChannel.name,
          isActive: isActive || existingChannel.isActive
        });

        return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'Channel exists, Channel updated', {
          channel: updatedChannel
        }));
      }

      const result = await this.channelService.createChannel({
        id: null,
        crmChannelId: crmChannelId,
        name: name,
        isActive: isActive,
        waChannels: {}
      });
      
      return res.status(201).json(responseFormatter(STATUS.SUCCESS, 201, 'Channel created', {
        channel: result
      }));
    } catch (error) {
      console.log('Controller - Create Channel Failed: ', error);
      return res.status(500).json(responseFormatter(STATUS.ERROR, 500, `Create channel failed: ${error.message}`,null));
    }
  }

  async addWhatsAppChannel(req, res) {
    try {
      const {channelId, waBusinessId, phoneNumberId, name = 'Unknown', displayPhoneNumber, accessToken = null, isActive = true, metadata = {}, participants = [] } = req.body;

      const result = await this.channelService.addWhatsAppChannel({
        channelId: channelId,
        wabaId: waBusinessId,
        phoneNumberId: phoneNumberId,
        name: name || 'Unknown',
        displayPhoneNumber: displayPhoneNumber || phoneNumberId,
        accessToken: accessToken || null,
        isActive: isActive || true,
        metadata: metadata || {},
        participants: participants || []
      });

      return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'Whatsapp Channel Added', {
        channel: result.channel,
        whatsappChannel: result.whatsappChannel
      }));
    } catch (error) {
      console.log('Controller - Add Whatsapp Channel  Failed: ', error);
      return res.status(500).json(responseFormatter(STATUS.ERROR, 500, `Add Whatsapp Channel Failed: ${error.message}`,null));
    }
  }

  async getChannel(req, res) {
    try {
      const { id } = req.params;

      const result = await this.channelService.getChannelById(id);
      return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'Get channel success', {
        channel: result
      }));
    } catch (error) {
      console.log('Controller - get Channel  Failed: ', error);
      return res.status(404).json(responseFormatter(STATUS.ERROR, 404, `Get Channel Failed: ${error.message}`, null));
    }
  }

  async findByPhoneNumber(req, res) {
    try {
      const { phoneNumberId } = req.body;

      if(!phoneNumberId) {
        return res.status(400).json(responseFormatter(STATUS.ERROR, 400, `Error: phoneNumberId required`,null));
      }

      const result = await this.channelService.findByPhoneNumber(phoneNumberId);

      if(result) {
        return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'get channel by phone number', {
          channel: result.channel,
          WhatsappChannel: result.whatsappChannel
        }));
      }

      return res.status(404).json(responseFormatter(STATUS.FAIL, 404, 'channel not found', null));
    } catch (error) {
      console.log('Controller - Find By Phone Number  Failed: ', error);
      return res.status(500).json(responseFormatter(STATUS.ERROR, 500, `Controller - Find By Phone Number Failed: ${error.message}`,null));
    }
  }

  async findByCrmChannelId(req, res) {
    try {
      const {crmChannelId} = req.body;

      if(!crmChannelId) {
        return res.status(400).json(responseFormatter(STATUS.ERROR, 400, `Error: crmChannelId required`,null));
      }

      const result = await this.channelService.getChannelByCrmChannelId(crmChannelId);
      return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'get channel by crmChannel Id success', {
        channel: result
      }));
    } catch (error) {
      console.log('Controller - Find By CRM Channel Id Failed: ', error);
      return res.status(404).json(responseFormatter(STATUS.ERROR, 404, `Controller - Find By CRM Channel Id Failed: ${error.message}`,null));
    }
  }

  async findByParticipantId(req, res) {
    try {
      const {channelId, participantId} = req.body;

      const result = await this.channelService.findByParticipantId(channelId, participantId);

      if(result) {
        return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'get channel by participant Id success', {
          channel: result.channel,
          wa_channel: result.wa_channels
        }));
      }

      return res.status(404).json(responseFormatter(STATUS.FAIL, 404, 'wa channel not found', null));
    } catch (error) {
      console.log('Controller - Find By participant id Failed: ', error);
      return res.status(404).json(responseFormatter(STATUS.ERROR, 404, `Controller - Find By participant id Failed: ${error.message}`,null));
    }
  }
}

module.exports = ChannelController;