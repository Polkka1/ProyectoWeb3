const axios = require('axios');
const apiOptions = {
  server: process.env.API_URL || 'http://localhost:3000/api'
};

// Render admin dashboard with all items from REST API
const adminDashboard = async (req, res) => {
  const path = '/items';
  try {
    const response = await axios.get(apiOptions.server + path);
    if (Array.isArray(response.data)) {
      res.render('admin-dashboard', { items: response.data });
    } else {
      res.render('admin-dashboard', { items: [], error: 'No se pudieron cargar los items.' });
    }
  } catch (err) {
    console.error('Error fetching items:', err.message);
    res.render('admin-dashboard', { items: [], error: 'No se pudieron cargar los items.' });
  }
};

// Handle item deletion via REST API
const adminDeleteItem = async (req, res) => {
  const itemId = req.params.itemId;
  const path = `/items/${itemId}`;
  try {
    await axios.delete(apiOptions.server + path);
  } catch (err) {
    console.error('Error deleting item:', err.message);
  }
  // Always redirect back to dashboard after delete
  res.redirect('/admin');
};

module.exports = {
  adminDashboard,
  adminDeleteItem
};
