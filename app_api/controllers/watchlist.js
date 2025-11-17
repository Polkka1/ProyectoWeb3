//watchlist collection controllers

const mongoose = require('mongoose');
const watchlist = mongoose.model('watchlist');

//Create new watchlist item (link to session user)
const watchlistCreate = async (req, res) => {
    try {
        const sessionUser = req.session && req.session.user;
        if (!sessionUser || typeof sessionUser.userid !== 'number') {
            return res.status(401).json({ status: 'error', message: 'Debes iniciar sesión para guardar en favoritos.' });
        }
        const { itemId, itemTitle, itemPrice, sellerId, sellerName, priceAlert, alertPrice, notes } = req.body;
        const errors = [];
        if (!itemId) errors.push('itemId requerido');
        if (!itemTitle) errors.push('itemTitle requerido');
        if (itemPrice === undefined) errors.push('itemPrice requerido');
        if (!sellerId) errors.push('sellerId requerido');
        if (!sellerName) errors.push('sellerName requerido');
        if (errors.length) return res.status(400).json({ status: 'error', message: errors.join('. ') });

        // Generate incremental watchlistId
        const Watchlist = mongoose.model('watchlist');
        const maxW = await Watchlist.findOne({}, {}, { sort: { watchlistId: -1 } });
        const nextId = maxW ? maxW.watchlistId + 1 : 4001;

        const wl = new Watchlist({
            watchlistId: nextId,
            userId: sessionUser.userid,
            itemId,
            itemTitle,
            itemPrice,
            sellerId,
            sellerName,
            priceAlert: !!priceAlert,
            alertPrice,
            notes
        });
        await wl.save();
        return res.status(201).json({ status: 'success', watchlist: wl });
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(409).json({ status: 'error', message: 'Este item ya está en tu lista.' });
        }
        return res.status(500).json({ status: 'error', message: 'Error al agregar a favoritos.', error: err.message });
    }
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