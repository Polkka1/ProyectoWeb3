const mongoose = require('mongoose');

const messagesSchema = new mongoose.Schema({
    messageId: { type: Number, required: true, unique: true },
    conversationId: { type: String, required: true }, // Unique ID for conversation thread
    senderId: { type: Number, required: true },
    senderName: { type: String, required: true },
    receiverId: { type: Number, required: true },
    receiverName: { type: String, required: true },
    itemId: { type: Number }, // Optional: if message is about specific item
    itemTitle: { type: String },
    subject: { type: String, required: true },
    messageText: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    attachments: [String], // Array of file URLs
    messageType: {
        type: String,
        enum: ['inquiry', 'negotiation', 'order_related', 'general'],
        default: 'general'
    },
    created: { type: Date, default: Date.now }
});

//compile schema to model
const Message = mongoose.model('message', messagesSchema);

const message = new Message({
    messageId: 3001,
    conversationId: '123456-654321',
    senderId: 654321,
    senderName: 'John Doe',
    receiverId: 123456,
    receiverName: 'María González',
    itemId: 100001,
    itemTitle: 'iPhone 13 Pro',
    subject: 'Question about iPhone condition',
    messageText: 'Hi! Is the iPhone still available? Can you provide more photos of the screen?',
    messageType: 'inquiry'
});

//manual saving a message with error handling
/*message.save()
  .then(() => {
    console.log('Message saved successfully:', message.messageId);
  })
  .catch(err => {
    if (err.code === 11000) {
      console.log('Message already exists with messageId:', message.messageId);
    } else {
      console.error('Error saving message:', err.message);
    }
  });*/