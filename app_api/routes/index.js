const express = require('express');
const router = express.Router();

const ctrlUsers = require('../controllers/users'); //import the users controller
const ctrlItems = require('../controllers/items'); //import the items controller
const ctrlCategories = require('../controllers/categories'); //import the categories controller
const ctrlReviews = require('../controllers/reviews'); //import the reviews controller
const ctrlOrders = require('../controllers/orders'); //import the orders controller
const ctrlMessages = require('../controllers/messages'); //import the messages controller
const ctrlWatchlist = require('../controllers/watchlist'); //import the watchlist controller
const ctrlPaymentMethods = require('../controllers/paymentMethods'); //import the payment methods controller
const ctrlNotifications = require('../controllers/notifications'); //import the notifications controller

// basic health-check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        node: process.version
    });
});

// users collection routes

router
    .route('/users')
    .post(ctrlUsers.usersCreate) //create user
    .get(ctrlUsers.usersList); //list users

router
    .route('/users/:userId')
    .get(ctrlUsers.usersReadOne) //read one user
    .put(ctrlUsers.usersUpdateOne) //update user
    .delete(ctrlUsers.usersDeleteOne); //delete user

// items collection routes

router
    .route('/items')
    .post(ctrlItems.itemsCreate) //create item
    .get(ctrlItems.itemsList); //list items

router
    .route('/items/:itemId')
    .get(ctrlItems.itemsReadOne) //read one item
    .put(ctrlItems.itemsUpdateOne) //update item
    .delete(ctrlItems.itemsDeleteOne); //delete item

// categories collection routes

router
    .route('/categories')
    .post(ctrlCategories.categoriesCreate) //create category
    .get(ctrlCategories.categoriesList); //list categories

router
    .route('/categories/:categoryId')
    .get(ctrlCategories.categoriesReadOne) //read one category
    .put(ctrlCategories.categoriesUpdateOne) //update category
    .delete(ctrlCategories.categoriesDeleteOne); //delete category

// reviews collection routes

router
    .route('/reviews')
    .post(ctrlReviews.reviewsCreate) //create review
    .get(ctrlReviews.reviewsList); //list reviews

router
    .route('/reviews/:reviewId')
    .get(ctrlReviews.reviewsReadOne) //read one review
    .put(ctrlReviews.reviewsUpdateOne) //update review
    .delete(ctrlReviews.reviewsDeleteOne); //delete review

// orders collection routes

router
    .route('/orders')
    .post(ctrlOrders.ordersCreate) //create order
    .get(ctrlOrders.ordersList); //list orders

router
    .route('/orders/:orderId')
    .get(ctrlOrders.ordersReadOne) //read one order
    .put(ctrlOrders.ordersUpdateOne) //update order
    .delete(ctrlOrders.ordersDeleteOne); //delete order

// messages collection routes

router
    .route('/messages')
    .post(ctrlMessages.messagesCreate) //create message
    .get(ctrlMessages.messagesList); //list messages

router
    .route('/messages/:messageId')
    .get(ctrlMessages.messagesReadOne) //read one message
    .put(ctrlMessages.messagesUpdateOne) //update message
    .delete(ctrlMessages.messagesDeleteOne); //delete message

// watchlist collection routes

router
    .route('/watchlist')
    .post(ctrlWatchlist.watchlistCreate) //add to watchlist
    .get(ctrlWatchlist.watchlistList); //list watchlist items

router
    .route('/watchlist/:watchlistId')
    .get(ctrlWatchlist.watchlistReadOne) //read one watchlist item
    .put(ctrlWatchlist.watchlistUpdateOne) //update watchlist item
    .delete(ctrlWatchlist.watchlistDeleteOne); //remove from watchlist

// payment methods collection routes

router
    .route('/payment-methods')
    .post(ctrlPaymentMethods.paymentMethodsCreate) //add payment method
    .get(ctrlPaymentMethods.paymentMethodsList); //list payment methods

router
    .route('/payment-methods/:paymentMethodId')
    .get(ctrlPaymentMethods.paymentMethodsReadOne) //read one payment method
    .put(ctrlPaymentMethods.paymentMethodsUpdateOne) //update payment method
    .delete(ctrlPaymentMethods.paymentMethodsDeleteOne); //delete payment method

// notifications collection routes

router
    .route('/notifications')
    .post(ctrlNotifications.notificationsCreate) //create notification
    .get(ctrlNotifications.notificationsList); //list notifications

router
    .route('/notifications/:notificationId')
    .get(ctrlNotifications.notificationsReadOne) //read one notification
    .put(ctrlNotifications.notificationsUpdateOne) //update notification (mark as read)
    .delete(ctrlNotifications.notificationsDeleteOne); //delete notification

// additional notification routes
router
    .route('/notifications/mark-all-read/:userId')
    .put(ctrlNotifications.notificationsMarkAllRead); //mark all notifications as read

router
    .route('/notifications/unread-count/:userId')
    .get(ctrlNotifications.notificationsUnreadCount); //get unread count

module.exports = router;
