const STATUS = require("../../../shared/constants/statusCodes");
const responseFormatter = require("../../../shared/utils/responseFormatter");
const ManageWaConfig = require("../../application/usecase/ManageWaConfig");
const WaConfig = require("../../domain/entities/WaConfig");

class WaConfigController {
  constructor(waConfigRepository, channelRepository) {
    this.waConfigRepository = waConfigRepository;
    this.channelRepository = channelRepository;
    this.manageWaConfig = new ManageWaConfig(this.waConfigRepository, this.channelRepository);
  }

  async save(req, res) {
    try {
      const {
        channel_id,
        is_active = true,
        name,
        wa_business_id,
        phone_number_id,
        display_phone_number,
        access_token,
        participants
      } = req.body;

      const waConfig = new WaConfig({
        id: null,
        channelId: channel_id,
        isActive: is_active,
        name: name,
        waBusinessId: wa_business_id,
        phoneNumberId: phone_number_id,
        displayPhoneNumber: display_phone_number,
        accessToken: access_token,
        participants: participants ?? []
      });

      const wa = await this.manageWaConfig.save(waConfig);

      return res.status(201).json(responseFormatter(STATUS.SUCCESS, 201, "Create wa Config success", {
        wa_config: wa
      }));
    } catch (error) {
      console.error('Controller - Create Wa config Failed: ', error);
      return res.status(500).json(responseFormatter(STATUS.ERROR, 500, `Create wa config failed: ${error.message}`,null));
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const waConfig = await this.manageWaConfig.getById(id);
      return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'Get wa config success', {
        wa_config: waConfig,
      }));
    } catch (error) {
      console.error('Controller - Failed get wa config by id: ', error);
      return res.status(500).json(responseFormatter(STATUS.ERROR, 500, error.message, null));
    }
  }

  async getByChannelId(req, res) {
    try {
      const { channel_id } = req.body;

      const waConfig = await this.manageWaConfig.getByChannelId(channel_id);
      return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'Get wa config success', {
        wa_config: waConfig,
      }));
    } catch (error) {
      console.error('Controller - Failed get wa config by channel id: ', error);
      return res.status(500).json(responseFormatter(STATUS.ERROR, 500, error.message, null));
    }
  }

  async getByWaBusinessId(req, res) {
    try {
      const { wa_business_id } = req.body;

      const waConfig = await this.manageWaConfig.getByWaBusinessId(wa_business_id);

      return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'Get wa config success', {
        wa_config: waConfig,
      }));
    } catch (error) {
      console.error('Controller - Failed get wa config by wa business id: ', error);
      return res.status(500).json(responseFormatter(STATUS.ERROR, 500, error.message, null));
    }
  }

  async getByCrmChannelId(req, res) {
    try {
      const { crm_channel_id } = req.body;

      const waConfig = await this.manageWaConfig.getByCrmChannelId(crm_channel_id);
      
      return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'Get wa config success', {
        wa_config: waConfig,
      }));
    } catch (error) {
      console.error('Controller - Failed get wa config by crm channel id: ', error);
      return res.status(500).json(responseFormatter(STATUS.ERROR, 500, error.message, null));
    }
  }

  async getByParticipants(req, res) {
    try {
      const { channel_id, participant_id } = req.body;

      const waConfig = await this.manageWaConfig.getByParticipants(channel_id, participant_id);

      return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200, 'Get wa config success', {
        wa_config: waConfig,
      }));

    } catch (error) {
      console.error('Controller - Failed get wa config by participants: ', error);
      return res.status(500).json(responseFormatter(STATUS.ERROR, 500, error.message, null));
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id || req.body.id;
    
      if (!id) {
        return res.status(400).json(responseFormatter(STATUS.FAIL, 400, 'ID is required', null));
      }
      
      const result = await this.manageWaConfig.delete(id);

      if(!result) {
        return res.status(400).json(responseFormatter(STATUS.FAIL, 400), 'Failed delete wa config', null);
      }

      return res.status(200).json(responseFormatter(STATUS.SUCCESS, 200), 'Success delete wa config', null);
    } catch (error) {
      console.error('Controller - Failed delete wa config:', error);
      return res.status(500).json(responseFormatter(STATUS.ERROR, 500, error.message, null));
    }
  }
}

module.exports = WaConfigController;