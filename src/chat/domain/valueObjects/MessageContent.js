class MessageContent {
  constructor(text) {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      throw new Error('Message content must be a non-empty string');
    }
    this.text = text.trim();
  }

  getValue() {
    return this.text;
  }
}

module.exports = MessageContent;
  