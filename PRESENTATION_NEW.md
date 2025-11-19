# CampuSwap - Nuevas Funcionalidades
## Presentación de Mejoras Implementadas

**Desarrollado por:** Nikolai Enriquez  
**Fecha:** Noviembre 2025  
**Duración:** 5-10 minutos

---

## 📋 Agenda

1. Autenticación y Sesiones de Usuario
2. Vinculación de Datos con Usuarios
3. Búsqueda y Filtros Avanzados
4. Sistema de Favoritos (Watchlist)
5. Dashboard de Usuario y Panel Admin

---

## Slide 1: Autenticación y Sesiones de Usuario

### 🔐 Sistema de Autenticación Completo

**Tecnologías Implementadas:**
- **express-session**: Manejo de sesiones del lado del servidor
- **connect-mongo**: Persistencia de sesiones en MongoDB
- **bcryptjs**: Hash seguro de contraseñas

**Características Principales:**

#### 1️⃣ Registro de Usuarios
```javascript
//app_api/controllers/users.js
const usersCreate = async (req, res) => {
  const { name, email, password } = req.body;
  
  // Hash password with bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Generate incremental userid
  const maxUser = await users.findOne({}, {}, { sort: { userid: -1 } });
  const nextUserId = maxUser ? maxUser.userid + 1 : 654321;
  
  const newUser = new users({
    userid: nextUserId,
    name,
    email,
    password: hashedPassword
  });
  
  await newUser.save();
};
```

#### 2️⃣ Inicio de Sesión
```javascript
// app_server/controllers/auth.js
const loginPost = async (req, res) => {
  const { email, password } = req.body;
  const apiUrl = `${req.protocol}://${req.get('host')}/api/auth/login`;
  
  // Call API to validate credentials
  const { data } = await axios.post(apiUrl, { email, password });
  
  // Store user in session
  req.session.user = {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    userid: data.user.userid
  };
  
  // Persist session before redirect
  req.session.save(() => {
    res.redirect(nextUrl || '/me/items');
  });
};
```

#### 3️⃣ Protección de Rutas
```javascript
// app_server/middleware/auth.js
function ensureAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  const returnTo = encodeURIComponent(req.originalUrl);
  return res.redirect(`/auth/login?next=${returnTo}`);
}

