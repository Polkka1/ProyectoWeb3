// GET home page
const index = (req, res, next) => {
  // Placeholder data for items - simulating marketplace items
  const items = [
    {
      id: 1,
      title: "Cálculo Stewart 8va Edición",
      description: "Libro de cálculo en excelente estado, pocas marcas de resaltador",
      price: 85,
      category: "Libros",
      condition: "Como nuevo",
      image: "https://picsum.photos/300/200?random=1"
    },
    {
      id: 2,
      title: "MacBook Air M1 2021",
      description: "Laptop en perfecto estado, batería al 95%, incluye cargador",
      price: 950,
      category: "Tecnología", 
      condition: "Usado",
      image: "https://picsum.photos/300/200?random=2"
    },
    {
      id: 3,
      title: "Calculadora TI-84 Plus",
      description: "Calculadora gráfica para matemáticas avanzadas",
      price: 120,
      category: "Tecnología",
      condition: "Nuevo",
      image: "https://picsum.photos/300/200?random=3"
    },
    {
      id: 4,
      title: "Set de Pinceles Profesionales",
      description: "Juego completo de pinceles para arte, diferentes tamaños",
      price: 35,
      category: "Arte",
      condition: "Como nuevo",
      image: "https://picsum.photos/300/200?random=4"
    },
    {
      id: 5,
      title: "Microondas Compacto",
      description: "Microondas pequeño perfecto para dormitorios",
      price: 75,
      category: "Hogar",
      condition: "Usado",
      image: "https://picsum.photos/300/200?random=5"
    },
    {
      id: 6,
      title: "Química Orgánica McMurry",
      description: "Libro de química orgánica, ideal para pre-medicina",
      price: 90,
      category: "Libros",
      condition: "Usado",
      image: "https://picsum.photos/300/200?random=6"
    },
    {
      id: 7,
      title: "iPad 9th Gen 64GB",
      description: "Tablet en excelente estado, perfecto para tomar notas",
      price: 280,
      category: "Tecnología",
      condition: "Como nuevo",
      image: "https://picsum.photos/300/200?random=7"
    },
    {
      id: 8,
      title: "Lámpara de Escritorio LED",
      description: "Lámpara ajustable con diferentes niveles de intensidad",
      price: 25,
      category: "Hogar",
      condition: "Nuevo",
      image: "https://picsum.photos/300/200?random=8"
    }
  ];

  res.render('index', { 
    title: 'CampuSwap - Mercado USFQ',
    items: items
  });
};

module.exports = {
  index
};
