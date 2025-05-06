const admin = require('../../shared/utils/firebase');
const ChatRepository = require('../domain/repositories/ChatRepository');
const config = require('../../shared/utils/configs');
const Chat = require('../domain/entities/Chat');

const FIREBASE_CHAT_COLLECTION = config.firebase.chat_collection || 'wa_chat_test';

class FirestoreChatRepository extends ChatRepository {
  constructor() {
    super();
    this.db = admin.firestore();
    this.chatCollection = this.db.collection(FIREBASE_CHAT_COLLECTION);
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
        
    return Chat.fromFirestore(doc);
  }

  async getById(id) {
    try {
      const doc = await this.chatCollection.doc(id).get();
      return this._documentToEntity(doc);
    } catch (error) {
      console.error('Error getting chat by ID:', error);
      throw error;
    }
  }

  async getByThreadId(threadId) {
    try {
      const querySnapshot = await this.chatCollection
        .where('thread_id', '==', threadId)
        .orderBy('created_at', 'asc')
        .get();

      return querySnapshot.docs.map(doc => this._documentToEntity(doc));
    } catch (error) {
      console.error('Error getting chats by thread ID:', error);
      throw error;
    }
  }

  async save(chat) {
    if (!(chat instanceof Chat)) {
      throw new Error('Invalid Chat object');
    }

    if (!chat.threadId) {
      throw new Error('Error: Thread ID cannot be null');
    }

    try {
      const timestamp = Date.now();

      const dataChat = chat.toJson();
      let chatDocRef;

      if(chat.id) {
        // Update existing document
        dataChat.updated_at = timestamp;
        chatDocRef = this.chatCollection.doc(chat.id);

        await chatDocRef.update(dataChat);        
        console.log(`Updated chat with ID: ${chat.id}`);
        const updatedDoc = await docRef.get();
        return this._documentToEntity(updatedDoc);
      } else {
        // create new doc
        chatDocRef = this.chatCollection.doc();
        dataChat.id = chatDocRef.id;
        dataChat.created_at = timestamp;
        dataChat.updated_at = timestamp;

        await chatDocRef.set(dataChat);
        console.log(`Created new entity with ID: ${dataChat.id}`);

        const snapshot = await docRef.get();
        return this._documentToEntity(snapshot);
      }
    } catch (error) {
      console.error('Error saving chat to Firestore:', error);
      throw error;
    }
  }

  async markAsRead(chatId) {
    try {
      const timestamp = Date.now();

      const chatRef = this.chatCollection.doc(chatId);
      await chatRef.update({ unread: false, updated_at: timestamp });
      return true;
    } catch (error) {
      console.error('Error marking chat as read:', error);
      throw error;
    }
  }

  async markAsReadByWamid(wamid) {
    try {
      const timestamp = Date.now();

      const querySnapshot = await this.chatCollection
        .where('wamid', '==', wamid)
        .orderBy('created_at', 'desc')
        .limit(1)
        .get();
  
      if (querySnapshot.empty) {
        console.warn(`No chat found with wamid: ${wamid}`);
        return false;
      }
  
      const chatDoc = querySnapshot.docs[0];
      await chatDoc.ref.update({ unread: false, updated_at: timestamp });
      return true;
    } catch (error) {
      console.error('Error marking chat as read:', error);
      throw error;
    }
  }  

  async markThreadAsRead(threadId) {
    try {
      const timestamp = Date.now();

      const batch = this.db.batch();
      const unreadChats = await this.chatCollection
        .where('thread', '==', threadId)
        .where('unread', '==', true)
        .get();
      
      unreadChats.forEach(doc => {
        batch.update(doc.ref, { unread: false, updated_at: timestamp });
      });
      
      await batch.commit();
      return unreadChats.size;
    } catch (error) {
      console.error('Error marking thread chats as read:', error);
      throw error;
    }
  }
}

module.exports = FirestoreChatRepository;