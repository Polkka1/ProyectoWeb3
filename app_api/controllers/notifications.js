//notifications collection controllers

const mongoose = require('mongoose');
const notifications = mongoose.model('notification');

//Create new notification
const notificationsCreate = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success notificationsCreate",
    })
}

//Notifications list
const notificationsList = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success notificationsList",
    })
}

//Read one notification
const notificationsReadOne = (req, res) => {
    notifications
        .findById(req.params.notificationId)
        .exec((err, notificationObject) => {
            console.log("findById success");
        });
}

//Update notification (mark as read, etc.)
const notificationsUpdateOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success notificationsUpdateOne",
    })
}

//Delete notification
const notificationsDeleteOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success notificationsDeleteOne",
    })
}

//Mark all notifications as read for a user
const notificationsMarkAllRead = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success notificationsMarkAllRead",
    })
}

//Get unread count for a user
const notificationsUnreadCount = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success notificationsUnreadCount",
        "count": 0
    })
}

module.exports = {
    notificationsCreate,
    notificationsList,
    notificationsReadOne,
    notificationsUpdateOne,
    notificationsDeleteOne,
    notificationsMarkAllRead,
    notificationsUnreadCount,
}