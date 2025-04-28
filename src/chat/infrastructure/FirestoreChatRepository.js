const admin = require('firebase-admin');
const ChatRepository = require('../domain/repositories/ChatRepository');
const ThreadRepository = require('../domain/repositories/ThreadRepository'); // Assuming you already have this imported
const dotenv = require('dotenv');

dotenv.config();

const FIREBASE_CHAT_COLLECTION = process.env('FIREBASE_CHAT_COLLECTION') || 'wa_chat_test';

class FirestoreChatRepository extends ChatRepository {
  constructor(threadRepository) {
    super();
    this.db = admin.firestore();
    this.chatCollection = this.db.collection(FIREBASE_CHAT_COLLECTION);
    this.threadRepository = threadRepository;
  }

  async save(chat) {
    try {
      const threadExists = await this.threadRepository.getById(chat.thread);
      
      if (!threadExists) {
        throw new Error(`Thread with ID ${chat.thread} does not exist`);
      }
      
      const chatDocRef = this.chatCollection.doc();
      await chatDocRef.set(chat.toPrimitive());
      
      console.log('Chat saved successfully:', chat.id);
    } catch (error) {
      console.error('Error saving chat to Firestore:', error);
      throw error;
    }
  }
}

module.exports = FirestoreChatRepository;