# Vercel Deployment Troubleshooting Guide

## 🔴 Current Error
```
500: INTERNAL_SERVER_ERROR
Code: FUNCTION_INVOCATION_FAILED
```

## ✅ Fixes Applied

### 1. **Multer/File Upload Compatibility**
- **Problem**: Vercel has read-only filesystem, multer crashes on `fs.mkdirSync()`
- **Solution**: Detect Vercel environment and use memory storage instead
- **Impact**: File uploads disabled on Vercel (URLs still work)

### 2. **Environment-Aware Image Handling**
- Controllers now check `process.env.VERCEL === '1'`
- On Vercel: Only URL-based images allowed
- Locally: Both file uploads and URLs work

## 📋 Required: Add Environment Variables to Vercel

**CRITICAL**: You must add these in Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```bash
# Required
MONGODB_URI=mongodb+srv://nik95kk_db_user:J5RcSnrLYudtBYGd@cluster0.2bjg8ei.mongodb.net/?appName=Cluster0

# Required for sessions
SESSION_SECRET=your-strong-random-secret-here-min-32-chars

# Optional but recommended
NODE_ENV=production
```

**Important**: Use a different `SESSION_SECRET` for production (not the same as local)

## 🔍 How to Check Logs

### Method 1: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to **Deployments** tab
4. Click the failed deployment
5. Click **Functions** → Select function → **View Logs**

### Method 2: Vercel CLI
```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs [your-project-url]
```

## 🚀 Deployment Steps

### 1. Commit and Push Changes
```bash
git add .
git commit -m "Fix: Vercel compatibility - disable file uploads on serverless"
git push origin main
```

### 2. Vercel Will Auto-Deploy
- Vercel automatically redeploys on git push
- Check deployment status in dashboard

### 3. If Manual Deploy Needed
```bash
vercel --prod
```

## ⚠️ Known Limitations on Vercel

### File Uploads
- ❌ **Not supported**: Direct file uploads to filesystem
- ✅ **Alternative**: Use Cloudinary, AWS S3, or similar
- ✅ **Current**: URL-based images work fine

### Sessions
- ⚠️ **Works but**: MongoDB session store required (already configured)
- ❌ **Won't work**: Memory sessions (lose state between requests)

### Static Files
- ✅ **Works**: Files in `public/` folder
- ❌ **Won't work**: Dynamically created files

## 🎯 Next Steps After Deployment

### If Still Getting Errors:

1. **Check MongoDB Connection**
   ```bash
   # Test connection from Vercel's IP
   # Your MongoDB Atlas should allow connections from anywhere (0.0.0.0/0)
   ```

2. **Check Build Logs**
   - Look for module import errors
   - Check for missing dependencies

3. **Common Issues**
   ```javascript
   // ❌ Bad: Absolute paths
   require('/Users/you/project/file')
   
   // ✅ Good: Relative paths
   require('./file')
   ```

4. **Verify vercel.json**
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

## 🔮 Future: Add Cloud Storage

To re-enable file uploads on Vercel:

### Option 1: Cloudinary (Easiest)
```bash
npm install cloudinary multer-storage-cloudinary
```

### Option 2: AWS S3
```bash
npm install aws-sdk multer-s3
```

### Option 3: Vercel Blob Storage
```bash
npm install @vercel/blob
```

See `docs/CLOUD_STORAGE_MIGRATION.md` (coming soon)

## 📊 Checklist

- [x] Fixed multer configuration for Vercel
- [x] Updated controllers to handle Vercel environment
- [ ] Add environment variables in Vercel Dashboard
- [ ] Commit and push changes
- [ ] Check new deployment logs
- [ ] Test app on production URL
- [ ] Verify MongoDB connection works
- [ ] Test creating items (with URLs only)
- [ ] Test messaging system
- [ ] Test authentication/sessions

## 🆘 Still Not Working?

If after these fixes you still get errors:

1. **Share the logs**: Copy full error from Vercel logs
2. **Check specific error**: Look for:
   - Module not found
   - Connection refused (MongoDB)
   - Environment variable missing
   - Syntax errors

3. **Test locally first**:
   ```bash
   # Simulate Vercel environment
   VERCEL=1 npm start
   ```

4. **Rollback if needed**:
   ```bash
   # In Vercel Dashboard → Deployments → Previous deployment → Promote to Production
   ```

## 📞 MongoDB Atlas Configuration

Ensure your MongoDB allows Vercel connections:

1. MongoDB Atlas Dashboard
2. Network Access → Add IP Address
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Or add Vercel's IP ranges (check Vercel docs)

---

**After applying fixes**, redeploy and check logs again!
