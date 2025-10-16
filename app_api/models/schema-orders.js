const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema({
    orderId: { type: Number, required: true, unique: true },
    buyerId: { type: Number, required: true },
    buyerName: { type: String, required: true },
    sellerId: { type: Number, required: true },
    sellerName: { type: String, required: true },
    itemId: { type: Number, required: true },
    itemTitle: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    notes: { type: String },
    created: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
});

//compile schema to model
const Order = mongoose.model('order', ordersSchema);

const order = new Order({
    orderId: 2001,
    buyerId: 654321,
    buyerName: 'John Doe',
    sellerId: 123456,
    sellerName: 'María González',
    itemId: 100001,
    itemTitle: 'iPhone 13 Pro',
    quantity: 1,
    unitPrice: 850,
    totalPrice: 850,
    shippingAddress: {
        street: '456 Oak Avenue',
        city: 'Springfield',
        zipCode: '54321',
        country: 'USA'
    },
    status: 'Confirmed',
    paymentStatus: 'Completed'
});

//manual saving an order with error handling
/*order.save()
  .then(() => {
    console.log('Order saved successfully:', order.orderId);
  })
  .catch(err => {
    if (err.code === 11000) {
      console.log('Order already exists with orderId:', order.orderId);
    } else {
      console.error('Error saving order:', err.message);
    }
  });*/