// Usage in routes
router.get('/items/new', ensureAuth, ctrlItems.newItemGet);
router.get('/me/items', ensureAuth, ctrlDashboard.myItems);
```

**Session Setup (app.js):**
```javascript
app.use(session({
  name: 'campuswap.sid',
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    client: mongoose.connection.getClient(),
    dbName: 'campuswapdb',
    touchAfter: 24 * 3600
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Make current user available to all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session?.user || null;
  next();
});
```

**Flujo Completo:**
```
Usuario → Login Form → POST /auth/login → API Validates → 
Create Session → req.session.user → Redirect to Dashboard
```

---

## Slide 2: Vinculación de Datos con Usuarios

### 👤 Ownership de Contenido Generado

**Problema Anterior:**
Items, reviews y favoritos no estaban vinculados a usuarios específicos.

**Solución Implementada:**
Vinculación automática basada en `req.session.user` en todas las operaciones de creación.

#### 1️⃣ Items (Publicaciones)
```javascript
// app_api/controllers/items.js
const itemsCreate = async (req, res) => {
  // Check session user
  const sessionUser = req.session && req.session.user;
  
  if (!sessionUser || typeof sessionUser.userid !== 'number') {
    return res.status(401).json({ 
      message: 'Debes iniciar sesión para publicar un item.' 
    });
  }
  
  // Auto-link to user
  const newItem = new items({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
    category: req.body.category,
    condition: req.body.condition,
    images: req.body.images,
    sellerId: sessionUser.userid,      // Auto-link
    sellerName: sessionUser.name,      // Cache name
    itemId: nextItemId
  });
  
  await newItem.save();
  return res.status(201).json({ status: 'success', item: newItem });
};
```

#### 2️⃣ Reviews (Reseñas)
```javascript
// app_api/controllers/reviews.js
const reviewsCreate = async (req, res) => {
  const sessionUser = req.session && req.session.user;
  
  if (!sessionUser) {
    return res.status(401).json({ message: 'Debes iniciar sesión' });
  }
  
  const { itemId, sellerId, rating, title, comment } = req.body;
  
  const newReview = new reviews({
    reviewId: nextReviewId,
    itemId,
    sellerId,
    reviewerId: sessionUser.userid,    // Who writes
    reviewerName: sessionUser.name,    // Cache name
    rating,
    title,
    comment,
    purchaseVerified: false
  });
  
  await newReview.save();
};
```

#### 3️⃣ Watchlist (Favoritos)
```javascript
// app_api/controllers/watchlist.js
const watchlistCreate = async (req, res) => {
  const sessionUser = req.session && req.session.user;
  
  if (!sessionUser) {
    return res.status(401).json({ message: 'Debes iniciar sesión' });
  }
  
  const wl = new Watchlist({
    watchlistId: nextId,
    userId: sessionUser.userid,         // Owner
    itemId: req.body.itemId,
    itemTitle: req.body.itemTitle,
    itemPrice: req.body.itemPrice,
    sellerId: req.body.sellerId,
    sellerName: req.body.sellerName
  });
  
  await wl.save();
};
```

#### 4️⃣ Messages (Mensajes)
```javascript
// app_api/controllers/messages.js
const messagesCreate = async (req, res) => {
  const sessionUser = req.session && req.session.user;
  
  const newMessage = new messages({
    messageId: nextMessageId,
    senderId: sessionUser.userid,       // Sender
    senderName: sessionUser.name,
    recipientId: req.body.recipientId,
    messageText: req.body.messageText,
    conversationId: generatedId
  });
  
  await newMessage.save();
};
```

**Beneficios:**
- ✅ **Seguridad**: Solo el dueño puede editar/eliminar su contenido
- ✅ **Dashboard Personalizado**: Cada usuario ve solo sus items
- ✅ **Historial**: Trazabilidad de acciones por usuario
- ✅ **Integridad**: Datos siempre vinculados correctamente

**Validación de Ownership:**
```javascript
// Example: Delete item with ownership check
const deleteItem = async (req, res) => {
  const userId = req.session.user.userid;
  const item = await items.findById(req.params.id);
  
  if (item.sellerId !== userId) {
    return res.status(403).json({ message: 'No autorizado' });
  }
  
  await items.findByIdAndDelete(req.params.id);
};
```

---

## Slide 3: Búsqueda y Filtros Avanzados

### 🔍 Sistema de Búsqueda Multicriteria

**Parámetros Implementados:**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `q` | String | Texto libre en título/descripción | `?q=iPhone` |
| `category` | String | Categoría exacta | `?category=Tecnología` |
| `condition` | String | Condición del producto | `?condition=Nuevo` |
| `minPrice` | Number | Precio mínimo | `?minPrice=50` |
| `maxPrice` | Number | Precio máximo | `?maxPrice=500` |
| `limit` | Number | Resultados por página | `?limit=12` |
| `skip` | Number | Offset para paginación | `?skip=12` |
| `sort` | String | Ordenamiento | `?sort=-created` |

#### Backend Implementation
```javascript
// app_api/controllers/items.js
const itemsList = async (req, res) => {
  const { q, category, condition, minPrice, maxPrice, limit, skip, sort } = req.query;
  
  const filter = {};
  
  // 1. Text search (regex case-insensitive)
  if (q && typeof q === 'string') {
    const trimmed = q.trim().slice(0, 100); // cap length for security
    if (trimmed.length > 0) {
      // Escape special regex chars
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: regex },
        { description: regex }
      ];
    }
  }
  
  // 2. Exact match filters
  if (category) filter.category = category;
  if (condition) filter.condition = condition;
  
  // 3. Price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice && !Number.isNaN(Number(minPrice))) {
      filter.price.$gte = Number(minPrice);
    }
    if (maxPrice && !Number.isNaN(Number(maxPrice))) {
      filter.price.$lte = Number(maxPrice);
    }
    // Remove empty price object if invalid inputs
    if (Object.keys(filter.price).length === 0) {
      delete filter.price;
    }
  }
  
  // 4. Build query with pagination
  const query = items.find(filter).sort(sort || '-created').skip(Number(skip) || 0);
  if (limit && Number(limit) > 0) {
    query.limit(Number(limit));
  }
  
  // 5. Execute with count
  const [results, total] = await Promise.all([
    query.lean(),
    items.countDocuments(filter)
  ]);
  
  return res.status(200).json({
    status: 'success',
    total,
    count: results.length,
    items: results
  });
};
```

#### Frontend Controller
```javascript
// app_server/controllers/index.js
const index = async (req, res) => {
  // Extract search params
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
  const response = await axios.get(apiUrl);
  
  const itemsData = response.data.items || [];
  const meta = response.data;
  
  res.render('index', { 
    items: itemsData,
    search: { q, category, condition, minPrice, maxPrice },
    meta
  });
};
```

#### UI Form (Pug Template)
```pug
//- app_server/views/index.pug
form.row.g-3(method="get" action="/")
  .col-md-4
    label.form-label Búsqueda
    .input-group
      span.input-group-text
        i.bi.bi-search
      input.form-control(
        type="text", 
        name="q", 
        value=search && search.q, 
        placeholder="Buscar título o descripción..."
      )
  
  .col-md-2
    label.form-label Categoría
    select.form-select(name="category")
      option(value="") Todas
      each c in ['Libros','Tecnología','Arte','Hogar','Otros']
        option(value=c selected=search && search.category===c)= c
  
  .col-md-2
    label.form-label Condición
    select.form-select(name="condition")
      option(value="") Todas
      each cond in ['Nuevo','Como nuevo','Usado']
        option(value=cond selected=search && search.condition===cond)= cond
  
  .col-md-2
    label.form-label Precio Mín
    input.form-control(type="number", min="0", name="minPrice", value=search && search.minPrice)
  
  .col-md-2
    label.form-label Precio Máx
    input.form-control(type="number", min="0", name="maxPrice", value=search && search.maxPrice)
  
  .col-12.text-end
    button.btn.btn-primary.me-2(type="submit") Aplicar filtros
    a.btn.btn-outline-secondary(href="/") Limpiar

