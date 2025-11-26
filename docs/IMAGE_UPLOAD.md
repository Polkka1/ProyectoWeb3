# Image Upload Feature

## Overview
The application now supports uploading images directly from your device when creating or editing items, in addition to the existing URL-based image system.

## Features
- Upload up to 5 images per item
- Supported formats: JPEG, JPG, PNG, GIF, WEBP
- Maximum file size: 5MB per image
- Image preview before submission
- Can combine uploaded files with URLs
- Automatic filename sanitization

## How It Works

### Backend (API)
1. **Multer Configuration** (`app_api/config/upload.js`)
   - Storage: Files saved to `public/uploads/items/`
   - Filename format: `originalname-timestamp-random.ext`
   - File validation: Only images allowed
   - Size limit: 5MB per file

2. **Controller Updates** (`app_api/controllers/items.js`)
   - `itemsCreate`: Accepts both `req.files` (uploaded) and `images` field (URLs)
   - `itemsUpdateOne`: Same dual support
   - Images stored as paths: `/uploads/items/filename.jpg`

3. **Routes** (`app_api/routes/index.js`)
   - POST `/api/items`: Uses `upload.array('images', 5)` middleware
   - PUT `/api/items/:itemId`: Same middleware for updates

### Frontend (Views)
1. **Form Updates** (`app_server/views/items/new.pug`)
   - Added `enctype="multipart/form-data"` to form
   - File input with multiple selection
   - Real-time image preview
   - Optional URL inputs for backwards compatibility

2. **JavaScript Enhancements**
   - File preview using FileReader API
   - FormData submission instead of JSON
   - Client-side validation for file count
   - Visual feedback with thumbnails

## File Structure
```
public/
  uploads/
    items/
      product-image-1234567890-123456789.jpg
      laptop-photo-1234567891-987654321.png
```

## Security Considerations
- File type validation (only images)
- Size limits enforced
- Filename sanitization (prevents path traversal)
- `.gitignore` configured to exclude uploads directory
- MIME type checking in addition to extension validation

## Usage Example

### Creating Item with Images
```javascript
// Frontend (FormData)
const formData = new FormData();
formData.append('title', 'MacBook Pro');
formData.append('description', 'Great condition laptop');
formData.append('price', 1200);
formData.append('category', 'Tecnología');
formData.append('condition', 'Como nuevo');
formData.append('quantity', 1);
formData.append('whatsapp', '987654321');

// Add uploaded files
const files = document.getElementById('imageFiles').files;
Array.from(files).forEach(file => {
  formData.append('images', file);
});

// Add optional URLs
formData.append('images', 'https://example.com/extra-image.jpg');

fetch('/api/items', {
  method: 'POST',
  body: formData
});
```

### API Response
```json
{
  "status": "success",
  "message": "Item creado exitosamente.",
  "item": {
    "id": "507f1f77bcf86cd799439011",
    "itemId": 100001,
    "title": "MacBook Pro",
    "price": 1200,
    "category": "Tecnología",
    "condition": "Como nuevo"
  }
}
```

## Deployment Notes

### Production Considerations
1. **Storage**: Current implementation uses local filesystem
   - For cloud deployment (Vercel, Heroku), consider:
     - AWS S3
     - Cloudinary
     - Google Cloud Storage

2. **Environment Variables**
   ```bash
   UPLOAD_DIR=/path/to/uploads
   MAX_FILE_SIZE=5242880  # 5MB in bytes
   ```

3. **Image Processing**
   - Consider adding image optimization (sharp, jimp)
   - Generate thumbnails for performance
   - Convert to optimized formats (webp)

### Migration from URL-only
- No breaking changes required
- Old items with URLs continue working
- New items can use files, URLs, or both
- Mixed approach supported

## Error Handling

### Common Errors
1. **File too large**
   ```json
   {
     "status": "error",
     "message": "File too large"
   }
   ```

2. **Invalid file type**
   ```json
   {
     "status": "error",
     "message": "Solo se permiten imágenes (jpeg, jpg, png, gif, webp)"
   }
   ```

3. **No images provided**
   ```json
   {
     "status": "error",
     "message": "Agrega al menos una imagen (archivo o URL)"
   }
   ```

## Testing

### Manual Testing
1. Navigate to `/items/new`
2. Fill item details
3. Upload images using file picker
4. Verify preview shows correctly
5. Submit form
6. Check item detail page shows uploaded images
7. Verify files exist in `public/uploads/items/`

### Curl Testing
```bash
# Create item with file upload
curl -X POST http://localhost:3000/api/items \
  -H "Cookie: campuswap.sid=your-session-id" \
  -F "title=Test Item" \
  -F "description=Test description here" \
  -F "price=100" \
  -F "category=Tecnología" \
  -F "condition=Nuevo" \
  -F "quantity=1" \
  -F "whatsapp=987654321" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

## Future Enhancements
- [ ] Image compression before upload
- [ ] Drag-and-drop interface
- [ ] Image cropping/editing
- [ ] Multiple image deletion in edit mode
- [ ] Image reordering
- [ ] Cloud storage integration (S3, Cloudinary)
- [ ] CDN integration for faster delivery
- [ ] Image lazy loading
- [ ] Progressive image loading
- [ ] Automatic thumbnail generation
