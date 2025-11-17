const axios = require('axios');

// GET public items list page
const itemsListPage = async (req, res) => {
  const apiUrl = `${req.protocol}://${req.get('host')}/api/items`;
  try {
    const response = await axios.get(apiUrl);
    if (Array.isArray(response.data)) {
      return res.render('items/index', {
        title: 'Items - CampuSwap',
        error: null,
        items: response.data
      });
    }
    res.render('items/index', {
      title: 'Items - CampuSwap',
      error: 'No se pudieron cargar los items.',
      items: []
    });
  } catch (err) {
    console.error('Error fetching items:', err.message);
    res.render('items/index', {
      title: 'Items - CampuSwap',
      error: 'No se pudieron cargar los items.',
      items: []
    });
  }
};

// GET item detail page
const itemDetail = async (req, res, next) => {
  const itemId = req.params.id;
  const apiUrl = `${req.protocol}://${req.get('host')}/api/items/${itemId}`;
  try {
    const response = await axios.get(apiUrl);
    const item = response.data.item || response.data;
    if (!item) {
      return res.status(404).render('error', {
        title: 'Producto no encontrado',
        message: 'El producto que buscas no existe o ha sido eliminado.',
        error: { status: 404 }
      });
    }

    return res.render('items/detail', {
      title: `${item.title} - CampuSwap`,
      item
    });
  } catch (err) {
    console.error('Error fetching item detail:', err.message);
    const status = err.response?.status || 500;
    const message = status === 404 ? 'El producto que buscas no existe o ha sido eliminado.' : 'No se pudo cargar el detalle del producto.';
    return res.status(status).render('error', {
      title: status === 404 ? 'Producto no encontrado' : 'Error',
      message,
      error: { status }
    });
  }
};

// GET new item form
const newItemGet = (req, res, next) => {
  res.render('items/new', { 
    title: 'Publicar Nuevo Item - CampuSwap',
    error: null,
    success: null,
    formData: {}
  });
};

// POST new item
const newItemPost = async (req, res, next) => {
  const { title, description, price, category, condition, images, whatsapp } = req.body;

  // Basic validation (client-friendly)
  const errors = [];
  if (!title || title.trim().length < 3) errors.push('El título debe tener al menos 3 caracteres');
  if (!description || description.trim().length < 10) errors.push('La descripción debe tener al menos 10 caracteres');
  if (!price || isNaN(price) || parseFloat(price) <= 0) errors.push('El precio debe ser un número mayor a 0');
  if (!category) errors.push('Selecciona una categoría');
  if (!condition) errors.push('Selecciona la condición del producto');

  // Process images (normalize to array)
  let imageArray = [];
  if (images) {
    if (Array.isArray(images)) imageArray = images.filter(img => img.trim() !== '');
    else imageArray = [images.trim()].filter(img => img !== '');
  }
  if (imageArray.length === 0) errors.push('Agrega al menos una imagen (URL)');

  if (errors.length > 0) {
    return res.render('items/new', {
      title: 'Publicar Nuevo Item - CampuSwap',
      error: errors.join('. '),
      success: null,
      formData: { title, description, price, category, condition, images, whatsapp }
    });
  }

  // Call REST API to actually create the item
  const apiUrl = `${req.protocol}://${req.get('host')}/api/items`;
  try {
    await axios.post(apiUrl, {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      condition,
      images: imageArray,
      whatsapp
    });
    // Success: redirect to confirmation page
    return res.redirect('/items/success');
  } catch (err) {
    console.error('Error creating item:', err.message);
    const errorMessage = err.response?.data?.message || 'Error de red o del servidor. Intenta de nuevo.';
    return res.render('items/new', {
      title: 'Publicar Nuevo Item - CampuSwap',
      error: errorMessage,
      success: null,
      formData: { title, description, price, category, condition, images, whatsapp }
    });
  }
};

// GET edit item form
const editItemGet = async (req, res, next) => {
  const itemId = req.params.id;
  const apiUrl = `${req.protocol}://${req.get('host')}/api/items/${itemId}`;

  try {
    const response = await axios.get(apiUrl);
    const item = response.data.item || response.data;
    res.render('items/edit', {
      title: 'Editar Item - CampuSwap',
      error: null,
      success: null,
      item: item
    });
  } catch (err) {
    console.error('Error fetching item:', err.message);
    return res.status(404).render('error', {
      title: 'Item no encontrado',
      message: 'El item que intentas editar no existe o no está disponible.',
      error: { status: 404 }
    });
  }
};

// POST edit item
const editItemPost = async (req, res, next) => {
  const itemId = req.params.id;
  const { title, description, price, category, condition, images, whatsapp, isAvailable } = req.body;

  // Basic validation
  const errors = [];
  if (!title || title.trim().length < 3) errors.push('El título debe tener al menos 3 caracteres');
  if (!description || description.trim().length < 10) errors.push('La descripción debe tener al menos 10 caracteres');
  if (!price || isNaN(price) || parseFloat(price) <= 0) errors.push('El precio debe ser un número mayor a 0');
  if (!category) errors.push('Selecciona una categoría');
  if (!condition) errors.push('Selecciona la condición del producto');

  // Process images
  let imageArray = [];
  if (images) {
    if (Array.isArray(images)) imageArray = images.filter(img => img.trim() !== '');
    else imageArray = [images.trim()].filter(img => img !== '');
  }
  if (imageArray.length === 0) errors.push('Agrega al menos una imagen (URL)');

  if (errors.length > 0) {
    return res.render('items/edit', {
      title: 'Editar Item - CampuSwap',
      error: errors.join('. '),
      success: null,
      item: { _id: itemId, title, description, price, category, condition, images, whatsapp, isAvailable }
    });
  }

  // Call REST API to update
  const apiUrl = `${req.protocol}://${req.get('host')}/api/items/${itemId}`;
  try {
    const response = await axios.put(apiUrl, {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      condition,
      images: imageArray,
      whatsapp,
      isAvailable: isAvailable === 'true' || isAvailable === true
    });
    // Success
    return res.render('items/edit', {
      title: 'Editar Item - CampuSwap',
      error: null,
      success: 'Item actualizado exitosamente!',
      item: response.data.item || { _id: itemId, title, description, price, category, condition, images, whatsapp, isAvailable }
    });
  } catch (err) {
    console.error('Error updating item:', err.message);
    const errorMessage = err.response?.data?.message || 'Error de red o del servidor. Intenta de nuevo.';
    return res.render('items/edit', {
      title: 'Editar Item - CampuSwap',
      error: errorMessage,
      success: null,
      item: { _id: itemId, title, description, price, category, condition, images, whatsapp, isAvailable }
    });
  }
};

module.exports.editItemGet = editItemGet;

module.exports = {
  itemsListPage,
  itemDetail,
  newItemGet,
  newItemPost,
  editItemGet,
  editItemPost
};