if meta
  .mt-3.small.text-muted
    | Mostrando #{meta.count} de #{meta.total} resultados
```

**Respuesta API:**
```json
{
  "status": "success",
  "total": 45,
  "count": 12,
  "items": [
    {
      "_id": "674abc...",
      "itemId": 100001,
      "title": "iPhone 13 Pro",
      "price": 850,
      "category": "Tecnología",
      "condition": "Como nuevo",
      "images": ["url1", "url2"]
    }
  ]
}
```

**Features Highlights:**
- 🔍 Text search across title and description
- 📁 Category and condition filters
- 💰 Price range filtering
- 📊 Result counts and metadata
- 🔄 Query param preservation
- 🎨 Active filter badges in UI

---

## Slide 4: Sistema de Favoritos (Watchlist)

### ❤️ Gestión de Items Favoritos

#### Modelo de Datos
```javascript
// app_api/models/schema-watchlist.js
const watchlistSchema = new mongoose.Schema({
  watchlistId: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },           // Owner
  itemId: { type: Number, required: true },           // Item saved
  itemTitle: { type: String, required: true },        // Cache for performance
  itemPrice: { type: Number, required: true },        // Cache price
  sellerId: { type: Number, required: true },
  sellerName: { type: String, required: true },
  priceAlert: { type: Boolean, default: false },      // Future: alerts
  alertPrice: { type: Number },
  notes: { type: String },
  created: { type: Date, default: Date.now }
});

