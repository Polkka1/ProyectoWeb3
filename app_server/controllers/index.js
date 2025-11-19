const axios = require('axios');

// GET home page
const index = async (req, res, next) => {
  // Extract search query params from request
  const { q, category, condition, minPrice, maxPrice } = req.query;
  const params = new URLSearchParams();
  params.set('limit', '12');
  params.set('sort', '-created');
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (condition) params.set('condition', condition);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);

  const apiUrl = `${req.protocol}://${req.get('host')}/api/items?${params.toString()}`;
  try {
    const response = await axios.get(apiUrl);
    // New API shape returns { status, total, count, items }
    const itemsData = Array.isArray(response.data) ? response.data : response.data.items || [];
    const meta = response.data && response.data.status === 'success' ? response.data : null;

    res.render('index', { 
      title: 'CampuSwap - Mercado USFQ',
      items: itemsData,
      search: { q, category, condition, minPrice, maxPrice },
      meta
    });
  } catch (err) {
    console.error('Error fetching items for home:', err.message);
    res.render('index', { 
      title: 'CampuSwap - Mercado USFQ',
      items: [],
      search: { q, category, condition, minPrice, maxPrice }
    });
  }
};

module.exports = {
  index
};
