//users collection controllers

const mongoose = require('mongoose');
const users = mongoose.model('user');

// Create new user → delegate to auth.register for consistency
const { register: authRegister } = require('./auth');
const usersCreate = (req, res) => authRegister(req, res);

// User list - returns sanitized user data
const usersList = async (req, res) => {
    try {
        // Fetch all users, exclude password field
        const userDocs = await users.find({}, {
            password: 0
        }).lean();

        // Map to a minimal safe structure (avoid leaking sensitive info)
        const list = userDocs.map(u => ({
            id: u._id,
            userid: u.userid,
            name: u.name,
            email: u.email,
            userType: u.userType,
            rating: u.rating?.average || 0,
            totalReviews: u.rating?.totalReviews || 0,
            isVerified: u.isVerified || false,
            created: u.created
        }));

        return res.status(200).json({
            status: 'success',
            total: list.length,
            users: list
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar usuarios.',
            error: err.message
        });
    }
};

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

