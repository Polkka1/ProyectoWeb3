const mongoose = require('mongoose');

const itemsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    itemId: { type: Number, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    category: { 
        type: String, 
        enum: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Automotive', 'Other'],
        required: true
    },
    condition: {
        type: String,
        enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
        required: true
    },
    sellerId: { type: Number, required: true },
    sellerName: { type: String, required: true },
    location: { type: String },
    images: [String], // Array of image URLs
    isAvailable: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    created: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now }
});

//compile schema to model
const Item = mongoose.model('item', itemsSchema);

const item = new Item({
    title: 'iPhone 13 Pro',
    description: 'Excellent condition iPhone 13 Pro, 256GB storage, includes original box and charger',
    itemId: 100001,
    price: 850,
    category: 'Electronics',
    condition: 'Like New',
    sellerId: 123456,
    sellerName: 'María González',
    location: 'Las Flores',
    images: ['https://example.com/iphone1.jpg', 'https://example.com/iphone2.jpg'],
    isAvailable: true
});

//manual saving an item with error handling
/*item.save()
  .then(() => {
    console.log('Item saved successfully:', item.title);
  })
  .catch(err => {
    if (err.code === 11000) {
      console.log('Item already exists with itemId:', item.itemId);
    } else {
      console.error('Error saving item:', err.message);
    }
  });*/