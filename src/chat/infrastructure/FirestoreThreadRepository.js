const admin = require('firebase-admin');
const dotenv = require('dotenv');
const ThreadRepository = require('../domain/repositories/ThreadRepository');
const Thread = require('../domain/entities/Thread');
const THREAD_STATUS = require('../../shared/constants/chatStatus');

dotenv.config();
const FIREBASE_THREAD_COLLECTION = process.env('FIREBASE_THREAD_COLLECTION') || 'wa_thread_test';

class FirestoreThreadRepository extends ThreadRepository {
  constructor() {
    super();
    this.db = admin.firestore();
    this.threadCollection = this.db.collection(FIREBASE_THREAD_COLLECTION);
  }

  async save(thread) {
    try {
      // Check if the thread already exists
      const existingThread = await this.getByWhatsappInfo(thread.waBusinessId, thread.contactWaId);
  
      let threadRef;
      if (existingThread) {
        if (existingThread.status === THREAD_STATUS.COMPLETED) {
          // If the thread is completed (status 2), create a new thread
          threadRef = await this.threadCollection.add({
            wa_business_id: thread.waBusinessId,
            contact_name: thread.contactName,
            contact_wa_id: thread.contactWaId,
            display_phone_number: thread.displayPhoneNumber,
            last_message: thread.messageContent.getValue(),
            last_updated: thread.createdAt,
            status: THREAD_STATUS.QUEUE
          });
        } else {
          // If the thread is in 'queue' (0) or 'processed' (1), update the existing thread
          await this.threadCollection.doc(existingThread.id).update({
            last_message: thread.messageContent.getValue(),
            last_updated: thread.createdAt,
          });
          threadRef = this.threadCollection.doc(existingThread.id);
        }
      } else {
        // If the thread doesn't exist, create a new thread
        threadRef = await this.threadCollection.add({
          wa_business_id: thread.waBusinessId,
          contact_name: thread.contactName,
          contact_wa_id: thread.contactWaId,
          display_phone_number: thread.displayPhoneNumber,
          last_message: thread.messageContent.getValue(),
          last_updated: thread.createdAt,
          status: THREAD_STATUS.QUEUE
        });
      }
  
      return threadRef.id;
    } catch (error) {
      console.error('Error saving thread to Firestore:', error);
      throw error;
    }
  }  

  async getByWhatsappInfo(waBusinessId, contactWaId){
    try {
      const existingThreadQuery = await this.threadCollection
        .where('wa_business_id', '==', waBusinessId)
        .where('contact_wa_id', '==', contactWaId)
        .limit(1)
        .get();

      if (!existingThreadQuery.empty) {
        const threadDoc = existingThreadQuery.docs[0];
        const threadData = threadDoc.data();

        const thread = new Thread({
          id: threadDoc.id,
          waBusinessId: threadData.wa_business_id,
          contactName: threadData.contact_name,
          contactWaId: threadData.contact_wa_id,
          displayPhoneNumber: threadData.display_phone_number,
          startTime: threadData.start_time,
          endTime: threadData.end_time,
          lastMessage: threadData.last_message,
          lastUpdated: threadData.last_updated,
          status: threadData.status          
        });
        
        return thread;
      }

      return null;
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

      const threadData = threadDoc.data();
      const thread = new Thread({
        id: threadDoc.id,
        waBusinessId: threadData.wa_business_id,
        contactName: threadData.contact_name,
        contactWaId: threadData.contact_wa_id,
        displayPhoneNumber: threadData.display_phone_number,
        startTime: threadData.start_time,
        endTime: threadData.end_time,
        lastMessage: threadData.last_message,
        lastUpdated: threadData.last_updated,
        status: threadData.status          
      });
      
      return thread;

    } catch (error) {
      console.error('Error get by id from Firestore:', error);
      throw error;
    }
  }
}