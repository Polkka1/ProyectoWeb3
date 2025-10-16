// model
const mongoose = require('mongoose'); // import mongoose

// listen for SIGINT event (Signal Interrupt) 
const readLine = require('readline');
if (process.platform === 'win32') {
    console.log('process.platform:', process.platform);
    const rl = readLine.Interface({
        input: process.stdin,
        output: process.stdout
    });
    // console.log(rl);
    rl.on('SIGINT', () => {
        console.log('SIGINT received: Terminating process');
        process.emit("SIGINT"); // emit the event
    });
}

// define database connection string
let dbURI = 'mongodb://localhost:27017/aplicacion_express_1';
if (process.env.NODE_ENV === 'production') {
    dbURI = process.env.MONGODB_URI;
}

// connect to database
mongoose.connect(dbURI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', err => {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Graceful shutdown - updated for Mongoose v8+
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
});

// Require schemas after connection setup
require('./schema-users');
require('./schema-items');
require('./schema-categories');
require('./schema-reviews');
require('./schema-orders');
require('./schema-messages');
require('./schema-watchlist');
require('./schema-paymentMethods');
require('./schema-notifications');