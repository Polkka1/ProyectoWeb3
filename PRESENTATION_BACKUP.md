# CampuSwap - Nuevas Funcionalidades
## Presentación de Mejoras Implementadas

**Presentation by:** Nikolai Enriquez  
**Date:** November 2025  
**Duration:** 5-10 minutes

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
- `express-session`: Manejo de sesiones del lado del servidor
- `connect-mongo`: Persistencia de sesiones en MongoDB
- `bcryptjs`: Hash seguro de contraseñas

**Características Principales:**

1. **Registro de Usuarios**
   - Validación de email institucional (@usfq.edu.ec)
   - Hash de contraseñas con bcrypt (10 salt rounds)
   - Generación automática de `userid` incremental

2. **Inicio de Sesión**
   - Verificación de credenciales contra la base de datos
   - Creación de sesión persistente (7 días)
   - Redirección inteligente con parámetro `returnTo`

3. **Protección de Rutas**
   ```javascript
   // Middleware de autenticación
   router.get('/items/new', ensureAuth, ctrlItems.newItemGet);
   router.get('/me/items', ensureAuth, ctrlDashboard.myItems);
   ```

**Flujo de Autenticación:**
```
Usuario → Formulario Login → POST /auth/login → API Valida → 
Crear Sesión → req.session.user → Redirigir a Dashboard
```

**Datos Almacenados en Sesión:**
- `id`: MongoDB ObjectId del usuario
- `userid`: ID numérico incremental
- `name`: Nombre del usuario
- `email`: Email institucional

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT BROWSER                     │
│            (HTML/CSS/JS - Pug Templates)            │
└─────────────────────┬───────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────┐
│                  APP_SERVER                          │
│           (Presentation Layer - MVC)                 │
│  ┌─────────────────────────────────────────────┐   │
│  │  Controllers: admin.js, items.js, auth.js   │   │
│  │  Views: Pug Templates (.pug files)          │   │
│  │  Routes: /items, /admin, /auth              │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP (Axios)
                      ↓
┌─────────────────────────────────────────────────────┐
│                   APP_API                            │
│              (Business Logic Layer)                  │
│  ┌─────────────────────────────────────────────┐   │
│  │  Controllers: CRUD operations               │   │
│  │  Routes: /api/items, /api/users, etc.       │   │
│  │  Models: Mongoose schemas & validation      │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────┘
                      │ Mongoose ODM
                      ↓
┌─────────────────────────────────────────────────────┐
│              MONGODB ATLAS (Cloud)                   │
│        Collections: users, items, reviews...         │
└─────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Backend
- **Node.js 22.18.0** - JavaScript runtime
- **Express 5.1.0** - Web application framework
- **Mongoose 8.18.0** - MongoDB ODM
- **Axios 1.13.1** - HTTP client (modern, promise-based)

### Frontend
- **Pug 3.0.3** - Template engine
- **Bootstrap 5** - CSS framework
- **Vanilla JavaScript** - Client-side interactions

### Database
- **MongoDB Atlas** - Cloud-hosted NoSQL database

### Deployment
- **Vercel** - Serverless platform (auto-deploy from GitHub)
- **GitHub** - Version control & CI/CD

---

## 🎨 MVC Pattern Implementation

### **Strict Separation of Concerns**

#### 1️⃣ **Model** (`app_api/models/`)
- Mongoose schemas define data structure
- Validation rules and constraints
- Database connection logic

```javascript
// schema-items.js
const itemsSchema = new mongoose.Schema({
    itemId: { type: Number, required: true, unique: true },
    title: { type: String, required: true, maxLength: 100 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'] },
    // ... more fields
});
```

---

## 🎨 MVC Pattern (Continued)

#### 2️⃣ **Controller** (`app_api/controllers/` + `app_server/controllers/`)

**API Controllers** - Business logic & database operations:
```javascript
// app_api/controllers/items.js
const itemsCreate = async (req, res) => {
    try {
        const Item = mongoose.model('item');
        const lastItem = await Item.findOne().sort({ itemId: -1 });
        const newItemId = lastItem ? lastItem.itemId + 1 : 1;
        
        const item = new Item({ ...req.body, itemId: newItemId });
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
```

**Server Controllers** - Render views & handle HTTP:
```javascript
// app_server/controllers/items.js
const newItemPost = async (req, res) => {
    try {
        await axios.post(apiUrl, formData);
        res.redirect('/items/success');
    } catch (err) {
        res.render('items/new', { error: 'Failed to create item' });
    }
};
```

