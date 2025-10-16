const mongoose = require('mongoose');

const notificationsSchema = new mongoose.Schema({
    notificationId: { type: Number, required: true, unique: true },
    userId: { type: Number, required: true },
    type: {
        type: String,
        enum: [
            'order_placed', 'order_shipped', 'order_delivered', 'order_cancelled',
            'payment_received', 'payment_failed', 'item_sold', 'item_viewed',
            'price_alert', 'new_message', 'new_review', 'system_update',
            'account_verification', 'security_alert', 'promotional'
        ],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedEntity: {
        entityType: {
            type: String,
            enum: ['order', 'item', 'user', 'message', 'review', 'payment', 'system']
        },
        entityId: { type: Number }
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    isRead: { type: Boolean, default: false },
    isActionRequired: { type: Boolean, default: false },
    actionUrl: { type: String }, // Deep link to relevant page
    expiresAt: { type: Date }, // For time-sensitive notifications
    metadata: {
        senderName: { type: String },
        itemTitle: { type: String },
        orderNumber: { type: String },
        amount: { type: Number }
    },
    deliveryChannels: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: false }
    },
    created: { type: Date, default: Date.now },
    readAt: { type: Date }
});

//compile schema to model
const Notification = mongoose.model('notification', notificationsSchema);

const notification = new Notification({
    notificationId: 6001,
    userId: 123456,
    type: 'order_placed',
    title: 'New Order Received!',
    message: 'John Doe has placed an order for your iPhone 13 Pro',
    relatedEntity: {
        entityType: 'order',
        entityId: 2001
    },
    priority: 'High',
    isActionRequired: true,
    actionUrl: '/orders/2001',
    metadata: {
        senderName: 'John Doe',
        itemTitle: 'iPhone 13 Pro',
        orderNumber: 'ORD-2001',
        amount: 850
    },
    deliveryChannels: {
        inApp: true,
        email: true,
        push: true
    }
});

//manual saving a notification with error handling
/*notification.save()
  .then(() => {
    console.log('Notification saved successfully:', notification.title);
  })
  .catch(err => {
    if (err.code === 11000) {
      console.log('Notification already exists with ID:', notification.notificationId);
    } else {
      console.error('Error saving notification:', err.message);
    }
  });*/