const Channel = require('../../domain/entities/Channel');
const WhatsappChannel = require('../../domain/entities/WhatsappChannel');

class ManageChannel {
  /**
   * Constructor untuk usecase ManageChannel
   * @param {Object} channelRepository - Repository untuk Channel
   */
  constructor(channelRepository) {
    this.channelRepository = channelRepository;
  }

  /**
   * Membuat Channel baru
   * @param {Object} data - Data untuk Channel baru
   * @returns {Promise<Channel>} - Channel yang telah dibuat
   */
  async createChannel(data) {
    try {
      if (!data.crmChannelId) {
        throw new Error('crmChannelId is required');
      }

      const channel = new Channel({
        crmChannelId: data.crmChannelId,
        name: data.name,
        isActive: data.isActive || true,
        waChannels: {}
      });

      const savedChannel = await this.channelRepository.save(channel);
      return savedChannel;
    } catch (error) {
      console.error('Error creating Channel:', error);
      throw error;
    }
  }

  /**
   * Menambahkan WhatsApp channel ke Channel
   * @param {string} channelId - ID Channel
   * @param {string} wabaId - WhatsApp Business Account ID
   * @param {Object} waChannelData - Data WhatsApp channel
   * @returns {Promise<Channel>} - Channel yang telah diupdate
   */
  async addWhatsAppChannel(channelId, wabaId, waChannelData) {
    try {
      // Validasi input
      if (!channelId || !wabaId) {
        throw new Error('channelId and wabaId are required');
      }

      if (!waChannelData.phoneNumberId || !waChannelData.displayPhoneNumber) {
        throw new Error('phoneNumberId and displayPhoneNumber are required');
      }

      // Ambil Channel
      const channel = await this.channelRepository.getById(channelId);
      if (!channel) {
        throw new Error(`Channel with ID ${channelId} not found`);
      }

      // Periksa apakah wabaId sudah ada
      if (channel.hasWhatsAppChannel(wabaId)) {
        return {
          channel: channel,
          whatsappChannel: channel.getWhatsAppChannel(wabaId)
        }
        // throw new Error(`WhatsApp channel with wabaId ${wabaId} already exists in this Channel`);
      }

      // Buat WhatsApp channel baru
      const whatsappChannel = new WhatsappChannel({
        phoneNumberId: waChannelData.phoneNumberId,
        displayPhoneNumber: waChannelData.displayPhoneNumber,
        accessToken: waChannelData.accessToken,
        name: waChannelData.name,
        isActive: waChannelData.isActive || true,
        metadata: waChannelData.metadata
      });

      if (!whatsappChannel.isValid()) {
        throw new Error('Invalid WhatsApp channel data');
      }

      // Tambahkan ke Channel
      channel.waChannels[wabaId] = whatsappChannel.toJSON();
      channel.updatedAt = Date.now();

      // Simpan perubahan
      const updatedChannel = await this.channelRepository.save(channel);
      return {
        channel: updatedChannel,
        whatsappChannel: updatedChannel.getWhatsAppChannel(wabaId)
      }
    } catch (error) {
      console.error('Error adding WhatsApp channel:', error);
      throw error;
    }
  }

  /**
   * Menghapus WhatsApp channel dari Channel
   * @param {string} channelId - ID Channel
   * @param {string} wabaId - WhatsApp Business Account ID
   * @returns {Promise<Channel>} - Channel yang telah diupdate
   */
  async removeWhatsAppChannel(channelId, wabaId) {
    try {
      // Validasi input
      if (!channelId || !wabaId) {
        throw new Error('channelId and wabaId are required');
      }

      // Ambil Channel
      const channel = await this.channelRepository.getById(channelId);
      if (!channel) {
        throw new Error(`Channel with ID ${channelId} not found`);
      }

      // Periksa apakah wabaId ada
      if (!channel.hasWhatsAppChannel(wabaId)) {
        throw new Error(`WhatsApp channel with wabaId ${wabaId} not found in this Channel`);
      }

      // Hapus dari Channel
      delete channel.waChannels[wabaId];
      channel.updatedAt = Date.now();

      // Simpan perubahan
      const updatedChannel = await this.channelRepository.save(channel);
      return updatedChannel;
    } catch (error) {
      console.error('Error removing WhatsApp channel:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan Channel berdasarkan ID
   * @param {string} id - ID Channel
   * @returns {Promise<Channel>} - Channel
   */
  async getChannelById(id) {
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

  /**
   * Mencari Channel yang memiliki WhatsApp channel dengan phoneNumberId tertentu
   * @param {string} phoneNumberId - Phone Number ID WhatsApp
   * @returns {Promise<Object|null>} - Channel dan WhatsApp channel info
   */
  async findByPhoneNumberId(phoneNumberId) {
    try {
      if (!phoneNumberId) {
        throw new Error('phoneNumberId is required');
      }

      // Dapatkan semua Channel
      const allChannels = await this.channelRepository.getAll();
      
      // Iterasi melalui semua Channel
      for (const channel of allChannels) {
        const whatsappChannel = channel.findWhatsAppChannelByPhoneNumberId(phoneNumberId);
        if (whatsappChannel) {
          return {
            channel: channel,
            whatsappChannel: whatsappChannel
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding Channel by phoneNumberId:', error);
      throw error;
    }
  }

  async findByParticipantsId(channelId, participantId) {
    try {
      const channel = await this.channelRepository.getById(channelId);
      if(!channel) {
        return null;
      }

      const matchingWaChannels = {};

      for (const [wabaId, waChannel] of Object.entries(channel.waChannels)) {
        if (waChannel.participants.includes(participantId)) {
          matchingWaChannels[wabaId] = waChannel;
        }
      }
  
      if (Object.keys(matchingWaChannels).length > 0) {
        return {
          channel: channel,
          wa_channels: matchingWaChannels
        };
      }

      return null;
    } catch (error) {
      console.error('Error finding Channel by participants:', error);
      throw error;
    }
  }

  async findByCrmChannelId(crmChannelId) {
    try {
      const channel = this.channelRepository.getByCrmChannelId(crmChannelId);

      return channel;
    } catch (error) {
      console.error('Error finding Channel by crmChannelId:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan semua Channel
   * @param {boolean} activeOnly - Jika true, hanya mengembalikan channel yang aktif
   * @returns {Promise<Array<Channel>>} - Array dari Channel
   */
  async getAllChannels(activeOnly = false) {
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

  /**
   * Mengupdate Channel
   * @param {string} id - ID Channel
   * @param {Object} data - Data yang akan diupdate
   * @returns {Promise<Channel>} - Channel yang telah diupdate
   */
  async updateChannel(id, data) {
    try {
      const channel = await this.channelRepository.getById(id);
      if (!channel) {
        throw new Error(`Channel with ID ${id} not found`);
      }

      // Update fields
      if (data.crmChannelId !== undefined) channel.crmChannelId = data.crmChannelId;
      if (data.name !== undefined) channel.name = data.name;
      if (data.isActive !== undefined) channel.isActive = data.isActive;
      
      channel.updatedAt = Date.now();

      // Simpan perubahan
      const updatedChannel = await this.channelRepository.save(channel);
      return updatedChannel;
    } catch (error) {
      console.error('Error updating Channel:', error);
      throw error;
    }
  }

  /**
   * Menghapus Channel
   * @param {string} id - ID Channel
   * @returns {Promise<boolean>} - true jika berhasil dihapus
   */
  async deleteChannel(id) {
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