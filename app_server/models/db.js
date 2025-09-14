//model
const mongoose = require('mongoose');

//handle SIGINT signal is for Windows OS
//handle SIGTERM signal is for Linux OS
//handle SIGUSR2 signal is for Nodemon restart

const readLine = require('readline');
if (process.platform === 'win32') {
    console.log('process.platform:', process.platform);
    const rl = readLine.Interface({
        input: process.stdin,
        output: process.stdout
    });
    // console.log(rl);
    rl.on('SIGINT', () => {
        console.log('Se recibió SIGINT: Se termina el proceso');
        process.emit("SIGINT"); // emitir el evento
    });
}

//defined database connection
let dbURI = 'mongodb://localhost/expressapp1';

mongoose.connect(dbURI, { //conection parameters
    family: 4, //use IPv4, avoid IPv6
    serverSelectionTimeoutMS: 5000, //timeout after 5s instead of 30s
}).catch(err => console.log('error found',err.reason)); //catch initial connection error

//process shutdown function
const procShutdown = (msg) => {
    console.log(`Mongoose disconnected through: ${msg}`);
    mongoose.connection.close().then(() => {
        console.log('Mongoose connection closed.');
    }).catch(err => {
        console.error('Error closing mongoose connection:', err);
    });
}

//connect event messages

//moongose connected
mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${dbURI}`);
});
//mongoose error
mongoose.connection.on('error', err => {
    console.log('Mongoose connection error:', err);
});
//mongoose disconnected
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

//capture signals

//SIGNINT
process.on('SIGINT', () => {
    console.log('Received SIGINT, closing connections...');
    Promise.all([
        mongoose.connection.close(),
        logDB.close()
    ]).then(() => {
        console.log('All database connections closed.');
        process.exit(0);
    }).catch(err => {
        console.error('Error closing connections:', err);
        process.exit(1);
    });
});

//SIGTERM
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, closing connections...');
    Promise.all([
        mongoose.connection.close(),
        logDB.close()
    ]).then(() => {
        console.log('All database connections closed.');
        process.exit(0);
    }).catch(err => {
        console.error('Error closing connections:', err);
        process.exit(1);
    });
});

//SIGUSR2 - Handle nodemon restarts
process.once('SIGUSR2', () => {
    console.log('Received SIGUSR2 (nodemon restart), closing connections...');
    Promise.all([
        mongoose.connection.close(),
        logDB.close()
    ]).then(() => {
        console.log('All database connections closed for restart.');
        process.kill(process.pid, 'SIGUSR2');
    }).catch(err => {
        console.error('Error closing connections on restart:', err);
        process.kill(process.pid, 'SIGUSR2');
    });
});

//connect to multiple databases
const dbURIlog = 'mongodb://localhost/applogs1';
const logDB = mongoose.createConnection(dbURIlog, {
    family: 4,
    serverSelectionTimeoutMS: 5000,
});

//logDB event messages
logDB.on('connected', () => {
    console.log(`logDB connected to ${dbURIlog}`);
});

logDB.on('error', err => {
    console.log('logDB connection error:', err);
});

logDB.on('disconnected', () => {
    console.log('logDB disconnected');
});