// Prevent duplicates
watchlistSchema.index({ userId: 1, itemId: 1 }, { unique: true });
```

#### REST API Endpoints
```javascript
// app_api/routes/index.js
router.post('/watchlist', ctrlWatchlist.watchlistCreate);
router.get('/watchlist', ctrlWatchlist.watchlistList);
router.get('/watchlist/:watchlistId', ctrlWatchlist.watchlistReadOne);
router.put('/watchlist/:watchlistId', ctrlWatchlist.watchlistUpdateOne);
router.delete('/watchlist/:watchlistId', ctrlWatchlist.watchlistDeleteOne);
```

#### Create (Add to Favorites)
```javascript
// app_api/controllers/watchlist.js
const watchlistCreate = async (req, res) => {
  try {
    const sessionUser = req.session && req.session.user;
    
    if (!sessionUser) {
      return res.status(401).json({ 
        message: 'Debes iniciar sesión para guardar en favoritos.' 
      });
    }
    
    const { itemId, itemTitle, itemPrice, sellerId, sellerName } = req.body;
    
    // Validation
    const errors = [];
    if (!itemId) errors.push('itemId requerido');
    if (!itemTitle) errors.push('itemTitle requerido');
    if (itemPrice === undefined) errors.push('itemPrice requerido');
    if (errors.length) {
      return res.status(400).json({ status: 'error', message: errors.join('. ') });
    }
    
    // Generate incremental ID
    const maxW = await watchlist.findOne({}, {}, { sort: { watchlistId: -1 } });
    const nextId = maxW ? maxW.watchlistId + 1 : 4001;
    
    const wl = new watchlist({
      watchlistId: nextId,
      userId: sessionUser.userid,
      itemId,
      itemTitle,
      itemPrice,
      sellerId,
      sellerName
    });
    
    await wl.save();
    return res.status(201).json({ status: 'success', watchlist: wl });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ 
        status: 'error', 
        message: 'Este item ya está en tu lista.' 
      });
    }
    return res.status(500).json({ 
      status: 'error', 
      message: 'Error al agregar a favoritos.' 
    });
  }
};
```

#### List All
```javascript
const watchlistList = async (req, res) => {
  try {
    const watchlistItems = await watchlist.find({}).lean();
    return res.status(200).json(watchlistItems);
  } catch (err) {
    return res.status(500).json({ 
      status: 'error', 
      message: 'Error al listar favoritos.' 
    });
  }
};
```

#### Delete (Remove from Favorites)
```javascript
const watchlistDeleteOne = async (req, res) => {
  try {
    const watchlistItem = await watchlist.findById(req.params.watchlistId);
    
    if (!watchlistItem) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Item de favoritos no encontrado.' 
      });
    }
    
    // Verify ownership
    const sessionUser = req.session && req.session.user;
    if (sessionUser && watchlistItem.userId !== sessionUser.userid) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'No puedes eliminar favoritos de otro usuario.' 
      });
    }
    
    await watchlist.findByIdAndDelete(req.params.watchlistId);
    return res.status(200).json({ 
      status: 'success', 
      message: 'Item removido de favoritos.' 
    });
  } catch (err) {
    return res.status(500).json({ 
      status: 'error', 
      message: 'Error al eliminar favorito.' 
    });
  }
};
```

#### Client-Side JavaScript
```javascript
// app_server/views/index.pug (embedded script)
async function addToFavorites(itemId, itemTitle, itemPrice, sellerId, sellerName) {
  if (!itemId) {
    alert('Error: Item no válido');
    return;
  }
  
  try {
    const response = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId,
        itemTitle,
        itemPrice,
        sellerId,
        sellerName
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('✓ Agregado a favoritos');
    } else if (response.status === 401) {
      if (confirm('Debes iniciar sesión para guardar favoritos. ¿Ir a login?')) {
        window.location.href = '/auth/login?returnTo=' + encodeURIComponent(window.location.pathname);
      }
    } else if (response.status === 409) {
      alert('Este item ya está en tus favoritos');
    } else {
      alert('Error: ' + (data.message || 'No se pudo agregar a favoritos'));
    }
  } catch (err) {
    console.error('Error adding to favorites:', err);
    alert('Error de red. Intenta de nuevo.');
  }
}
```

#### Dashboard Favorites View
```javascript
// app_server/controllers/dashboard.js
const myFavorites = async (req, res) => {
  const userId = req.session.user.userid;
  const baseUrl = `${req.protocol}://${req.get('host')}/api`;
  
  // Fetch watchlist and all items in parallel
  const [watchlistRes, itemsRes] = await Promise.all([
    axios.get(`${baseUrl}/watchlist`),
    axios.get(`${baseUrl}/items`)
  ]);
  
  let watchlistItems = watchlistRes.data.filter(w => w.userId === userId);
  const allItems = itemsRes.data.items || itemsRes.data;
  
  // Cross-reference with actual items to get images, etc.
  const favorites = watchlistItems.map(w => {
    const actualItem = allItems.find(item => item.itemId === w.itemId);
    return {
      _id: actualItem?._id,
      images: actualItem?.images || [],
      title: w.itemTitle,
      description: actualItem?.description || '',
      price: w.itemPrice,
      category: actualItem?.category || '',
      seller: w.sellerName,
      watchlistId: w._id
    };
  }).filter(f => f._id); // Only include if item still exists
  
  res.render('dashboard/favorites', { favorites });
};
```

**Flujo Completo:**
```
1. User clicks heart button on item card
2. addToFavorites() called with item data
3. POST /api/watchlist with JSON body
4. API validates session
5. Check for duplicate (unique index)
6. Save to MongoDB
7. Return 201 Created or 409 Conflict
8. Show alert to user
9. Dashboard /me/favorites displays all saved items
```

**Security Features:**
- ✅ Requires authentication (401 if not logged in)
- ✅ Unique index prevents duplicates (409 Conflict)
- ✅ Ownership verification on delete (403 Forbidden)
- ✅ Cross-reference with items for updated data

---

## Slide 5: Dashboard de Usuario y Panel Admin

### �� Interfaces de Gestión

#### Dashboard Personal (`/me/items`, `/me/favorites`)

**Mis Items Implementation:**
```javascript
// app_server/controllers/dashboard.js
const myItems = async (req, res) => {
  const userId = req.session.user.userid;
  const apiUrl = `${req.protocol}://${req.get('host')}/api/items`;
  
  const response = await axios.get(apiUrl);
  const allItems = Array.isArray(response.data) ? response.data : response.data.items || [];
  
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
    items: userItems,
    stats
  });
};
```

**Dashboard Features:**
- ✅ View all items published by user
- ✅ Filter by status (Active/Sold/All)
- ✅ Edit item details
- ✅ Mark as sold/reactivate
- ✅ Delete items (with confirmation)
- ✅ View contact statistics

**Actions Available:**
```pug
//- app_server/views/dashboard/my-items.pug
.btn-group
  a.btn.btn-outline-primary.btn-sm(href=`/items/${item._id}`) Ver
  a.btn.btn-outline-secondary.btn-sm(href=`/items/edit/${item._id}`) Editar

