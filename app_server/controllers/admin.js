const request = require('request');
const apiOptions = {
  server: process.env.API_URL || 'http://localhost:3000/api'
};

// Render admin dashboard with all items from REST API
const adminDashboard = (req, res) => {
  const path = '/items';
  const requestOptions = {
    url: apiOptions.server + path,
    method: 'GET',
    json: {}
  };
  request(requestOptions, (err, response, body) => {
    if (response && response.statusCode === 200 && Array.isArray(body)) {
      res.render('admin-dashboard', { items: body });
    } else {
      res.render('admin-dashboard', { items: [], error: 'No se pudieron cargar los items.' });
    }
  });
};

// Handle item deletion via REST API
const adminDeleteItem = (req, res) => {
  const itemId = req.params.itemId;
  const path = `/items/${itemId}`;
  const requestOptions = {
    url: apiOptions.server + path,
    method: 'DELETE',
    json: {}
  };
  request(requestOptions, (err, response, body) => {
    // Always redirect back to dashboard after delete
    res.redirect('/admin');
  });
};

module.exports = {
  adminDashboard,
  adminDeleteItem
};
