//messages collection controllers

const mongoose = require('mongoose');
const messages = mongoose.model('message');

//Create new message
const messagesCreate = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success messagesCreate",
    })
}

//Messages list
const messagesList = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success messagesList",
    })
}

//Read one message
const messagesReadOne = (req, res) => {
    messages
        .findById(req.params.messageId)
        .exec((err, messageObject) => {
            console.log("findById success");
        });
}

//Update message
const messagesUpdateOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success messagesUpdateOne",
    })
}

//Delete message
const messagesDeleteOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success messagesDeleteOne",
    })
}

module.exports = {
    messagesCreate,
    messagesList,
    messagesReadOne,
    messagesUpdateOne,
    messagesDeleteOne,
}