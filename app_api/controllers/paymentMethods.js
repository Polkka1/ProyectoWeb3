//payment methods collection controllers

const mongoose = require('mongoose');
const paymentMethods = mongoose.model('paymentMethod');

//Create new payment method
const paymentMethodsCreate = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success paymentMethodsCreate",
    })
}

//Payment methods list
const paymentMethodsList = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success paymentMethodsList",
    })
}

//Read one payment method
const paymentMethodsReadOne = (req, res) => {
    paymentMethods
        .findById(req.params.paymentMethodId)
        .exec((err, paymentMethodObject) => {
            console.log("findById success");
        });
}

//Update payment method
const paymentMethodsUpdateOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success paymentMethodsUpdateOne",
    })
}

//Delete payment method
const paymentMethodsDeleteOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success paymentMethodsDeleteOne",
    })
}

module.exports = {
    paymentMethodsCreate,
    paymentMethodsList,
    paymentMethodsReadOne,
    paymentMethodsUpdateOne,
    paymentMethodsDeleteOne,
}