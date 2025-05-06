const Channel = require('../domain/entities/Channel');
const ChannelRepository = require('../domain/repositories/ChannelRepository');

const config = require('../../shared/utils/configs');
const admin = require('../../shared/utils/firebase');

const CHANNEL_COLLECTION = config.firebase.channel_collection || 'channels_dev';

class FirestoreChannelRepository extends ChannelRepository {
  constructor() {
    super();
    this.db = admin.firestore();
    this.collection = this.db.collection(CHANNEL_COLLECTION);
  }

  // Helper method to convert Firestore document to Chat entity
  _documentToEntity(doc) {
    if (!doc || !doc.exists) {
      return null;
    }
    
    const data = doc.data();
    if (!data) {
      return null;
    }
        
    return Channel.fromFirestore(doc);
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
      const timestamp = Date.now();

      const data = channel.toJson();
      data.updated_at = timestamp;

      let docRef;
      if (channel.id) {
        // Update existing document
        docRef = this.collection.doc(channel.id);
        await docRef.update(data);        
        onsole.log(`Updated channel with ID: ${channel.id}`);
        
        const updatedDoc = await docRef.get();
        return this._documentToEntity(updatedDoc);
      } else {
        // Create new document
        docRef = this.collection.doc();
        data.id = docRef.id;  
        data.created_at = timestamp;
        await docRef.set(data);
        console.log(`Created new entity with ID: ${data.id}`);

        const snapshot = await docRef.get();
        return this._documentToEntity(snapshot);
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

      return this._documentToEntity(doc);
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
      return this._documentToEntity(doc);
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
      return snapshot.docs.map(doc => this._documentToEntity(doc));
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
        .where('is_active', '==', true)
        .get();

      return snapshot.docs.map(doc => this._documentToEntity(doc));
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