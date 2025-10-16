const mongoose = require('mongoose');

const paymentMethodsSchema = new mongoose.Schema({
    paymentMethodId: { type: Number, required: true, unique: true },
    userId: { type: Number, required: true },
    type: {
        type: String,
        enum: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Digital Wallet', 'Cryptocurrency'],
        required: true
    },
    provider: { type: String, required: true }, // Visa, MasterCard, PayPal, etc.
    lastFourDigits: { type: String }, // For cards
    expiryMonth: { type: Number, min: 1, max: 12 }, // For cards
    expiryYear: { type: Number }, // For cards
    holderName: { type: String, required: true },
    billingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    isDefault: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    securityToken: { type: String }, // Encrypted token for actual payment processing
    created: { type: Date, default: Date.now },
    lastUsed: { type: Date }
});

//compile schema to model
const PaymentMethod = mongoose.model('paymentMethod', paymentMethodsSchema);

const paymentMethod = new PaymentMethod({
    paymentMethodId: 5001,
    userId: 123456,
    type: 'Credit Card',
    provider: 'Visa',
    lastFourDigits: '1234',
    expiryMonth: 12,
    expiryYear: 2027,
    holderName: 'María González',
    billingAddress: {
        street: '123 Main Street',
        city: 'Las Flores',
        zipCode: '12345',
        country: 'USA'
    },
    isDefault: true,
    isVerified: true
});

//manual saving a payment method with error handling
/*paymentMethod.save()
  .then(() => {
    console.log('Payment method saved successfully:', paymentMethod.type);
  })
  .catch(err => {
    if (err.code === 11000) {
      console.log('Payment method already exists with ID:', paymentMethod.paymentMethodId);
    } else {
      console.error('Error saving payment method:', err.message);
    }
  });*/