if item.isAvailable !== false
  .btn-group
    button.btn.btn-warning.btn-sm(onclick=`markAsSold('${item._id}')`) Marcar Vendido
    button.btn.btn-outline-danger.btn-sm(onclick=`confirmDelete('${item._id}', '${item.title}')`) Eliminar
else
  .btn-group
    button.btn.btn-success.btn-sm(onclick=`markAsActive('${item._id}')`) Reactivar
    button.btn.btn-outline-danger.btn-sm(onclick=`confirmDelete('${item._id}', '${item.title}')`) Eliminar
```

**Status Toggle:**
```javascript
// app_server/controllers/dashboard.js
const toggleItemStatus = async (req, res) => {
  const itemId = req.params.id;
  const { status } = req.body;
  const userId = req.session.user.userid;
  const apiUrl = `${req.protocol}://${req.get('host')}/api/items/${itemId}`;
  
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
  
  res.redirect('/me/items');
};
```

---

### Panel de Administración (`/admin`)

**Admin Dashboard Controller:**
```javascript
// app_server/controllers/admin.js
const adminDashboard = async (req, res) => {
  const apiUrl = `${req.protocol}://${req.get('host')}/api`;
  
  // Fetch all data in parallel
  const [itemsRes, usersRes, reviewsRes, categoriesRes] = await Promise.allSettled([
    axios.get(`${apiUrl}/items`),
    axios.get(`${apiUrl}/users`),
    axios.get(`${apiUrl}/reviews`),
    axios.get(`${apiUrl}/categories`)
  ]);
  
  const items = itemsRes.status === 'fulfilled' ? itemsRes.value.data.items || itemsRes.value.data : [];
  const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
  const reviews = reviewsRes.status === 'fulfilled' ? reviewsRes.value.data : [];
  const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data : [];
  
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
    stats
  });
};
```

**Admin Features:**

1. **Dashboard with Stats:**
   - Total Items, Users, Reviews, Categories
   - Visual cards with icons

2. **Tabs de Gestión:**
   - **Items**: Ver todos, cambiar estado, eliminar
   - **Usuarios**: Lista con métricas (items publicados, rating)
   - **Testing API**: Crear categorías y reviews para pruebas
   - **Base de Datos**: Estadísticas y health check

3. **Items Management:**
```pug
//- Admin can manage ANY item (no ownership check)
table.table.table-hover#itemsTable
  thead
    tr
      th ID
      th Título
      th Vendedor
      th Precio
      th Estado
      th Acciones
  tbody
    each item in items
      tr
        td.text-muted.small= item.itemId
        td= item.title
        td= item.sellerName
        td.fw-bold $#{item.price}
        td
          if item.isAvailable !== false
            span.badge.bg-success Disponible
          else
            span.badge.bg-secondary Vendido
        td
          .btn-group
            a.btn.btn-sm.btn-outline-primary(href=`/items/${item._id}`, target="_blank") Ver
            button.btn.btn-sm.btn-outline-warning(onclick=`toggleItemStatus('${item._id}', ${!item.isAvailable})`) Toggle
            form.d-inline(method="post", action=`/admin/items/${item._id}/delete`)
              button.btn.btn-sm.btn-outline-danger(type="submit") Eliminar
