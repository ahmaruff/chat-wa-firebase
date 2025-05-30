const WaConfigRepository = require("../domain/repositories/WaConfigRepository");

const config = require('../../shared/utils/configs');
const admin = require('../../shared/utils/firebase');
const WaConfig = require("../domain/entities/WaConfig");
const FirestoreChannelRepository = require("./FirestoreChannelRepository");

const WA_CONFIG_COLLECTION = config.firebase.wa_config_collection || 'wa_configs_dev';


class FirestoreWaConfigRepository extends WaConfigRepository{
  constructor(channelRepository = null){
    super();
    this.db = admin.firestore();
    this.collection = this.db.collection(WA_CONFIG_COLLECTION);
  }

  _documentToEntity(doc) {
    if (!doc || !doc.exists) {
      return null;
    }
    
    const data = doc.data();
    if (!data) {
      return null;
    }
        
    return WaConfig.fromFirestore(doc);
  }

  async save(waConfig) {
    if(!(waConfig instanceof WaConfig)) {
      throw new Error("Invalid WaConfig object");
      
    }

    try {
      const timestamp = Date.now();
      const data = waConfig.toJson();
      data.updated_at = timestamp;

      let docRef;
      if (waConfig.id) {
        // Update existing document
        docRef = this.collection.doc(waConfig.id);
        await docRef.update(data);
        
        const updatedDoc = await docRef.get();
        return this._documentToEntity(updatedDoc);
      } else {
        // Create new document
        docRef = this.collection.doc();
        data.id = docRef.id;  
        data.created_at = timestamp;
        await docRef.set(data);

        const snapshot = await docRef.get();
        return this._documentToEntity(snapshot);
      }
    } catch (error) {
      console.error('Error saving WaConfig:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }

      return this._documentToEntity(doc);
    } catch (error) {
      console.error('Error getting WaConfig by ID:', error);
      throw error;
    }
  }

  async getByChannelId(channelId) {
    try {
      const snapshot = await this.collection
        .where('channel_id', '==', channelId)
        .get();

      return snapshot.docs.map(doc => this._documentToEntity(doc));
    } catch (error) {
      console.error('Error getting Wa Config:', error);
      throw error;
    }
  }

  async getByWaBusinessId(waBusinessId) {
    try {
      const snapshot = await this.collection
        .where('wa_business_id', '==',waBusinessId)
        .limit(1)
        .get();

      const doc = snapshot.docs[0];
      return this._documentToEntity(doc);
    } catch (error) {
      console.error('Error getting Wa Config by wa bussiness id:', error);
      throw error;
    }
  }

  async getByParticipants(channelId, participantId) {
    try {
      // First, get all waConfigs for the channel
      const snapshot = await this.collection
        .where('channel_id', '==', channelId)
        .get();
      
      // Then filter those that contain the participantId in the participants array
      const waConfigs = snapshot.docs
        .map(doc => this._documentToEntity(doc))
        .filter(waConfig => 
          waConfig.participants && 
          waConfig.participants.includes(participantId)
        );
        
      return waConfigs;
    } catch (error) {
      console.error('Error getting Wa Config by participants:', error);
      throw error;
    }
  }

  async getAllActive(channelId){
    try {
      const snapshot = await this.collection
        .where('channel_id', '==', channelId)
        .where('is_active', '==', true)
        .get();

      return snapshot.docs.map(doc => this._documentToEntity(doc));
    } catch (error) {
      console.error('Error getting all active Wa Config:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.collection.doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting wa config:', error);
      throw error;
    }
  }
}

module.exports = FirestoreWaConfigRepository;