---

## 🎨 MVC Pattern (Continued)

#### 3️⃣ **View** (`app_server/views/`)

Pug templates for server-side rendering:

```pug
//- items/index.pug
extends ../layout

block content
  h1.text-center Items Marketplace
  .row
    each item in items
      .col-md-4.mb-4
        .card
          img.card-img-top(src=item.image, alt=item.title)
          .card-body
            h5.card-title= item.title
            p.card-text= `$${item.price}`
            p.text-muted= item.category
            a.btn.btn-primary(href=`/items/${item._id}`) View Details
```

---

## 🗄️ Database Design

### 9 MongoDB Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| **users** | User accounts | userid, email, password, userType, rating |
| **items** | Product listings | itemId, title, price, sellerId, category |
| **reviews** | User ratings | reviewId, rating (1-5), comment, reviewerId |
| **categories** | Item categories | categoryId, name, description |
| **orders** | Purchase records | orderId, buyerId, sellerId, items[], totalAmount |
| **messages** | User chat | messageId, senderId, receiverId, content |
| **watchlist** | Saved items | watchlistId, userId, itemIds[] |
| **paymentMethods** | Payment info | paymentMethodId, userId, type, cardDetails |
| **notifications** | User alerts | notificationId, userId, message, isRead |

---

## 🗄️ Database Design (Schema Example)

### Users Collection Schema

```javascript
const usersSchema = new mongoose.Schema({
    userid: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { 
        type: String, 
        enum: ['Buyer', 'Seller', 'Both'], 
        default: 'Both' 
    },
    rating: {
        average: { type: Number, min: 0, max: 5, default: 0 },
        totalReviews: { type: Number, default: 0 }
    },
    address: { type: String },
    city: { type: String },
    phone: { type: Number },
    age: { type: Number, min: 18, max: 100 },
    isVerified: { type: Boolean, default: false },
    created: { type: Date, default: Date.now }
});
```

**Validation Features:**
- Required fields
- Unique constraints
- Data type enforcement
- Min/max values
- Enum options
- Default values

---

## 🔌 REST API Endpoints

### Complete RESTful Architecture

#### Items Endpoints
```javascript
POST   /api/items              // Create new item
GET    /api/items              // List all items (with pagination)
GET    /api/items/:itemId      // Get single item
PUT    /api/items/:itemId      // Update item
DELETE /api/items/:itemId      // Delete item
```

#### Reviews Endpoints
```javascript
POST   /api/reviews            // Create review
GET    /api/reviews            // List all reviews
GET    /api/reviews/:reviewId  // Get single review
PUT    /api/reviews/:reviewId  // Update review
DELETE /api/reviews/:reviewId  // Delete review
```

**Similar patterns for:**
- Users (`/api/users`)
- Categories (`/api/categories`)
- Orders (`/api/orders`)
- Messages (`/api/messages`)
- Watchlist (`/api/watchlist`)
- Payment Methods (`/api/payment-methods`)
- Notifications (`/api/notifications`)

---

## 🔌 REST API (Implementation Details)

### Example: Items CRUD Controller

```javascript
// app_api/controllers/items.js

// CREATE - Generate auto-incrementing ID
const itemsCreate = async (req, res) => {
    try {
        const Item = mongoose.model('item');
        const lastItem = await Item.findOne().sort({ itemId: -1 });
        const newItemId = lastItem ? lastItem.itemId + 1 : 1;
        
        const item = new Item({
            ...req.body,
            itemId: newItemId,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        const savedItem = await item.save();
        console.log('Item created successfully:', savedItem.itemId);
        res.status(201).json(savedItem);
    } catch (err) {
        console.error('Error creating item:', err.message);
        res.status(400).json({ message: err.message });
    }
};

// READ ONE
const itemsReadOne = async (req, res) => {
    try {
        const Item = mongoose.model('item');
        const item = await Item.findOne({ itemId: req.params.itemId });
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
```

---

## 🌐 Frontend Integration

### How App_Server Communicates with App_API

#### Before (Deprecated 'request' package):
```javascript
// ❌ Old callback-based approach
request.post({
    url: apiUrl,
    json: true,
    body: formData
}, (err, response, body) => {
    if (err) {
        return res.status(500).render('error');
    }
    // Callback hell...
});
```

