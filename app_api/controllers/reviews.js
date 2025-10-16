//reviews collection controllers

const mongoose = require('mongoose');
const reviews = mongoose.model('review');

//Create new review
const reviewsCreate = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success reviewsCreate",
    })
}

//Reviews list
const reviewsList = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success reviewsList",
    })
}

//Read one review
const reviewsReadOne = (req, res) => {
    reviews
        .findById(req.params.reviewId)
        .exec((err, reviewObject) => {
            console.log("findById success");
        });
}

//Update review
const reviewsUpdateOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success reviewsUpdateOne",
    })
}

//Delete review
const reviewsDeleteOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success reviewsDeleteOne",
    })
}

module.exports = {
    reviewsCreate,
    reviewsList,
    reviewsReadOne,
    reviewsUpdateOne,
    reviewsDeleteOne,
}