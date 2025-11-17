// GET user dashboard - my items
const myItems = (req, res, next) => {
  // Simulate user's items - in real app, filter by logged-in user
  // For demo purposes, showing items from our "demo user"
  const userItems = [
    {
      id: 2,
      title: "MacBook Air M1 2021",
      description: "Laptop en perfecto estado, batería al 95%, incluye cargador original. Ideal para diseño, programación y uso académico.",
      price: 950,
      category: "Tecnología", 
      condition: "Usado",
      image: "https://picsum.photos/300/200?random=2",
      createdAt: "2025-01-08",
      contactClicks: 25,
      status: "active"
    },
    {
      id: 7,
      title: "iPad 9th Gen 64GB",
      description: "Tablet en excelente estado, perfecto para tomar notas digitales. Incluye Apple Pencil compatible.",
      price: 280,
      category: "Tecnología",
      condition: "Como nuevo",
      image: "https://picsum.photos/300/200?random=7",
      createdAt: "2025-01-06",
      contactClicks: 22,
      status: "active"
    },
    {
      id: 9,
      title: "Libro de Física Universitaria",
      description: "Sears y Zemansky, 14va edición. Usado pero en buen estado.",
      price: 65,
      category: "Libros",
      condition: "Usado",
      image: "https://picsum.photos/300/200?random=9",
      createdAt: "2025-01-05",
      contactClicks: 8,
      status: "active"
    },
    {
      id: 10,
      title: "Escritorio de Estudio",
      description: "Escritorio de madera, perfecto para estudiar. Incluye cajonera.",
      price: 120,
      category: "Hogar",
      condition: "Usado",
      image: "https://picsum.photos/300/200?random=10",
      createdAt: "2025-01-03",
      contactClicks: 5,
      status: "sold"
    }
  ];

  // Calculate stats
  const stats = {
    total: userItems.length,
    active: userItems.filter(item => item.status === 'active').length,
    sold: userItems.filter(item => item.status === 'sold').length,
    totalViews: userItems.reduce((sum, item) => sum + item.contactClicks, 0)
  };

  res.render('dashboard/my-items', { 
    title: 'Mis Items - CampuSwap',
    items: userItems,
    stats: stats,
    userName: (req.session && req.session.user && req.session.user.name) || 'Usuario'
  });
};

// GET user favorites
const myFavorites = (req, res, next) => {
  // Simulate user's favorite items
  const favoriteItems = [
    {
      id: 1,
      title: "Cálculo Stewart 8va Edición",
      description: "Libro de cálculo en excelente estado, pocas marcas de resaltador.",
      price: 85,
      category: "Libros",
      condition: "Como nuevo",
      image: "https://picsum.photos/300/200?random=1",
      seller: "María González",
      createdAt: "2025-01-10"
    },
    {
      id: 3,
      title: "Calculadora TI-84 Plus",
      description: "Calculadora gráfica para matemáticas avanzadas, cálculo, estadística.",
      price: 120,
      category: "Tecnología",
      condition: "Nuevo",
      image: "https://picsum.photos/300/200?random=3",
      seller: "Ana López",
      createdAt: "2025-01-12"
    },
    {
      id: 4,
      title: "Set de Pinceles Profesionales",
      description: "Juego completo de pinceles para arte, diferentes tamaños y formas.",
      price: 35,
      category: "Arte",
      condition: "Como nuevo",
      image: "https://picsum.photos/300/200?random=4",
      seller: "Sofia Herrera",
      createdAt: "2025-01-09"
    }
  ];

  res.render('dashboard/favorites', { 
    title: 'Mis Favoritos - CampuSwap',
    favorites: favoriteItems,
    userName: (req.session && req.session.user && req.session.user.name) || 'Usuario'
  });
};

// POST delete item (placeholder)
const deleteItem = (req, res, next) => {
  const itemId = req.params.id;
  
  // In real app, delete from database and check user ownership
  console.log(`Item ${itemId} would be deleted`);
  
  // Redirect back to dashboard with success message
  // For now, just redirect - in real app would add flash message
  res.redirect('/me/items');
};

// POST toggle item status (active/sold)
const toggleItemStatus = (req, res, next) => {
  const itemId = req.params.id;
  const { status } = req.body;
  
  // In real app, update database
  console.log(`Item ${itemId} status would be changed to: ${status}`);
  
  res.redirect('/me/items');
};

module.exports = {
  myItems,
  myFavorites,
  deleteItem,
  toggleItemStatus
};