#### After (Modern 'axios' package):
```javascript
// ✅ Modern async/await approach
const newItemPost = async (req, res) => {
    const apiUrl = `${apiOptions.server}/api/items`;
    
    try {
        const response = await axios.post(apiUrl, req.body);
        res.redirect('/items/success');
    } catch (err) {
        console.error('Error:', err.message);
        const errorMessage = err.response?.data?.message || 'Failed to create item';
        res.status(err.response?.status || 500).render('items/new', {
            title: 'Create New Item',
            error: errorMessage
        });
    }
};
```

**Benefits:** Cleaner code, better error handling, modern JavaScript

---

## 🎯 Key Features

### 1. Admin Dashboard
- View all items in table format
- Delete items with confirmation
- Responsive Bootstrap design

```pug
//- admin-dashboard.pug
table.table
  thead
    tr
      th Título
      th Precio
      th Categoría
      th Estado
      th Acciones
  tbody
    each item in items
      tr
        td #{item.title}
        td $#{item.price}
        td #{item.category}
        td #{item.condition}
        td
          form(method="post", action=`/admin/items/${item._id}/delete`)
            button.btn.btn-danger(type="submit") Eliminar
```

---

## 🎯 Key Features (Continued)

### 2. Item Creation Form
- Multi-field form validation
- Image URL support
- Category selection
- Condition dropdown

### 3. Reviews System
- 5-star rating
- Text comments
- Linked to users and items
- Average rating calculation

### 4. Debug Editor
- Developer tool for testing API
- Create categories and reviews
- Direct API interaction via fetch
- Real-time validation feedback

---

## 🔧 Code Highlights

### 1. Auto-Incrementing IDs

MongoDB doesn't auto-increment, so we implement it:

```javascript
const lastItem = await Item.findOne().sort({ itemId: -1 });
const newItemId = lastItem ? lastItem.itemId + 1 : 1;
```

### 2. Error Handling Pattern

Consistent error handling across all controllers:

```javascript
try {
    // Database operation
    const result = await Model.findOne({ id: req.params.id });
    if (!result) {
        return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(result);
} catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: err.message });
}
```

### 3. Mongoose Model Access

Use `mongoose.model()` instead of requiring schemas:

```javascript
// ✅ Correct - Access registered model
const Item = mongoose.model('item');
const item = await Item.findOne({ itemId: 123 });

// ❌ Wrong - Direct schema import
const Item = require('../models/schema-items');
```

---

## 🔧 Code Highlights (Continued)

### 4. Request/Response Flow

Complete flow from browser to database:

```
1. User submits form → POST /items/new
                         ↓
2. app_server/controllers/items.js (newItemPost)
   - Validates form data
   - Makes HTTP request via axios
                         ↓
3. axios.post('http://localhost:3000/api/items', formData)
                         ↓
4. app_api/routes/index.js routes to controller
                         ↓
5. app_api/controllers/items.js (itemsCreate)
   - Generates itemId
   - Creates Mongoose model instance
   - Validates against schema
                         ↓
6. item.save() → MongoDB Atlas
                         ↓
7. Success response → Redirect to /items/success
```

---

## 🔧 Code Highlights (Continued)

### 5. Environment-Aware Configuration

Different API URLs for development vs production:

```javascript
// app_server/controllers/items.js
let apiOptions = {
    server: 'http://localhost:3000'
};

if (process.env.NODE_ENV === 'production') {
    apiOptions.server = 'https://your-app.vercel.app';
}

const apiUrl = `${apiOptions.server}/api/items`;
```

### 6. Pagination Support

API supports pagination for large datasets:

```javascript
const itemsList = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    
    const items = await Item.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    
    res.json(items);
};
```

Usage: `GET /api/items?limit=20&skip=0`

---

## 🚀 Deployment Architecture

### Vercel Configuration

```json
{
  "version": 2,
  "builds": [
    { "src": "app.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "app.js" }
  ]
}
```

### Deployment Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   GitHub    │  push   │   Vercel    │  build  │   Deploy    │
│  Repository │────────>│   Platform  │────────>│   Live App  │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ↓ connects to
                        ┌─────────────┐
                        │  MongoDB    │
                        │   Atlas     │
                        └─────────────┘
