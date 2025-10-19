//items collection controllers

const mongoose = require('mongoose');
const items = mongoose.model('item');

// Create new item
const itemsCreate = async (req, res) => {
    try {
        const { title, description, price, category, condition, images, whatsapp, sellerId, sellerName, location } = req.body;
        const errors = [];
        if (!title || String(title).trim().length < 3) errors.push('El título debe tener al menos 3 caracteres');
        if (!description || String(description).trim().length < 10) errors.push('La descripción debe tener al menos 10 caracteres');
        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || priceNum <= 0) errors.push('El precio debe ser un número mayor a 0');
        if (!category) errors.push('Selecciona una categoría');
        if (!condition) errors.push('Selecciona la condición del producto');

        // images → ensure array of non-empty strings
        let imageArray = [];
        if (images) {
            if (Array.isArray(images)) {
                imageArray = images.map(s => String(s).trim()).filter(Boolean);
            } else {
                imageArray = [String(images).trim()].filter(Boolean);
            }
        }
        if (imageArray.length === 0) errors.push('Agrega al menos una imagen (URL)');

        if (errors.length > 0) {
            return res.status(400).json({ status: 'error', message: errors.join('. ') });
        }

        // Generate incremental itemId
        let maxItem = await items.findOne({}, {}, { sort: { itemId: -1 } });
        let nextItemId = maxItem ? maxItem.itemId + 1 : 100001;

        const newItem = new items({
            title: String(title).trim(),
            description: String(description).trim(),
            price: priceNum,
            category,
            condition,
            images: imageArray,
            whatsapp,
            sellerId,
            sellerName,
            location,
            itemId: nextItemId
        });
        await newItem.save();
        return res.status(201).json({
            status: 'success',
            message: 'Item creado exitosamente.',
            item: {
                id: newItem._id,
                itemId: newItem.itemId,
                title: newItem.title,
                price: newItem.price,
                category: newItem.category,
                condition: newItem.condition
            }
        });
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(409).json({ status: 'error', message: 'Ya existe un item con ese ID.' });
        }
        if (err && err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ status: 'error', message: messages.join('. ') });
        }
        return res.status(500).json({ status: 'error', message: 'Error al crear item.', error: err.message });
    }
}

//Items list
const itemsList = async (req, res) => {
    try {
        // Optional query params for future pagination/filtering
        const limit = parseInt(req.query.limit) || 0; // 0 = no limit
        const skip = parseInt(req.query.skip) || 0;
        const sort = req.query.sort || '-created'; // default: newest first

        const itemsResult = await items
            .find({})
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .lean();

        return res.status(200).json(itemsResult);
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar items.',
            error: err.message
        });
    }
}

//Read one item
const itemsReadOne = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await items.findById(itemId);
        if (!item) {
            return res.status(404).json({ status: 'error', message: 'Item no encontrado.' });
        }
        return res.status(200).json({ status: 'success', item });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ status: 'error', message: 'ID de item inválido.' });
        }
        return res.status(500).json({ status: 'error', message: 'Error al buscar item.', error: err.message });
    }
}

//Update item
const itemsUpdateOne = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        if (!itemId) {
            return res.status(400).json({ status: 'error', message: 'Item ID requerido.' });
        }

        const { title, description, price, category, condition, images, whatsapp, location, isAvailable } = req.body;
        const updateFields = {};
        const errors = [];

        // Validate and add fields if provided
        if (title !== undefined) {
            if (String(title).trim().length < 3) errors.push('El título debe tener al menos 3 caracteres');
            else updateFields.title = String(title).trim();
        }
        if (description !== undefined) {
            if (String(description).trim().length < 10) errors.push('La descripción debe tener al menos 10 caracteres');
            else updateFields.description = String(description).trim();
        }
        if (price !== undefined) {
            const priceNum = Number(price);
            if (Number.isNaN(priceNum) || priceNum <= 0) errors.push('El precio debe ser un número mayor a 0');
            else updateFields.price = priceNum;
        }
        if (category !== undefined) updateFields.category = category;
        if (condition !== undefined) updateFields.condition = condition;
        if (whatsapp !== undefined) updateFields.whatsapp = whatsapp;
        if (location !== undefined) updateFields.location = location;
        if (isAvailable !== undefined) updateFields.isAvailable = Boolean(isAvailable);

        // Handle images
        if (images !== undefined) {
            let imageArray = [];
            if (Array.isArray(images)) {
                imageArray = images.map(s => String(s).trim()).filter(Boolean);
            } else {
                imageArray = [String(images).trim()].filter(Boolean);
            }
            if (imageArray.length === 0) errors.push('Debe haber al menos una imagen (URL)');
            else updateFields.images = imageArray;
        }

        if (errors.length > 0) {
            return res.status(400).json({ status: 'error', message: errors.join('. ') });
        }

        updateFields.lastModified = new Date();

        const updatedItem = await items.findByIdAndUpdate(itemId, updateFields, { new: true, runValidators: true });
        if (!updatedItem) {
            return res.status(404).json({ status: 'error', message: 'Item no encontrado.' });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Item actualizado exitosamente.',
            item: {
                id: updatedItem._id,
                itemId: updatedItem.itemId,
                title: updatedItem.title,
                price: updatedItem.price,
                category: updatedItem.category,
                condition: updatedItem.condition,
                isAvailable: updatedItem.isAvailable
            }
        });
    } catch (err) {
        if (err && err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ status: 'error', message: messages.join('. ') });
        }
        if (err && err.name === 'CastError') {
            return res.status(400).json({ status: 'error', message: 'ID de item inválido.' });
        }
        return res.status(500).json({ status: 'error', message: 'Error al actualizar item.', error: err.message });
    }
}

//Delete item
const itemsDeleteOne = async (req, res) => {
    try {
        const { itemId } = req.params;
        const deletedItem = await items.findByIdAndDelete(itemId);
        if (!deletedItem) {
            return res.status(404).json({ status: 'error', message: 'Item no encontrado.' });
        }
        res.status(200).json({ status: 'success', message: 'Item eliminado correctamente.' });
    } catch (err) {
        if (err && err.name === 'CastError') {
            return res.status(400).json({ status: 'error', message: 'ID de item inválido.' });
        }
        res.status(500).json({ status: 'error', message: 'Error al eliminar item.', error: err.message });
    }
}

module.exports = {
    itemsCreate,
    itemsList,
    itemsReadOne,
    itemsUpdateOne,
    itemsDeleteOne,
}