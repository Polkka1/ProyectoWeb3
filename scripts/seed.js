/*
  Simple seeder to ensure the campuswapdb exists and has at least one collection/document.
  Usage:
    - Local:   node scripts/seed.js
    - Atlas:   MONGODB_URI="<your_atlas_srv>" node scripts/seed.js
*/

const mongoose = require('mongoose');

const DB_NAME = 'campuswapdb';
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

async function main() {
  try {
    console.log('Connecting to MongoDB...', { uri: maskUri(uri), dbName: DB_NAME });
    await mongoose.connect(uri, { dbName: DB_NAME });
    console.log('Connected. Creating initial document...');

    const col = mongoose.connection.db.collection('init');
    const res = await col.insertOne({ seeded: true, source: 'scripts/seed.js', at: new Date() });
    console.log('Inserted document with _id:', res.insertedId);

    await mongoose.connection.close();
    console.log('Done. You should now see the database in Compass:', DB_NAME);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

function maskUri(u) {
  try {
    const url = new URL(u);
    if (url.password) {
      url.password = '***';
    }
    return url.toString();
  } catch (_) {
    return u.includes('@') ? u.replace(/:\S+@/, ':***@') : u;
  }
}

main();