```

**Features:**
- Auto-deploy on git push
- Environment variables for secrets
- Serverless functions
- Global CDN
- Zero configuration

---

## 📊 Project Statistics

### Code Metrics
- **Total Files:** 50+
- **Lines of Code:** ~2,500
- **Controllers:** 10 API + 3 Server
- **Routes:** 40+ endpoints
- **Models:** 9 schemas
- **Views:** 10+ Pug templates

### Dependencies
- **Production:** 9 packages
- **Zero vulnerabilities** (after axios migration)
- **Bundle size:** Optimized with modern packages

### Migration Achievement
- Removed **43 deprecated packages**
- Reduced code by **371 lines** (-68%)
- Fixed **3 security vulnerabilities**
- Modernized to **async/await** pattern

---

## ✅ Best Practices Implemented

### 1. **Separation of Concerns**
- API layer completely separate from presentation
- No direct database access in app_server
- Clean MVC architecture

### 2. **Modern JavaScript**
- Async/await instead of callbacks
- ES6+ features (destructuring, arrow functions)
- Promise-based HTTP with axios

### 3. **Error Handling**
- Try-catch blocks in all async functions
- Meaningful error messages
- Proper HTTP status codes

### 4. **Security**
- Input validation via Mongoose schemas
- No deprecated packages
- Environment variables for sensitive data

### 5. **Code Quality**
- Consistent naming conventions
- Detailed console logging
- Modular structure

---

## 🎓 Key Learnings

### Technical Skills
✅ Building RESTful APIs with Express  
✅ MongoDB/Mongoose ODM integration  
✅ MVC architecture implementation  
✅ Server-side rendering with Pug  
✅ Deployment to cloud platforms  
✅ Dependency management & modernization  

### Development Practices
✅ Version control with Git  
✅ Environment-based configuration  
✅ Error handling patterns  
✅ API documentation  
✅ Testing with debug tools  

### Problem Solving
✅ Debugging production errors  
✅ Migrating deprecated packages  
✅ Optimizing database queries  
✅ Implementing auto-incrementing IDs  

---

## 🔮 Future Enhancements

### Short Term
- [ ] Implement user authentication (sessions/cookies)
- [ ] Complete remaining CRUD operations
- [ ] Add search and filter functionality
- [ ] Image upload with cloud storage

### Medium Term
- [ ] Real-time messaging with WebSockets
- [ ] Email notifications
- [ ] Payment integration (Stripe/PayPal)
- [ ] User dashboard with analytics

### Long Term
- [ ] Mobile app (React Native)
- [ ] Admin analytics dashboard
- [ ] AI-powered recommendations
- [ ] Multi-language support

---

## 📝 Project Structure Summary

```
rest-api-deber2/
├── app.js                      # Main application entry
├── package.json                # Dependencies & scripts
├── vercel.json                 # Deployment config
│
├── app_api/                    # Business Logic Layer
│   ├── models/                 # Mongoose schemas
│   │   ├── db.js              # MongoDB connection
│   │   ├── schema-users.js
│   │   ├── schema-items.js
│   │   └── ... (9 total)
│   ├── controllers/            # CRUD operations
│   │   ├── users.js
│   │   ├── items.js
│   │   ├── reviews.js
│   │   └── ... (10 total)
│   └── routes/
│       └── index.js           # API route definitions
│
├── app_server/                 # Presentation Layer
│   ├── controllers/            # Request handlers
│   │   ├── admin.js
│   │   ├── items.js
│   │   └── auth.js
│   ├── routes/                 # Frontend routes
│   │   ├── index.js
│   │   ├── items.js
│   │   └── admin.js
│   └── views/                  # Pug templates
│       ├── layout.pug
│       ├── admin-dashboard.pug
│       ├── debug-editor.pug
│       └── items/
│           ├── index.pug
│           └── new.pug
│
├── public/                     # Static assets
│   ├── stylesheets/
│   │   └── style.css
│   └── javascripts/
│
└── scripts/
    └── seed.js                # Database seeding script
```

---

## 🎬 Demo: Creating an Item

### Step-by-Step Flow

1. **User navigates to** `/items/new`
2. **Fills form** with title, price, description, category, condition, image URL
3. **Submits form** → POST `/items/new`
4. **Server controller** validates and forwards to API
5. **API controller** generates itemId, creates model
6. **Mongoose validates** against schema
7. **Saves to MongoDB** Atlas
8. **Returns success** → Redirects to `/items/success`
9. **User sees confirmation** page

### Live Example

```javascript
// Input data
{
  title: "iPhone 14 Pro",
  price: 999,
  description: "Like new, 256GB, Space Black",
  category: "Electronics",
  condition: "Like New",
  image: "https://example.com/iphone.jpg",
  sellerId: 123
}

