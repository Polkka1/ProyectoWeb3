const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    name: { type: String, required: true },
  lastname: { type: String },
    userid: { type: Number, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    zipCode: { type: String },
    phone: { type: Number, 'default': 999999999 },
    age: { type: Number, min: 18, max: 100, 'default': 18 },
    profilePicture: { type: String }, // URL to profile image
    userType: {
        type: String,
        enum: ['Buyer', 'Seller', 'Both'],
        default: 'Both'
    },
    rating: {
        average: { type: Number, min: 0, max: 5, default: 0 },
        totalReviews: { type: Number, default: 0 }
    },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    created: { type: Date, default: Date.now }
});

//compile schema to model
const User = mongoose.model('user', usersSchema);

const user = new User({
    name: 'María',
    lastname: 'González',
    userid: 123456,
    email: 'maria.gonzalez@email.com',
    password: 'hashedPassword123', // In real app, this should be hashed
    address: '123 Main Street, Las Flores',
    city: 'Las Flores',
    zipCode: '12345',
    phone: 999999999,
    age: 28,
    profilePicture: 'https://example.com/profiles/maria.jpg',
    userType: 'Both',
    rating: {
        average: 4.5,
        totalReviews: 25
    },
    isVerified: true
});

//manual saving a user with error handling
/*user.save()
  .then(() => {
    console.log('User saved successfully:', user.name);
  })
  .catch(err => {
    if (err.code === 11000) {
      console.log('User already exists with userid:', user.userid);
    } else {
      console.error('Error saving user:', err.message);
    }
  });*/

//export model instead of schema
module.exports = User;