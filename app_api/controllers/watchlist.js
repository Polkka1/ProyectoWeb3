//watchlist collection controllers

const mongoose = require('mongoose');
const watchlist = mongoose.model('watchlist');

//Create new watchlist item
const watchlistCreate = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success watchlistCreate",
    })
}

//Watchlist items list
const watchlistList = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success watchlistList",
    })
}

//Read one watchlist item
const watchlistReadOne = (req, res) => {
    watchlist
        .findById(req.params.watchlistId)
        .exec((err, watchlistObject) => {
            console.log("findById success");
        });
}

//Update watchlist item
const watchlistUpdateOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success watchlistUpdateOne",
    })
}

//Delete watchlist item
const watchlistDeleteOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success watchlistDeleteOne",
    })
}

module.exports = {
    watchlistCreate,
    watchlistList,
    watchlistReadOne,
    watchlistUpdateOne,
    watchlistDeleteOne,
}