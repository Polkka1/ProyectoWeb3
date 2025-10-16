//categories collection controllers

const mongoose = require('mongoose');
const categories = mongoose.model('category');

//Create new category
const categoriesCreate = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success categoriesCreate",
    })
}

//Categories list
const categoriesList = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success categoriesList",
    })
}

//Read one category
const categoriesReadOne = (req, res) => {
    categories
        .findById(req.params.categoryId)
        .exec((err, categoryObject) => {
            console.log("findById success");
        });
}

//Update category
const categoriesUpdateOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success categoriesUpdateOne",
    })
}

//Delete category
const categoriesDeleteOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success categoriesDeleteOne",
    })
}

module.exports = {
    categoriesCreate,
    categoriesList,
    categoriesReadOne,
    categoriesUpdateOne,
    categoriesDeleteOne,
}