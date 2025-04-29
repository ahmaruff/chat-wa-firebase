const Channel = require('../domain/entities/Channel');
const config = require('../../shared/utils/configs');

const CHANNEL_COLLECTION = config.firebase.channel_collection;

class FirestoreChannelRepository {
  /**
   * Constructor untuk FirestoreChannelRepository
   * @param {Firestore} firestore - Instance Firestore (opsional, default dari config)
   */
  constructor(firestore) {
    this.db = firestore || config.firebase.firestore;
    this.collection = this.db.collection(CHANNEL_COLLECTION);
  }

  /**
   * Menyimpan Channel ke Firestore
   * @param {Channel} channel - Channel yang akan disimpan
   * @returns {Promise<Channel>} - Channel yang telah disimpan dengan ID
   */
  async save(channel) {
    if (!(channel instanceof Channel)) {
      throw new Error('Invalid Channel object');
    }

    try {
      const data = channel.toJSON();
      data.updatedAt = Date.now();

      let docRef;
      if (channel.id) {
        // Update existing document
        docRef = this.collection.doc(channel.id);
        await docRef.update(data);
        return new Channel({ ...data, id: docRef.id });
      } else {
        // Create new document
        data.createdAt = Date.now();
        docRef = await this.collection.add(data);
        return new Channel({ ...data, id: docRef.id });
      }
    } catch (error) {
      console.error('Error saving Channel:', error);
      throw error;
    }
  }

  /**
   * Mengambil Channel berdasarkan ID
   * @param {string} id - ID Channel
   * @returns {Promise<Channel|null>} - Channel atau null jika tidak ditemukan
   */
  async getById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return new Channel({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error getting Channel by ID:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan Channel berdasarkan crmChannelId
   * @param {string} crmChannelId - CRM Channel ID
   * @returns {Promise<Channel|null>} - Channel atau null jika tidak ditemukan
   */
  async getByCrmChannelId(crmChannelId) {
    try {
      const snapshot = await this.collection
        .where('crm_channel_id', '==', crmChannelId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return new Channel({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error getting Channel by CRM Channel ID:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan semua Channel
   * @returns {Promise<Array<Channel>>} - Array dari Channel
   */
  async getAll() {
    try {
      const snapshot = await this.collection.get();
      return snapshot.docs.map(doc => new Channel({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all Channels:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan semua Channel yang aktif
   * @returns {Promise<Array<Channel>>} - Array dari Channel yang aktif
   */
  async getAllActive() {
    try {
      const snapshot = await this.collection
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map(doc => new Channel({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting active Channels:', error);
      throw error;
    }
  }

  /**
   * Menghapus Channel berdasarkan ID
   * @param {string} id - ID Channel yang akan dihapus
   * @returns {Promise<boolean>} - true jika berhasil dihapus
   */
  async delete(id) {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting Channel:', error);
      throw error;
    }
  }
}

module.exports = FirestoreChannelRepository;