//items collection controllers

const mongoose = require('mongoose');
const items = mongoose.model('item');

// Create new item
const itemsCreate = async (req, res) => {
    console.log('itemsCreate called. req.body:', req.body);
    console.log('itemsCreate files:', req.files);
    try {
        const { title, description, price, category, condition, images, whatsapp, location, quantity } = req.body;
        // Require authenticated user and link item to creator
        const sessionUser = req.session && req.session.user;
        if (!sessionUser || typeof sessionUser.userid !== 'number') {
            return res.status(401).json({ status: 'error', message: 'Debes iniciar sesión para publicar un item.' });
        }
        const errors = [];
        if (!title || String(title).trim().length < 3) errors.push('El título debe tener al menos 3 caracteres');
        if (!description || String(description).trim().length < 10) errors.push('La descripción debe tener al menos 10 caracteres');
        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || priceNum <= 0) errors.push('El precio debe ser un número mayor a 0');
        if (!category) errors.push('Selecciona una categoría');
        if (!condition) errors.push('Selecciona la condición del producto');

        // quantity → ensure integer >= 1 (default 1)
        let qty = 1;
        if (quantity !== undefined) {
            const q = Number(quantity);
            if (!Number.isInteger(q) || q < 1) errors.push('La cantidad debe ser un entero mayor o igual a 1');
            else qty = q;
        }

        // images → handle both uploaded files and URLs
        let imageArray = [];
        
        // Add uploaded files
        if (req.files && req.files.length > 0) {
            imageArray = req.files.map(file => `/uploads/items/${file.filename}`);
        }
        
        // Add URLs if provided (for backwards compatibility)
        if (images) {
            let urlImages = [];
            if (Array.isArray(images)) {
                urlImages = images.map(s => String(s).trim()).filter(Boolean);
            } else {
                urlImages = [String(images).trim()].filter(Boolean);
            }
            imageArray = [...imageArray, ...urlImages];
        }
        
        if (imageArray.length === 0) errors.push('Agrega al menos una imagen (archivo o URL)');

        if (errors.length > 0) {
            console.log('Validation errors:', errors);
            return res.status(400).json({ status: 'error', message: errors.join('. ') });
        }

        // Generate incremental itemId
        let maxItem = await items.findOne({}, {}, { sort: { itemId: -1 } });
        let nextItemId = maxItem ? maxItem.itemId + 1 : 100001;

        const newItem = new items({
            title: String(title).trim(),
            description: String(description).trim(),
            price: priceNum,
            quantity: qty,
            category,
            condition,
            images: imageArray,
            whatsapp,
            sellerId: sessionUser.userid,
            sellerName: sessionUser.name,
            location,
            itemId: nextItemId
        });
        await newItem.save();
        console.log('Item created successfully:', newItem);
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
        console.error('Error creating item:', err);
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

// Items list with search & filters
const itemsList = async (req, res) => {
    try {
        const {
            q, // free text across title/description
            category,
            condition,
            minPrice,
            maxPrice,
            limit: limitRaw,
            skip: skipRaw,
            sort: sortRaw
        } = req.query;

        const limit = Number.parseInt(limitRaw) || 0; // 0 = no limit
        const skip = Number.parseInt(skipRaw) || 0;
        const sort = sortRaw || '-created';

        const filter = {};

        // Text search (basic, case-insensitive regex). Guard length to avoid ReDoS.
        if (q && typeof q === 'string') {
            const trimmed = q.trim().slice(0, 100); // cap length
            if (trimmed.length > 0) {
                const regex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                filter.$or = [
                    { title: regex },
                    { description: regex }
                ];
            }
        }

        if (category) filter.category = category;
        if (condition) filter.condition = condition;

        // Price range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice && !Number.isNaN(Number(minPrice))) filter.price.$gte = Number(minPrice);
            if (maxPrice && !Number.isNaN(Number(maxPrice))) filter.price.$lte = Number(maxPrice);
            // Remove empty price object if invalid inputs
            if (Object.keys(filter.price).length === 0) delete filter.price;
        }

        const query = items.find(filter).sort(sort).skip(skip);
        if (limit > 0) query.limit(limit);

        const [results, total] = await Promise.all([
            query.lean(),
            items.countDocuments(filter)
        ]);

        return res.status(200).json({
            status: 'success',
            total,
            count: results.length,
            items: results
        });
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
        const item = await items.findById(itemId).lean();
        if (!item) {
            return res.status(404).json({ status: 'error', message: 'Item no encontrado.' });
        }

        // Populate seller info (name and rating) from users collection
        const users = mongoose.model('user');
        const seller = await users.findOne({ userid: item.sellerId }, {
            name: 1,
            userid: 1,
            email: 1,
            'rating.average': 1,
            'rating.totalReviews': 1
        }).lean();

        // Attach seller data to item response
        if (seller) {
            item.seller = {
                id: seller._id,
                userid: seller.userid,
                name: seller.name,
                firstName: seller.name ? seller.name.split(' ')[0] : 'Usuario',
                email: seller.email,
                whatsapp: item.whatsapp || '',
                rating: {
                    average: seller.rating?.average || 0,
                    totalReviews: seller.rating?.totalReviews || 0
                }
            };
        } else {
            // Fallback if seller not found
            item.seller = {
                name: item.sellerName || 'Usuario desconocido',
                firstName: item.sellerName ? item.sellerName.split(' ')[0] : 'Usuario',
                whatsapp: item.whatsapp || '',
                rating: { average: 0, totalReviews: 0 }
            };
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

        const { title, description, price, category, condition, images, whatsapp, location, isAvailable, quantity } = req.body;
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
        if (quantity !== undefined) {
            const q = Number(quantity);
            if (!Number.isInteger(q) || q < 1) errors.push('La cantidad debe ser un entero mayor o igual a 1');
            else updateFields.quantity = q;
        }

        // Handle images
        if (images !== undefined || (req.files && req.files.length > 0)) {
            let imageArray = [];
            
            // Add uploaded files
            if (req.files && req.files.length > 0) {
                imageArray = req.files.map(file => `/uploads/items/${file.filename}`);
            }
            
            // Add URLs if provided
            if (images !== undefined) {
                let urlImages = [];
                if (Array.isArray(images)) {
                    urlImages = images.map(s => String(s).trim()).filter(Boolean);
                } else {
                    urlImages = [String(images).trim()].filter(Boolean);
                }
                imageArray = [...imageArray, ...urlImages];
            }
            
            if (imageArray.length === 0) errors.push('Debe haber al menos una imagen (archivo o URL)');
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

// Increment contact clicks counter
const itemsIncrementContact = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const updatedItem = await items.findByIdAndUpdate(
            itemId,
            { $inc: { contactClicks: 1 } },
            { new: true }
        );
        
        if (!updatedItem) {
            return res.status(404).json({ status: 'error', message: 'Item no encontrado.' });
        }
        
        return res.status(200).json({ 
            status: 'success', 
            contactClicks: updatedItem.contactClicks 
        });
    } catch (err) {
        return res.status(500).json({ 
            status: 'error', 
            message: 'Error al registrar contacto.', 
            error: err.message 
        });
    }
};

module.exports = {
    itemsCreate,
    itemsList,
    itemsReadOne,
    itemsUpdateOne,
    itemsDeleteOne,
    itemsIncrementContact,
}