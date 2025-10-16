//orders collection controllers

const mongoose = require('mongoose');
const orders = mongoose.model('order');

//Create new order
const ordersCreate = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success ordersCreate",
    })
}

//Orders list
const ordersList = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success ordersList",
    })
}

//Read one order
const ordersReadOne = (req, res) => {
    orders
        .findById(req.params.orderId)
        .exec((err, orderObject) => {
            console.log("findById success");
        });
}

//Update order
const ordersUpdateOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success ordersUpdateOne",
    })
}

//Delete order
const ordersDeleteOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success ordersDeleteOne",
    })
}

module.exports = {
    ordersCreate,
    ordersList,
    ordersReadOne,
    ordersUpdateOne,
    ordersDeleteOne,
}