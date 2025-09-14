// GET item detail page
const itemDetail = (req, res, next) => {
  const itemId = req.params.id;
  
  // Placeholder data for items - same as in index controller for consistency
  const items = [
    {
      id: 1,
      title: "Cálculo Stewart 8va Edición",
      description: "Libro de cálculo en excelente estado, pocas marcas de resaltador. Perfecto para estudiantes de ingeniería y matemáticas. Incluye CD con material adicional y soluciones.",
      price: 85,
      category: "Libros",
      condition: "Como nuevo",
      images: [
        "https://picsum.photos/600/400?random=1",
        "https://picsum.photos/600/400?random=11", 
        "https://picsum.photos/600/400?random=12"
      ],
      seller: {
        name: "María González",
        email: "maria.gonzalez@student.usfq.edu.ec",
        whatsapp: "593987654321"
      },
      createdAt: "2025-01-10",
      contactClicks: 12
    },
    {
      id: 2,
      title: "MacBook Air M1 2021",
      description: "Laptop en perfecto estado, batería al 95%, incluye cargador original. Ideal para diseño, programación y uso académico. Sin golpes ni rayones.",
      price: 950,
      category: "Tecnología", 
      condition: "Usado",
      images: [
        "https://picsum.photos/600/400?random=2",
        "https://picsum.photos/600/400?random=21",
        "https://picsum.photos/600/400?random=22"
      ],
      seller: {
        name: "Carlos Rodríguez",
        email: "carlos.rodriguez@student.usfq.edu.ec",
        whatsapp: "593998765432"
      },
      createdAt: "2025-01-08",
      contactClicks: 25
    },
    {
      id: 3,
      title: "Calculadora TI-84 Plus",
      description: "Calculadora gráfica para matemáticas avanzadas, cálculo, estadística. Nueva, sin uso. Incluye manual y cable USB.",
      price: 120,
      category: "Tecnología",
      condition: "Nuevo",
      images: [
        "https://picsum.photos/600/400?random=3",
        "https://picsum.photos/600/400?random=31",
        "https://picsum.photos/600/400?random=32"
      ],
      seller: {
        name: "Ana López",
        email: "ana.lopez@student.usfq.edu.ec",
        whatsapp: "593976543210"
      },
      createdAt: "2025-01-12",
      contactClicks: 8
    },
    {
      id: 4,
      title: "Set de Pinceles Profesionales",
      description: "Juego completo de pinceles para arte, diferentes tamaños y formas. Marca Winsor & Newton, alta calidad.",
      price: 35,
      category: "Arte",
      condition: "Como nuevo",
      images: [
        "https://picsum.photos/600/400?random=4",
        "https://picsum.photos/600/400?random=41"
      ],
      seller: {
        name: "Sofia Herrera",
        email: "sofia.herrera@student.usfq.edu.ec",
        whatsapp: "593965432109"
      },
      createdAt: "2025-01-09",
      contactClicks: 5
    },
    {
      id: 5,
      title: "Microondas Compacto",
      description: "Microondas pequeño perfecto para dormitorios. 700W, funciona perfectamente. Ideal para estudiantes.",
      price: 75,
      category: "Hogar",
      condition: "Usado",
      images: [
        "https://picsum.photos/600/400?random=5",
        "https://picsum.photos/600/400?random=51"
      ],
      seller: {
        name: "Diego Morales",
        email: "diego.morales@student.usfq.edu.ec", 
        whatsapp: "593954321098"
      },
      createdAt: "2025-01-11",
      contactClicks: 15
    },
    {
      id: 6,
      title: "Química Orgánica McMurry",
      description: "Libro de química orgánica, ideal para pre-medicina. 9na edición, excelente estado.",
      price: 90,
      category: "Libros",
      condition: "Usado",
      images: [
        "https://picsum.photos/600/400?random=6"
      ],
      seller: {
        name: "Isabella Castro",
        email: "isabella.castro@student.usfq.edu.ec",
        whatsapp: "593943210987"
      },
      createdAt: "2025-01-07",
      contactClicks: 18
    },
    {
      id: 7,
      title: "iPad 9th Gen 64GB",
      description: "Tablet en excelente estado, perfecto para tomar notas digitales. Incluye Apple Pencil compatible.",
      price: 280,
      category: "Tecnología",
      condition: "Como nuevo",
      images: [
        "https://picsum.photos/600/400?random=7",
        "https://picsum.photos/600/400?random=71",
        "https://picsum.photos/600/400?random=72"
      ],
      seller: {
        name: "Alejandro Vega",
        email: "alejandro.vega@student.usfq.edu.ec",
        whatsapp: "593932109876"
      },
      createdAt: "2025-01-06",
      contactClicks: 22
    },
    {
      id: 8,
      title: "Lámpara de Escritorio LED",
      description: "Lámpara ajustable con diferentes niveles de intensidad. Perfecta para estudiar.",
      price: 25,
      category: "Hogar",
      condition: "Nuevo",
      images: [
        "https://picsum.photos/600/400?random=8"
      ],
      seller: {
        name: "Camila Reyes",
        email: "camila.reyes@student.usfq.edu.ec",
        whatsapp: "593921098765"
      },
      createdAt: "2025-01-13",
      contactClicks: 3
    }
  ];

  // Find the item by ID
  const item = items.find(item => item.id == itemId);
  
  if (!item) {
    return res.status(404).render('error', { 
      title: 'Producto no encontrado',
      message: 'El producto que buscas no existe o ha sido eliminado.',
      error: { status: 404 }
    });
  }

  res.render('item-detail', { 
    title: item.title + ' - CampuSwap',
    item: item
  });
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
const newItemPost = (req, res, next) => {
  const { title, description, price, category, condition, images, whatsapp } = req.body;
  
  // Basic validation
  const errors = [];
  
  if (!title || title.trim().length < 3) {
    errors.push('El título debe tener al menos 3 caracteres');
  }
  
  if (!description || description.trim().length < 10) {
    errors.push('La descripción debe tener al menos 10 caracteres');
  }
  
  if (!price || isNaN(price) || parseFloat(price) <= 0) {
    errors.push('El precio debe ser un número mayor a 0');
  }
  
  if (!category) {
    errors.push('Selecciona una categoría');
  }
  
  if (!condition) {
    errors.push('Selecciona la condición del producto');
  }
  
  if (!whatsapp || whatsapp.length < 10) {
    errors.push('Ingresa un número de WhatsApp válido');
  }
  
  // Process images (convert single string to array if needed)
  let imageArray = [];
  if (images) {
    if (Array.isArray(images)) {
      imageArray = images.filter(img => img.trim() !== '');
    } else {
      imageArray = [images.trim()].filter(img => img !== '');
    }
  }
  
  if (imageArray.length === 0) {
    errors.push('Agrega al menos una imagen (URL)');
  }
  
  if (errors.length > 0) {
    return res.render('items/new', {
      title: 'Publicar Nuevo Item - CampuSwap',
      error: errors.join('. '),
      success: null,
      formData: { title, description, price, category, condition, images, whatsapp }
    });
  }
  
  // Simulate creating new item (in real app, save to database)
  const newItem = {
    id: Date.now(), // Simple ID generation for demo
    title: title.trim(),
    description: description.trim(),
    price: parseFloat(price),
    category,
    condition,
    images: imageArray,
    seller: {
      name: "Usuario Demo", // In real app, get from session
      email: "demo@usfq.edu.ec", 
      whatsapp: whatsapp
    },
    createdAt: new Date().toISOString().split('T')[0],
    contactClicks: 0
  };
  
  console.log('New item would be created:', newItem);
  
  res.render('items/new', {
    title: 'Publicar Nuevo Item - CampuSwap',
    error: null,
    success: 'Item publicado exitosamente! Podrás verlo en "Mis Items".',
    formData: {}
  });
};

module.exports = {
  itemDetail,
  newItemGet,
  newItemPost
};