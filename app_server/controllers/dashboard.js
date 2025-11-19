const axios = require('axios');

// GET user dashboard - my items
const myItems = async (req, res, next) => {
  const userId = req.session && req.session.user && req.session.user.userid;
  const userName = req.session && req.session.user && req.session.user.name || 'Usuario';
  
  if (!userId) {
    return res.redirect('/auth/login');
  }

  const apiUrl = `${req.protocol}://${req.get('host')}/api/items`;
  try {
    const response = await axios.get(apiUrl);
    const allItems = Array.isArray(response.data) ? response.data : [];
    
    // Filter items by logged-in user's sellerId
    const userItems = allItems.filter(item => item.sellerId === userId);
    
    // Calculate stats
    const stats = {
      total: userItems.length,
      active: userItems.filter(item => item.isAvailable !== false).length,
      sold: userItems.filter(item => item.isAvailable === false).length,
      totalViews: userItems.reduce((sum, item) => sum + (item.views || 0), 0)
    };

    res.render('dashboard/my-items', { 
      title: 'Mis Items - CampuSwap',
      items: userItems,
      stats: stats,
      userName
    });
  } catch (err) {
    console.error('Error fetching user items:', err.message);
    res.render('dashboard/my-items', { 
      title: 'Mis Items - CampuSwap',
      items: [],
      stats: { total: 0, active: 0, sold: 0, totalViews: 0 },
      userName
    });
  }
};

// GET user favorites
const myFavorites = async (req, res, next) => {
  const userId = req.session && req.session.user && req.session.user.userid;
  const userName = req.session && req.session.user && req.session.user.name || 'Usuario';
  
  if (!userId) {
    return res.redirect('/auth/login');
  }

  const apiUrl = `${req.protocol}://${req.get('host')}/api/watchlist`;
  try {
    const response = await axios.get(apiUrl);
    let watchlistItems = Array.isArray(response.data) ? response.data : [];
    
    // Filter by current user
    watchlistItems = watchlistItems.filter(w => w.userId === userId);
    
    // Transform watchlist format to match view expectations
    const favorites = watchlistItems.map(w => ({
      id: w.itemId,
      title: w.itemTitle,
      price: w.itemPrice,
      seller: w.sellerName,
      createdAt: w.created,
      watchlistId: w._id
    }));

    res.render('dashboard/favorites', { 
      title: 'Mis Favoritos - CampuSwap',
      favorites,
      userName
    });
  } catch (err) {
    console.error('Error fetching favorites:', err.message);
    res.render('dashboard/favorites', { 
      title: 'Mis Favoritos - CampuSwap',
      favorites: [],
      userName
    });
  }
};

// POST delete item
const deleteItem = async (req, res, next) => {
  const itemId = req.params.id;
  const userId = req.session && req.session.user && req.session.user.userid;
  
  if (!userId) {
    return res.redirect('/auth/login');
  }

  const apiUrl = `${req.protocol}://${req.get('host')}/api/items/${itemId}`;
  try {
    // First verify ownership by fetching the item
    const getRes = await axios.get(apiUrl);
    const item = getRes.data.item || getRes.data;
    
    if (item.sellerId !== userId) {
      console.error('User tried to delete item they do not own');
      return res.redirect('/me/items');
    }
    
    // Delete the item
    await axios.delete(apiUrl);
    console.log(`Item ${itemId} deleted by user ${userId}`);
    res.redirect('/me/items');
  } catch (err) {
    console.error('Error deleting item:', err.message);
    res.redirect('/me/items');
  }
};

// POST toggle item status (active/sold)
const toggleItemStatus = async (req, res, next) => {
  const itemId = req.params.id;
  const { status } = req.body;
  const userId = req.session && req.session.user && req.session.user.userid;
  
  if (!userId) {
    return res.redirect('/auth/login');
  }

  const apiUrl = `${req.protocol}://${req.get('host')}/api/items/${itemId}`;
  try {
    // Verify ownership
    const getRes = await axios.get(apiUrl);
    const item = getRes.data.item || getRes.data;
    
    if (item.sellerId !== userId) {
      console.error('User tried to update item they do not own');
      return res.redirect('/me/items');
    }
    
    // Update availability status
    const isAvailable = status === 'active';
    await axios.put(apiUrl, { isAvailable });
    console.log(`Item ${itemId} status changed to: ${status}`);
    res.redirect('/me/items');
  } catch (err) {
    console.error('Error updating item status:', err.message);
    res.redirect('/me/items');
  }
};

module.exports = {
  myItems,
  myFavorites,
  deleteItem,
  toggleItemStatus
};