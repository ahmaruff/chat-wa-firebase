const admin = require('firebase-admin');
const ChatRepository = require('../domain/repositories/ChatRepository');
const dotenv = require('dotenv');

dotenv.config();

const FIREBASE_CHAT_COLLECTION = process.env('FIREBASE_CHAT_COLLECTION') || 'wa_chat_test';

class FirestoreChatRepository extends ChatRepository {
  constructor() {
    super();
    this.db = admin.firestore();
    this.chatCollection = this.db.collection(FIREBASE_CHAT_COLLECTION);
  }

  async save(chat){
    try {
      const chatDocRef = this.chatCollection.doc();
    }catch(error) {
      console.error('Error savingchat from Firestore:', error);
      throw error;
    }
  }
}

module.exports = FirestoreChatRepository;