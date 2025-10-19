const mongoose = require('mongoose');

const itemsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    itemId: { type: Number, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    category: { 
        type: String, 
        enum: ['Libros', 'Tecnología', 'Arte', 'Hogar', 'Otros'],
        required: true
    },
    condition: {
        type: String,
        enum: ['Nuevo', 'Como nuevo', 'Usado'],
        required: true
    },
    sellerId: { type: Number },
    sellerName: { type: String },
    whatsapp: { type: String },
    location: { type: String },
    images: [String], // Array de URLs de imágenes
    isAvailable: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    created: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now }
});

//compile schema to model
const Item = mongoose.model('item', itemsSchema);

const item = new Item({
    title: 'iPhone 13 Pro',
    description: 'iPhone 13 Pro en excelente estado, 256GB, incluye caja y cargador',
    itemId: 100001,
    price: 850,
    category: 'Tecnología',
    condition: 'Como nuevo',
    sellerId: 123456,
    sellerName: 'María González',
    whatsapp: '987654321',
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
