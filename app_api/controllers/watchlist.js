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
const watchlistList = async (req, res) => {
    try {
        const watchlistItems = await watchlist.find({}).lean();
        return res.status(200).json(watchlistItems);
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Error al listar favoritos.', error: err.message });
    }
}

//Read one watchlist item
const watchlistReadOne = async (req, res) => {
    try {
        const watchlistItem = await watchlist.findById(req.params.watchlistId);
        if (!watchlistItem) {
            return res.status(404).json({ status: 'error', message: 'Item de favoritos no encontrado.' });
        }
        return res.status(200).json(watchlistItem);
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Error al leer favorito.', error: err.message });
    }
}

//Update watchlist item
const watchlistUpdateOne = async (req, res) => {
    try {
        const { priceAlert, alertPrice, notes } = req.body;
        const watchlistItem = await watchlist.findById(req.params.watchlistId);
        
        if (!watchlistItem) {
            return res.status(404).json({ status: 'error', message: 'Item de favoritos no encontrado.' });
        }
        
        // Update allowed fields
        if (priceAlert !== undefined) watchlistItem.priceAlert = !!priceAlert;
        if (alertPrice !== undefined) watchlistItem.alertPrice = alertPrice;
        if (notes !== undefined) watchlistItem.notes = notes;
        
        await watchlistItem.save();
        return res.status(200).json({ status: 'success', watchlist: watchlistItem });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Error al actualizar favorito.', error: err.message });
    }
}

//Delete watchlist item
const watchlistDeleteOne = async (req, res) => {
    try {
        const watchlistItem = await watchlist.findById(req.params.watchlistId);
        
        if (!watchlistItem) {
            return res.status(404).json({ status: 'error', message: 'Item de favoritos no encontrado.' });
        }
        
        // Optional: verify ownership
        const sessionUser = req.session && req.session.user;
        if (sessionUser && watchlistItem.userId !== sessionUser.userid) {
            return res.status(403).json({ status: 'error', message: 'No puedes eliminar favoritos de otro usuario.' });
        }
        
        await watchlist.findByIdAndDelete(req.params.watchlistId);
        return res.status(200).json({ status: 'success', message: 'Item removido de favoritos.' });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Error al eliminar favorito.', error: err.message });
    }
}

module.exports = {
    watchlistCreate,
    watchlistList,
    watchlistReadOne,
    watchlistUpdateOne,
    watchlistDeleteOne,
}