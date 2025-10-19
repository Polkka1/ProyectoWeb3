//categories collection controllers

const mongoose = require('mongoose');
const categories = mongoose.model('category');

//Create new category
const categoriesCreate = async (req, res) => {
    try {
        const { name, description, parentCategory, icon } = req.body;
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ status: 'error', message: 'El nombre es requerido y debe tener al menos 2 caracteres.' });
        }

        // Generate incremental categoryId
        const Category = require('../models/schema-categories');
        const maxCat = await Category.findOne({}, {}, { sort: { categoryId: -1 } });
        const nextCategoryId = maxCat ? maxCat.categoryId + 1 : 1;

        const newCategory = new Category({
            name: name.trim(),
            categoryId: nextCategoryId,
            description,
            parentCategory,
            icon
        });
        await newCategory.save();
        return res.status(201).json({
            status: 'success',
            message: 'Categoría creada exitosamente.',
            category: {
                id: newCategory._id,
                categoryId: newCategory.categoryId,
                name: newCategory.name,
                description: newCategory.description,
                parentCategory: newCategory.parentCategory,
                icon: newCategory.icon,
                isActive: newCategory.isActive
            }
        });
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(409).json({ status: 'error', message: 'Ya existe una categoría con ese nombre o ID.' });
        }
        return res.status(500).json({ status: 'error', message: 'Error al crear categoría.', error: err.message });
    }
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