const admin = require('firebase-admin');
const ChatRepository = require('../domain/repositories/ChatRepository');
const dotenv = require('dotenv');

dotenv.config();

const FIREBASE_CHAT_COLLECTION = process.env.FIREBASE_CHAT_COLLECTION || 'wa_chat_test';

class FirestoreChatRepository extends ChatRepository {
  constructor() {
    super();
    this.db = admin.firestore();
    this.chatCollection = this.db.collection(FIREBASE_CHAT_COLLECTION);
  }

  async save(chat) {
    try {
      let threadId = chat.thread;
  
      if (threadId === null) {
        throw new Error('Error: Thread cannot be null');
      }
  
      let chatDocRef;
  
      // If chat already has an ID, use that reference, otherwise Firestore will generate one
      if (chat.id) {
        chatDocRef = this.chatCollection.doc(chat.id);
      } else {
        chatDocRef = this.chatCollection.doc();
        chat.id = chatDocRef.id;
      }
  
      const chatData = chat.toPrimitive();
      chatData.thread = threadId;
  
      if(chatData.created_at == null) {
        chatData.created_at = admin.firestore.FieldValue.serverTimestamp();
      }
  
      await chatDocRef.set(chatData);
  
      return chatDocRef.id;
    } catch (error) {
      console.error('Error saving chat to Firestore:', error);
      throw error;
    }
  }  
}

module.exports = FirestoreChatRepository;