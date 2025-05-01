const admin = require('../../shared/utils/firebase');
const config = require('../../shared/utils/configs');
const ThreadRepository = require('../domain/repositories/ThreadRepository');
const Thread = require('../domain/entities/Thread');
const THREAD_STATUS = require('../../shared/constants/chatStatus');

const FIREBASE_THREAD_COLLECTION = config.firebase.thread_collection || 'wa_thread_test';

class FirestoreThreadRepository extends ThreadRepository {
  constructor() {
    super();
    this.db = admin.firestore();
    this.threadCollection = this.db.collection(FIREBASE_THREAD_COLLECTION);
  }

  _documentToEntity(doc) {
    if (!doc.exists) return null;
    
    const data = doc.data();

    return Thread.fromFirestore(doc);
  }

  async save(thread) {
    try {
      // const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const timestamp = Date.now();
      const existingThread = await this.getByWhatsappInfo(thread.waBusinessId, thread.contactWaId);
  
      let threadRef;
      let savedThread;

      // Convert Thread entity to Firestore document data
      const threadData = {
        wa_business_id: thread.waBusinessId,
        contact_name: thread.contactName,
        contact_wa_id: thread.contactWaId,
        display_phone_number: thread.displayPhoneNumber,
        start_time: thread.startTime || timestamp,
        end_time: thread.endTime || null,
        last_message: thread.lastMessage,
        last_updated: thread.lastUpdated || timestamp,
        status: thread.status || THREAD_STATUS.QUEUE
      };

      if (existingThread) {
        if (existingThread.status === THREAD_STATUS.COMPLETED) {
          // If the thread is completed (status 2), create a new thread
          threadRef = await this.threadCollection.add(threadData);
          
          // Get the complete thread document to return
          const newThreadDoc = await threadRef.get();
          savedThread = this._documentToEntity(newThreadDoc);
        } else {
          // If the thread is in 'queue' (0) or 'processed' (1), update the existing thread
          threadRef = this.threadCollection.doc(existingThread.id);
          await threadRef.update(threadData);
          
          // Get the updated thread document to return
          const updatedThreadDoc = await threadRef.get();
          savedThread = this._documentToEntity(updatedThreadDoc);
        }
      } else {
        threadRef = this.threadCollection.doc();
        threadData.id = threadRef.id;
        await threadRef.set(threadData);
        const newThreadDoc = await threadRef.get();
        savedThread = this._documentToEntity(newThreadDoc);
      }
  
      return savedThread;
    } catch (error) {
      console.error('Error saving thread to Firestore:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!id) {
        throw new Error('Thread ID is required for deletion');
      }
      
      // Periksa apakah thread ada sebelum dihapus
      const threadDoc = await this.threadCollection.doc(id).get();
      
      if (!threadDoc.exists) {
        console.warn(`Attempted to delete non-existent thread with ID: ${id}`);
        return false;
      }
      
      // Hapus thread
      await this.threadCollection.doc(id).delete();
      
      console.log(`Thread with ID ${id} successfully deleted`);
      return true;
    } catch (error) {
      console.error(`Error deleting thread with ID ${id}:`, error);
      throw error;
    }
  }

  async getByWhatsappInfo(waBusinessId, contactWaId){
    if (!waBusinessId || !contactWaId) {
      console.warn('Missing waBusinessId or contactWaId:', { waBusinessId, contactWaId });
      return null;
    }
    try {
      const existingThreadQuery = await this.threadCollection
        .where('wa_business_id', '==', waBusinessId)
        .where('contact_wa_id', '==', contactWaId)
        .limit(1)
        .get();

      if (existingThreadQuery.empty) return null;

      return this._documentToEntity(existingThreadQuery.docs[0]);
    } catch (error) {
      console.error('Error get thread by whatsapp info from Firestore:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const threadDoc = await this.threadCollection.doc(id).get();

      if (!threadDoc.exists) {
        return null;
      }

      return this._documentToEntity(threadDoc);
    } catch (error) {
      console.error('Error get by id from Firestore:', error);
      throw error;
    }
  }
}

module.exports = FirestoreThreadRepository;