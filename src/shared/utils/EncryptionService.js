const crypto = require('crypto');
const config = require('./configs');

class EncryptionService {
  static ALGORITHM = 'aes-256-gcm';
  static IV_LENGTH = 16;
  
  /**
   * Encryp text using AES-256-GCM algorithm
   * @param {string} text - requested text
   * @returns {string} - encrypted text: iv:authTag:encryptedData
   */
  static encrypt(text) {
    const rawKey = config.encryption.key;
  
    if (!rawKey) {
      throw new Error('Encryption key not found');
    }
    
    // Derive a proper-length key using SHA-256
    // This consistently creates a 32-byte key from any input string
    const encryptionKey = crypto.createHash('sha256').update(rawKey).digest();
    
    if (!encryptionKey) {
      throw new Error('Encryption key not found');
    }
    
    const iv = crypto.randomBytes(this.IV_LENGTH);
    
    const cipher = crypto.createCipheriv(
      this.ALGORITHM, 
      Buffer.from(encryptionKey, 'hex'), 
      iv
    );
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }
  
  /**
   * Decrypt encrypted data
   * @param {string} encryptedData - Encrypted data (format: iv:authTag:encryptedData)
   * @returns {string} - Original text
   */
  static decrypt(encryptedData) {
    const rawKey = config.encryption.key;
  
    if (!rawKey) {
      throw new Error('Encryption key not found');
    }
    
    // Derive key consistently using SHA-256
    const encryptionKey = crypto.createHash('sha256').update(rawKey).digest();
    
    if (!encryptionKey) {
      throw new Error('Encryption key not found');
    }
    
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    
    const decipher = crypto.createDecipheriv(
      this.ALGORITHM, 
      Buffer.from(encryptionKey, 'hex'), 
      iv
    );
    
    decipher.setAuthTag(authTag);
    
    let decrypted;
    try {
      decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
    } catch (error) {
      throw new Error('Data decryption failed: invalid key or broken data');
    }
    
    return decrypted;
  }
  
  /**
   * Generate encryption key
   * @returns {string} - encryption key
   */
  static generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = EncryptionService;