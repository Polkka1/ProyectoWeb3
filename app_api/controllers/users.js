//users collection controllers

const mongoose = require('mongoose');
const users = mongoose.model('user');

// Create new user → delegate to auth.register for consistency
const { register: authRegister } = require('./auth');
const usersCreate = (req, res) => authRegister(req, res);

//User list
const usersList = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success usersList",
    })
}

//Read one user
const usersReadOne = (req, res) => {
    users
        .findById(req.params.userId)
        .exec((err, userObject) => {
            console.log("findById success");
        });
}

//update user
const usersUpdateOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success usersUpdateOne",
    })
}

//delete user
const usersDeleteOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success usersDeleteOne",
    })
}

module.exports = {
    usersCreate,
    usersList,
    usersReadOne,
    usersUpdateOne,
    usersDeleteOne,
}

