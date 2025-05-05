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
    return Thread.fromFirestore(doc);
  }

  async save(thread) {
    try {
      let threadDocRef;
  
      if (thread.id) {
        threadDocRef = this.threadCollection.doc(thread.id);
      } else {
        threadDocRef = this.threadCollection.doc();
        thread.id = threadDocRef.id;
      }

      // const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const timestamp = Date.now();
      const existingThread = await this.getByWhatsappInfo(thread.waBusinessId, thread.clientWaId);
  
      let threadRef;
      let savedThread;

      // Convert Thread entity to Firestore document data
      // ngikutin entity thread
      const threadData = {
        id: thread.id,
        wa_business_id: thread.waBusinessId,
        client_wa_id: thread.clientWaId,
        client_name: thread.clientName,
        client_phone_number_id: thread.clientPhoneNumberId,
        client_display_phone_number: thread.clientDisplayPhoneNumber,
        unread_count: thread.unreadCount,
        status: thread.status ?? THREAD_STATUS.QUEUE,
        last_message_media_type: thread.lastMessageMediaType,
        last_message: thread.lastMessage,
        first_response_datetime: thread.firstResponseDatetime,
        last_response_datetime: thread.lastResponseDatetime,
        current_handler_user_id: thread.currentHandlerUserId,
        internal_user_detail: thread.convertInternalUserDetailToJson(),
        created_at: thread.createdAt ?? timestamp,
        updated_at: timestamp
      }
      
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

  async getByWhatsappInfo(waBusinessId, clientWaId){
    if (!waBusinessId || !clientWaId) {
      console.warn('Missing waBusinessId or clientWaId:', { waBusinessId, clientWaId });
      return null;
    }
    
    try {
      const existingThreadQuery = await this.threadCollection
        .where('wa_business_id', '==', waBusinessId)
        .where('client_wa_id', '==', clientWaId)
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