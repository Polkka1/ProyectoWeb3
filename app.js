require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const logger = require('morgan');

//models
require('./app_api/models/db'); // incorporo el modelo al proyecto

//routes
const indexRouter = require('./app_server/routes/index');
const usersRouter = require('./app_server/routes/users');
const itemsRouter = require('./app_server/routes/items');
const authRouter = require('./app_server/routes/auth');
const dashboardRouter = require('./app_server/routes/dashboard');
const adminRouter = require('./app_server/routes/admin');
const debugRouter = require('./app_server/routes/debug');
const messagesRouter = require('./app_server/routes/messages');
const apiRouter = require('./app_api/routes/index'); //REST API

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// trust proxy for secure cookies on Vercel/Proxies
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
}

// sessions
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
if (!process.env.SESSION_SECRET) {
  console.warn('[auth] Using fallback SESSION_SECRET; set env var in production.');
}

const mongoose = require('mongoose');
const DB_NAME = 'campuswapdb';

app.use(session({
  name: 'campuswap.sid',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: app.get('env') === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  },
  store: MongoStore.create({
    client: mongoose.connection.getClient(),
    dbName: DB_NAME,
    collectionName: 'sessions',
    stringify: false,
    autoRemove: 'interval',
    autoRemoveInterval: 10 // minutes
  })
}));

// expose current user to views
app.use((req, res, next) => {
  res.locals.currentUser = req.session && req.session.user ? req.session.user : null;
  next();
});

//routes call
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/items', itemsRouter);
app.use('/auth', authRouter);
app.use('/me', dashboardRouter);
app.use('/admin', adminRouter);
app.use('/messages', messagesRouter);
app.use('/debug', debugRouter);
app.use('/api', apiRouter); // REST API

// catch 404 and forward to error handlers
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
