const mongoose = require('mongoose');

const categoriesSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    categoryId: { type: Number, required: true, unique: true },
    description: { type: String },
    parentCategory: { type: Number }, // For subcategories
    icon: { type: String }, // Icon URL or class name
    isActive: { type: Boolean, default: true },
    itemCount: { type: Number, default: 0 },
    created: { type: Date, default: Date.now }
});

//compile schema to model
const Category = mongoose.model('category', categoriesSchema);

const category = new Category({
    name: 'Electronics',
    categoryId: 1,
    description: 'Electronic devices and accessories',
    icon: 'fas fa-laptop',
    isActive: true,
    itemCount: 0
});

//manual saving a category with error handling
/*category.save()
  .then(() => {
    console.log('Category saved successfully:', category.name);
  })
  .catch(err => {
    if (err.code === 11000) {
      console.log('Category already exists with name:', category.name);
    } else {
      console.error('Error saving category:', err.message);
    }
  });*/