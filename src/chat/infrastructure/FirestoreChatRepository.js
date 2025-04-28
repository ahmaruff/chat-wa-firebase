const admin = require('firebase-admin');
const ChatRepository = require('../domain/repositories/ChatRepository');
const ThreadRepository = require('../domain/repositories/ThreadRepository');
const dotenv = require('dotenv');

dotenv.config();

const FIREBASE_CHAT_COLLECTION = process.env('FIREBASE_CHAT_COLLECTION') || 'wa_chat_test';

class FirestoreChatRepository extends ChatRepository {
  constructor() {
    super();
    this.db = admin.firestore();
    this.chatCollection = this.db.collection(FIREBASE_CHAT_COLLECTION);
    this.threadRepository = new ThreadRepository();  // Initialize ThreadRepository
  }

  async save(chat) {
    try {
      let threadId = chat.thread;
  
      if (threadId === null) {
        throw new Error('Error: Thread cannot be null');
      }
  
      let chatDocRef;
  
      // If chat already has an ID, we use that, otherwise, Firestore generates one
      if (chat.id) {
        chatDocRef = this.chatCollection.doc(chat.id);
        chatDocRef = this.chatCollection.doc();
        chat.id = chatDocRef.id;
      }
  
      const chatData = chat.toPrimitive();
      chatData.thread = threadId;
  
      await chatDocRef.set(chatData);
      
      return chatDocRef.id;
    } catch (error) {
      console.error('Error saving chat to Firestore:', error);
      throw error;
    }
  }  
}

module.exports = FirestoreChatRepository;