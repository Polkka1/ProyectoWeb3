const axios = require('axios');

// GET home page
const index = async (req, res, next) => {
  const apiUrl = `${req.protocol}://${req.get('host')}/api/items?limit=8&sort=-created`;
  try {
    const response = await axios.get(apiUrl);
    const items = Array.isArray(response.data) ? response.data : [];
    
    res.render('index', { 
      title: 'CampuSwap - Mercado USFQ',
      items: items
    });
  } catch (err) {
    console.error('Error fetching items for home:', err.message);
    res.render('index', { 
      title: 'CampuSwap - Mercado USFQ',
      items: []
    });
  }
};

module.exports = {
  index
};