// Generated in database
{
  _id: "674abc123def...",
  itemId: 42,  // Auto-incremented
  title: "iPhone 14 Pro",
  price: 999,
  // ... other fields
  createdAt: "2025-11-12T10:30:00.000Z",
  updatedAt: "2025-11-12T10:30:00.000Z"
}
```

---

## 💡 Why This Architecture?

### Advantages of MVC + REST API

#### **Scalability**
- Frontend and backend can scale independently
- Multiple frontends can consume same API (web, mobile, desktop)

#### **Maintainability**
- Clear separation makes debugging easier
- Changes in one layer don't affect others
- Team can work on different layers simultaneously

#### **Reusability**
- API can be used by multiple clients
- Business logic is centralized
- DRY principle (Don't Repeat Yourself)

#### **Testing**
- Each layer can be tested independently
- API can be tested with tools like Postman
- Easier to write unit and integration tests

#### **Security**
- API can implement authentication/authorization
- Validation happens in one place
- Easier to secure a single API than multiple endpoints

---

## 🎯 Request vs Axios: Migration Impact

### Why We Migrated

| Aspect | Request (Old) | Axios (New) |
|--------|---------------|-------------|
| Status | ❌ Deprecated since 2020 | ✅ Actively maintained |
| API Style | Callbacks (pyramid of doom) | Promises/async-await |
| JSON | Manual (`json: true` flag) | Automatic |
| Errors | Mixed with success | Automatic error throwing |
| Bundle | 43 dependencies | 7 dependencies |
| Security | 3 vulnerabilities | 0 vulnerabilities |
| Code | 544 lines | 173 lines (-68%) |

### Impact on Code Quality

**Before:**
```javascript
request.post({url, json: true, body}, (err, response, body) => {
    if (err) {
        return callback(err);
    }
    if (response.statusCode === 201) {
        callback(null, body);
    } else {
        callback(new Error(body.message));
    }
});
```

**After:**
```javascript
try {
    const response = await axios.post(url, body);
    return response.data;
} catch (err) {
    throw new Error(err.response?.data?.message);
}
```

**Result:** Cleaner, safer, more maintainable code

---

## 📚 Technologies Deep Dive

### Express 5.1.0
- Latest version with performance improvements
- Better error handling
- Router enhancements
- Async/await support

### Mongoose 8.18.0
- Schema-based modeling
- Built-in validation
- Query builders
- Middleware (hooks)
- TypeScript support

### MongoDB Atlas
- Cloud-hosted database
- Automatic backups
- Scalability
- Security features
- Free tier for development

### Vercel
- Serverless deployment
- Auto-scaling
- Edge network
- Git integration
- Environment variables
- Zero configuration

---

## 🎓 Conclusion

### What We Built
A **production-ready marketplace application** with:
- Clean MVC architecture
- RESTful API design
- Modern JavaScript practices
- Secure, scalable deployment
- Comprehensive CRUD operations

### Technical Achievements
✅ 40+ API endpoints  
✅ 9 interconnected collections  
✅ Modern dependency stack  
✅ Zero security vulnerabilities  
✅ Deployed on Vercel with CI/CD  

### Skills Demonstrated
- Full-stack development
- Database design
- API architecture
- Deployment strategies
- Code modernization
- Problem-solving

---

## ❓ Q&A

### Common Questions

**Q: Why separate app_api and app_server?**  
A: Clean separation of concerns, scalability, and reusability

**Q: Why MongoDB instead of SQL?**  
A: Flexible schema, easy to scale, great for marketplace data

**Q: How do you handle authentication?**  
A: Planned: Express sessions + cookies (not yet implemented)

**Q: Can this handle high traffic?**  
A: Yes, Vercel auto-scales and MongoDB Atlas supports clustering

**Q: Is the code open source?**  
A: GitHub repo: Polkka1/ProyectoWeb3

---

## 📬 Contact & Resources

### Links
- **GitHub:** [Polkka1/ProyectoWeb3](https://github.com/Polkka1/ProyectoWeb3)
- **Live Demo:** Deployed on Vercel
- **Documentation:** README.md in repository

### Technologies
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Vercel](https://vercel.com/)
- [Axios](https://axios-http.com/)

### Learning Resources
- [RESTful API Design](https://restfulapi.net/)
- [MVC Pattern](https://developer.mozilla.org/en-US/docs/Glossary/MVC)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)

---

## 🙏 Thank You!

### Questions?

**Contact:** Nikolai Enriquez  
**Project:** Marketplace REST API  
**Course:** Desarrollo Web 3  
**Semester:** Primer Semestre 2025-2026

**Next Steps:**
- Implement authentication system
- Complete all CRUD operations
- Add search functionality
- Mobile app development

---

# End of Presentation

*Thank you for your attention!*
