const STATUS = require("../../../shared/constants/statusCodes");
const responseFormatter = require("../../../shared/utils/responseFormatter");
const ManageChannel = require("../../application/usecase/ManageChannel");
const Channel = require("../../domain/entities/Channel");

class ChannelController {
  constructor(channelRepository) {
    this.channelRepository = channelRepository;
    this.manageChannel = new ManageChannel(this.channelRepository);
  }

  async save(req, res) {
    try {

      const {
        crm_channel_id,
        name,
        is_active,
      } = req.body;
      
      const channel = new Channel({
        id: null,
        crmChannelId: crm_channel_id,
        isActive : is_active,
        name: name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const c = await this.manageChannel.save(channel);

      return res.status(201).json(responseFormatter(STATUS.SUCCESS, 201, 'Create channel Success', {
        channel: c,
      }));
    } catch (error) {
      console.error('Controller - Create Channel Failed: ', error);
      return res.status(500).json(responseFormatter(STATUS.ERROR, 500, `Create channel failed: ${error.message}`,null));
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const c = await this.manageChannel.getById(id);
      return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'Get channel success', {
        channel: c
      }));
    } catch (error) {
      console.error('Controller - get Channel  Failed: ', error);
      return res.status(404).json(responseFormatter(STATUS.ERROR, 404, `${error.message}`, null));
    }
  }

  async getByCrmChannelId(req, res) {
    try {
      const {crm_channel_id} = req.body;

      if(!crm_channel_id) {
        return res.status(400).json(responseFormatter(STATUS.ERROR, 400, `Error: crm_channel_id required`,null));
      }

      const c = await this.manageChannel.getByCrmChannelId(crm_channel_id);
      return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'get channel by crmChannel Id success', {
        channel: c
      }));
    } catch (error) {
      console.log('Controller - Find By CRM Channel Id Failed: ', error);
      return res.status(404).json(responseFormatter(STATUS.ERROR, 404, `${error.message}`,null));
    }
  }
}

module.exports = ChannelController;