```

4. **Health Check API:**
```javascript
// app_api/routes/index.js
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    node: process.version
  });
});
```

**Differences: Dashboard vs Admin:**

| Feature | User Dashboard | Admin Panel |
|---------|---------------|-------------|
| Scope | Solo items del usuario | Todos los items del sistema |
| Ownership | Verificado (403 si no es dueño) | Sin restricción |
| Purpose | Gestión personal | Moderación global |
| Access | Requiere `ensureAuth` | ⚠️ Sin protección de rol (pendiente) |
| Actions | Ver, Editar, Eliminar propios | Ver, Toggle, Eliminar cualquiera |

**Pending Security:**
```javascript
// TODO: Implement role-based access
function ensureAdmin(req, res, next) {
  if (!req.session?.user || req.session.user.role !== 'admin') {
    return res.status(403).render('error', { 
      message: 'Acceso denegado - Solo administradores' 
    });
  }
  next();
}

// Future: Protect admin routes
router.get('/admin', ensureAuth, ensureAdmin, adminCtrl.adminDashboard);
```

---

## Resumen de Tecnologías

### Stack Completo
- **Backend**: Node.js 22, Express 5
- **Base de Datos**: MongoDB Atlas (Mongoose ODM)
- **Sesiones**: express-session + connect-mongo
- **Seguridad**: bcryptjs (password hashing)
- **Frontend**: Pug templates, Bootstrap 5, Vanilla JS
- **HTTP Client**: Axios (server-side requests)
- **Deployment**: Vercel (serverless, auto-deploy from GitHub)

### Arquitectura MVC
```
app_server/          (Frontend MVC)
├── controllers/     (Request handlers, render views)
├── routes/          (URL routing + middleware)
├── views/           (Pug templates)
└── middleware/      (Auth guards: ensureAuth, ensureGuest)

