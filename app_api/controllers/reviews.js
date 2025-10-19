//reviews collection controllers

const mongoose = require('mongoose');
const reviews = mongoose.model('review');

//Create new review
const reviewsCreate = async (req, res) => {
    try {
        const { itemId, reviewerId, reviewerName, sellerId, rating, title, comment, purchaseVerified } = req.body;
        const errors = [];
        if (!itemId) errors.push('itemId requerido');
        if (!reviewerId) errors.push('reviewerId requerido');
        if (!reviewerName || reviewerName.trim().length < 2) errors.push('Nombre del revisor requerido');
        if (!sellerId) errors.push('sellerId requerido');
        if (!rating || rating < 1 || rating > 5) errors.push('Rating debe estar entre 1 y 5');
        if (!title || title.trim().length < 2) errors.push('Título requerido');
        if (!comment || comment.trim().length < 5) errors.push('Comentario requerido');
        if (errors.length) {
            return res.status(400).json({ status: 'error', message: errors.join('. ') });
        }

        // Generate incremental reviewId
        const Review = require('../models/schema-reviews');
        const maxReview = await Review.findOne({}, {}, { sort: { reviewId: -1 } });
        const nextReviewId = maxReview ? maxReview.reviewId + 1 : 1001;

        const newReview = new Review({
            reviewId: nextReviewId,
            itemId,
            reviewerId,
            reviewerName: reviewerName.trim(),
            sellerId,
            rating,
            title: title.trim(),
            comment: comment.trim(),
            purchaseVerified: !!purchaseVerified
        });
        await newReview.save();
        return res.status(201).json({
            status: 'success',
            message: 'Reseña creada exitosamente.',
            review: {
                id: newReview._id,
                reviewId: newReview.reviewId,
                itemId: newReview.itemId,
                reviewerId: newReview.reviewerId,
                reviewerName: newReview.reviewerName,
                sellerId: newReview.sellerId,
                rating: newReview.rating,
                title: newReview.title,
                comment: newReview.comment,
                purchaseVerified: newReview.purchaseVerified
            }
        });
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(409).json({ status: 'error', message: 'Ya existe una reseña con ese ID.' });
        }
        return res.status(500).json({ status: 'error', message: 'Error al crear reseña.', error: err.message });
    }
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