const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    watchlistId: { type: Number, required: true, unique: true },
    userId: { type: Number, required: true },
    itemId: { type: Number, required: true },
    itemTitle: { type: String, required: true },
    itemPrice: { type: Number, required: true },
    sellerId: { type: Number, required: true },
    sellerName: { type: String, required: true },
    priceAlert: { type: Boolean, default: false },
    alertPrice: { type: Number }, // Alert when price drops below this
    notes: { type: String },
    created: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate entries
watchlistSchema.index({ userId: 1, itemId: 1 }, { unique: true });

//compile schema to model
const Watchlist = mongoose.model('watchlist', watchlistSchema);

const watchlistItem = new Watchlist({
    watchlistId: 4001,
    userId: 654321,
    itemId: 100001,
    itemTitle: 'iPhone 13 Pro',
    itemPrice: 850,
    sellerId: 123456,
    sellerName: 'María González',
    priceAlert: true,
    alertPrice: 800,
    notes: 'Want to buy if price drops'
});

//manual saving a watchlist item with error handling
/*watchlistItem.save()
  .then(() => {
    console.log('Watchlist item saved successfully:', watchlistItem.itemTitle);
  })
  .catch(err => {
    if (err.code === 11000) {
      console.log('Item already in watchlist for this user');
    } else {
      console.error('Error saving watchlist item:', err.message);
    }
  });*/