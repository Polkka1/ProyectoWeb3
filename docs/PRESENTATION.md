---
marp: true
theme: default
paginate: true
backgroundColor: #fff
backgroundImage: url('https://marp.app/assets/hero-background.svg')
style: |
  section {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  h1 {
    color: #2563eb;
  }
  h2 {
    color: #1e40af;
  }
  .columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
---

# CampusSwap - Project Update
## Recent Implementations & Future Roadmap

**Development Team**
November 2025

---

# 📨 Messaging System
## Complete In-App Communication

### ✅ Implemented Features
- **Conversation Threads**: Deterministic conversation IDs (min-max user IDs)
- **Real-time Unread Badges**: Dynamic count in navigation bar
- **Security**: Session-based authentication, access control validation
- **Message Context**: Auto-fill from item contact (seller info, item reference)
- **User Privacy**: Cookie forwarding, no URL parameter exploitation

### Technical Stack
- MongoDB conversation tracking
- Express sessions with participant verification
- Axios for server-to-API communication
- Pug templates with chat UI

---

# 📨 Messaging System (cont.)
## User Experience Highlights

### Key Features
```
├── Message List View
│   ├── Conversation previews with last message
│   ├── Unread indicators
│   └── Timestamp formatting
├── Conversation Detail
│   ├── Full message thread (chat layout)
│   ├── Sender/receiver color differentiation
│   └── Real-time reply form
└── Contact Integration
    ├── "Enviar Mensaje" from item detail
    ├── WhatsApp alternative button
    └── Contact click tracking
```

**Impact**: Users can now communicate safely without sharing personal contact info

---

# 🖼️ Image Upload System
## Direct File Upload Capability

### ✅ Implemented Features
- **Multi-source Support**: Upload files OR URLs OR both
- **Real-time Preview**: Thumbnail display before submission
- **Validation**: 5MB limit, image types only (JPEG, PNG, GIF, WEBP)
- **Security**: MIME type checking, filename sanitization
- **Scalability**: Up to 5 images per item

### Technical Implementation
- **Backend**: Multer middleware with disk storage
- **Frontend**: FormData submission, FileReader API
- **Storage**: `public/uploads/items/` with unique filenames
- **Backwards Compatible**: Existing URL-based items still work

---

# 🔮 Next Implementation: Review System
## Building Trust Through Transparency

### Planned Features
- **User Reviews**: Rate sellers after purchase (1-5 stars)
- **Review Display**: Average rating on profile & item pages
- **Review Management**: Edit/delete own reviews
- **Trust Metrics**: Total reviews count, rating distribution
- **Verification**: Only buyers who completed transactions can review

### Technical Approach
```javascript
Schema: reviews
├── reviewId (unique)
├── reviewerId (buyer)
├── reviewedUserId (seller)
├── orderId (transaction reference)
├── rating (1-5)
├── comment (optional text)
└── created timestamp
```

---

# 🚀 Future Roadmap
## Payment Integration & Design Overhaul

### 💳 Payment System (Phase 2)
- Payment gateway integration (Stripe/PayPal)
- Secure checkout flow
- Order tracking & history
- Transaction verification

### 🎨 Design Overhaul (Phase 3)
- **Frontend Migration**: React.js with modern UI components
- **Visual Identity**: Professional branding, logo design
- **Responsive Design**: Mobile-first approach
- **Performance**: SPA architecture, lazy loading
- **Component Library**: Reusable UI components (Tailwind CSS/Material-UI)

**Timeline**: Reviews (2 weeks) → Payments (3 weeks) → React Migration (4-6 weeks)

---

# 📊 Project Status Summary

### ✅ Completed
- User Authentication & Sessions
- Item CRUD with search/filters
- **Messaging System** (NEW)
- **Image Upload** (NEW)
- Dashboard & User Management
- Contact Click Tracking

### 🔄 In Progress
- Edit item functionality
- Review system design

### 📋 Planned
- Review & Rating System
- Payment Integration
- React Frontend Migration
- Visual Identity & Branding
- Email Notifications
- Advanced Search & Filters

**Current Status**: Core marketplace features complete, moving to trust & payment features
