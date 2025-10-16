//items collection controllers

const mongoose = require('mongoose');
const items = mongoose.model('item');

//Create new item
const itemsCreate = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success itemsCreate",
    })
}

//Items list
const itemsList = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success itemsList",
    })
}

//Read one item
const itemsReadOne = (req, res) => {
    items
        .findById(req.params.itemId)
        .exec((err, itemObject) => {
            console.log("findById success");
        });
}

//Update item
const itemsUpdateOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success itemsUpdateOne",
    })
}

//Delete item
const itemsDeleteOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success itemsDeleteOne",
    })
}

module.exports = {
    itemsCreate,
    itemsList,
    itemsReadOne,
    itemsUpdateOne,
    itemsDeleteOne,
}