app_api/             (REST API)
├── controllers/     (CRUD operations, business logic)
├── routes/          (API endpoints)
└── models/          (Mongoose schemas, validation)
```

### Patrones Implementados
- ✅ **Separation of Concerns** (API vs Server)
- ✅ **Middleware Composition** (auth guards)
- ✅ **Session-Based Authentication** (stateful)
- ✅ **RESTful API Design** (CRUD endpoints)
- ✅ **Server-Side Rendering** with client-side enhancement

### Métricas del Proyecto
- **9 colecciones** MongoDB
- **40+ endpoints** REST API
- **20+ vistas** Pug
- **Autenticación completa** con sesiones persistentes
- **Búsqueda multicriteria** con filtros dinámicos
- **Sistema de favoritos** con ownership
- **Dashboards personalizados** por usuario
- **Panel admin unificado** con stats y management

---

## Próximos Pasos

### Features Pendientes

1. **Roles de Usuario** (Alta Prioridad)
   - Campo `role` en schema users (`'user' | 'admin'`)
   - Middleware `ensureAdmin` para proteger `/admin`
   - UI condicional basada en rol

2. **Paginación** (Media Prioridad)
   - Navegación entre páginas de resultados
   - Botones anterior/siguiente
   - Saltos a página específica

3. **Testing** (Alta Prioridad)
   - Jest + Supertest para endpoints críticos
   - Tests de autenticación
   - Tests de CRUD operations
   - Coverage reports

4. **Seguridad** (Alta Prioridad)
   - Helmet.js (HTTP headers)
   - CORS configuration
   - Rate limiting (express-rate-limit)
   - Input sanitization

5. **Documentación API** (Media Prioridad)
   - OpenAPI 3.0 specification
   - Swagger UI at `/docs`
   - Endpoint descriptions y ejemplos

6. **Performance** (Media Prioridad)
   - Índices MongoDB (sellerId, itemId, category)
   - Query optimization
   - Response caching (Redis)

7. **Notificaciones** (Baja Prioridad)
   - Alertas de precio en favoritos
   - Email notifications
   - Push notifications (web push)

### Mejoras de UX

- 🔍 Búsqueda en tiempo real (autocomplete)
- 📷 Carga de imágenes local (Cloudinary/AWS S3)
- 💬 Chat en tiempo real (Socket.io)
- 🔔 Centro de notificaciones
- 🌙 Modo oscuro
- 📱 Progressive Web App (PWA)
- 🌐 Internacionalización (i18n)

---

## Conclusión

### ¿Qué logramos?

**Funcionalidad Completa:**
✅ Sistema de autenticación robusto con sesiones persistentes  
✅ Vinculación de datos usuario → contenido generado  
✅ Búsqueda y filtros avanzados multicriteria  
✅ Sistema de favoritos con gestión completa  
✅ Dashboards personalizados y panel admin  

**Arquitectura Sólida:**
✅ Separación clara entre API y presentación  
✅ Código modular y mantenible  
✅ Patrones de diseño consistentes  
✅ Seguridad a nivel de sesión y ownership  

**Código de Calidad:**
✅ Async/await moderno  
✅ Error handling comprehensivo  
✅ Validación de datos en múltiples capas  
✅ Logging para debugging  

### Skills Demostrados
- Full-stack development (Node.js + MongoDB + Pug)
- REST API design y implementación
- Session management y autenticación
- Database design y optimization
- Frontend/Backend integration
- Deployment en producción (Vercel + Atlas)

---

## Gracias

### Contacto

**Desarrollado por:** Nikolai Enriquez  
**Proyecto:** CampuSwap - Marketplace USFQ  
**Curso:** Desarrollo Web 3  
**Semestre:** Primer Semestre 2025-2026

**GitHub:** [Polkka1/ProyectoWeb3](https://github.com/Polkka1/ProyectoWeb3)  
**Live Demo:** Desplegado en Vercel

### Recursos
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Manual](https://www.mongodb.com/docs/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.3/)

---

**¡Preguntas?**

*CampuSwap - Desarrollado con ❤️ usando Node.js + MongoDB*
