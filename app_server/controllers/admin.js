const axios = require('axios');

// Unified admin dashboard with comprehensive data
const adminDashboard = async (req, res) => {
  const apiUrl = `${req.protocol}://${req.get('host')}/api`;
  
  try {
    // Fetch all data in parallel
    const [itemsRes, usersRes, reviewsRes, categoriesRes] = await Promise.allSettled([
      axios.get(`${apiUrl}/items`),
      axios.get(`${apiUrl}/users`),
      axios.get(`${apiUrl}/reviews`),
      axios.get(`${apiUrl}/categories`)
    ]);

    // Handle items response (can be array or object with items property)
    let items = [];
    if (itemsRes.status === 'fulfilled') {
      const itemsData = itemsRes.value.data;
      items = Array.isArray(itemsData) ? itemsData : (itemsData.items || []);
    }
    
    const users = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data) ? usersRes.value.data : [];
    const reviews = reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value.data) ? reviewsRes.value.data : [];
    const categories = categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value.data) ? categoriesRes.value.data : [];

    // Calculate stats
    const stats = {
      totalItems: items.length,
      totalUsers: users.length,
      totalReviews: reviews.length,
      totalCategories: categories.length
    };

    res.render('admin-dashboard', {
      title: 'Admin Panel - CampuSwap',
      items,
      users,
      reviews,
      categories,
      stats,
      error: null
    });
  } catch (err) {
    console.error('Error fetching admin data:', err.message);
    res.render('admin-dashboard', {
      title: 'Admin Panel - CampuSwap',
      items: [],
      users: [],
      reviews: [],
      categories: [],
      stats: { totalItems: 0, totalUsers: 0, totalReviews: 0, totalCategories: 0 },
      error: 'No se pudieron cargar los datos.'
    });
  }
};

// Handle item deletion via REST API
const adminDeleteItem = async (req, res) => {
  const itemId = req.params.itemId;
  const apiUrl = `${req.protocol}://${req.get('host')}/api/items/${itemId}`;
  
  try {
    await axios.delete(apiUrl);
    console.log(`Admin deleted item: ${itemId}`);
  } catch (err) {
    console.error('Error deleting item:', err.message);
  }
  res.redirect('/admin');
};

// Toggle item availability status
const adminToggleItemStatus = async (req, res) => {
  const itemId = req.params.itemId;
  const { isAvailable } = req.body;
  const apiUrl = `${req.protocol}://${req.get('host')}/api/items/${itemId}`;
  
  try {
    await axios.put(apiUrl, { isAvailable: Boolean(isAvailable) });
    console.log(`Admin toggled item ${itemId} status to: ${isAvailable}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error toggling item status:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  adminDashboard,
  adminDeleteItem,
  adminToggleItemStatus
};
