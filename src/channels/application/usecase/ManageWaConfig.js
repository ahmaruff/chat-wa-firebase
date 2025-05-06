class ManageWaConfig{
  constructor(waConfigRepository) {
    this.waConfigRepository = waConfigRepository;
  }

  async save(waConfig) {
    try {
      const result = await this.waConfigRepository.save(waConfig);
      return result;
    } catch (error) {
      console.error('Error save Wa config:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const result = await this.waConfigRepository.getById(id);
      if(!result) {
        throw new Error(`Wa Config with ID ${id} not found`);
      }

      return result;
    } catch (error) {
      console.error('Error get by id Wa config:', error);
      throw error;
    }
  }

  async getByChannelId(channelId) {
    try {
      const result = await this.waConfigRepository.getByChannelId(channelId);

      if(!result) {
        throw new Error(`Wa Config with channel ID ${channelId} not found`);
      }

      return result;
    } catch (error) {
      console.error('Error get wa config by channel id:', error);
      throw error;
    }
  }

  async getByWaBusinessId(waBusinessId) {
    try {
      const result = await this.waConfigRepository.getByWaBusinessId(waBusinessId);
      
      if(!result) {
        throw new Error(`Wa Config with wa business id ${waBusinessId} not found`);
      }

      return result;
    } catch (error) {
      console.error('Error get wa config by channel id & waBusinessId:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.waConfigRepository.delete(id);
      return result;
    } catch (error) {
      console.error('Error delete wa config:', error);
      throw error;
    }
  }
}

module.exports = ManageWaConfig;