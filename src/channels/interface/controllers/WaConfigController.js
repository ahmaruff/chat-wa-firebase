const STATUS = require("../../../shared/constants/statusCodes");
const responseFormatter = require("../../../shared/utils/responseFormatter");
const ManageWaConfig = require("../../application/usecase/ManageWaConfig");
const WaConfig = require("../../domain/entities/WaConfig");

class WaConfigController {
  constructor(waConfigRepository) {
    this.waConfigRepository = waConfigRepository;
    this.manageWaConfig = new ManageWaConfig(this.waConfigRepository);
  }

  async save(req, res) {
    try {
      const {
        channel_id,
        is_active = true,
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
}