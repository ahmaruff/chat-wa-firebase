const admin = require('../../shared/utils/firebase');
const ChatRepository = require('../domain/repositories/ChatRepository');
const config = require('../../shared/utils/configs');
const Chat = require('../domain/entities/Chat');
const MessageContent = require('../domain/valueObjects/MessageContent');

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
        
    return new Chat({
      id: doc.id,
      sender: data.sender,
      thread: data.thread,
      createdAt: data.created_at,
      messageContent: new MessageContent(data.message),
      unread: data.unread
    });
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
        .where('thread', '==', threadId)
        .orderBy('created_at', 'asc')
        .get();

      return querySnapshot.docs.map(doc => this._documentToEntity(doc));
    } catch (error) {
      console.error('Error getting chats by thread ID:', error);
      throw error;
    }
  }

  async save(chat) {
    try {
      if (!chat.thread) {
        throw new Error('Error: Thread cannot be null');
      }
  
      let chatDocRef;
  
      if (chat.id) {
        chatDocRef = this.chatCollection.doc(chat.id);
      } else {
        chatDocRef = this.chatCollection.doc();
        chat.id = chatDocRef.id;
      }
  
      const timestamp = Date.now();
      const existing = await this.getById(chat.id);
  
      // Persiapkan data yang akan disimpan
      const chatData = {
        id: chat.id,
        sender: chat.sender,
        thread: chat.thread,
        message: chat.messageContent.getValue(),
        unread: chat.unread ?? true,
        created_at: existing ? existing.created_at : timestamp,
        updated_at: timestamp,
      };
  
      await chatDocRef.set(chatData, { merge: true });
  
      const savedChatDoc = await chatDocRef.get();
      return this._documentToEntity(savedChatDoc);
    } catch (error) {
      console.error('Error saving chat to Firestore:', error);
      throw error;
    }
  }

  async markAsRead(chatId) {
    try {
      const chatRef = this.chatCollection.doc(chatId);
      await chatRef.update({ unread: false });
      return true;
    } catch (error) {
      console.error('Error marking chat as read:', error);
      throw error;
    }
  }

  async markThreadAsRead(threadId) {
    try {
      const batch = this.db.batch();
      const unreadChats = await this.chatCollection
        .where('thread', '==', threadId)
        .where('unread', '==', true)
        .get();
      
      unreadChats.forEach(doc => {
        batch.update(doc.ref, { unread: false });
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