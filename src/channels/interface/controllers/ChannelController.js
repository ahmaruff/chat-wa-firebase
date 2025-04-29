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
      const result = await this.channelService.findByPhoneNumber(phoneNumberId);

      return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'get channel by phone number', {
        channel: result.channel,
        WhatsappChannel: result.whatsappChannel
      }));
    } catch (error) {
      console.log('Controller - Find By Phone Number  Failed: ', error);
      return res.status(500).json(responseFormatter(STATUS.ERROR, 500, `Controller - Find By Phone Number Failed: ${error.message}`,null));
    }
  }
}

module.exports = ChannelController;