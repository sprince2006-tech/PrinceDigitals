# 👑 Prince Digital — Full-Stack Instagram Bio Link Catalog

Prince Digital is a modern, production-ready, mobile-first product catalog designed specifically for Instagram bio link traffic. It empowers administrators to curate luxury product collections, upload cover images, add products with shopping links, and allow Instagram visitors to seamlessly browse collections and tap **Open** to visit external e-commerce destinations.

---

## 🏗️ Architecture & Technology Stack

The application is built using the **MERN** stack with independent frontend and backend deployments:

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Lucide Icons
- **Backend**: Node.js, Express.js (v4), Mongoose (v8)
- **Database**: MongoDB Atlas
- **Permanent Image Storage**: Cloudinary (in-memory buffer uploads, zero local disk dependency)
- **Authentication**: Google OAuth 2.0 (restricted to designated `ADMIN_EMAIL`) + Admin username/password (bcrypt hashing)
- **Session Security**: HTTP-only SameSite cookies + Bearer token fallback for cross-domain mobile support
- **Hosting Targets**:
  - **Frontend**: Vercel (with SPA route rewrite configuration)
  - **Backend**: Render (Web Service with `/health` check and production CORS)

---

## 📁 Project Directory Structure

```text
prince-digital/
├── backend/
│   ├── src/
│   │   ├── config/             # DB & Cloudinary configurations
│   │   ├── controllers/        # Public, Auth, and Admin controllers
│   │   ├── middleware/         # Auth, Upload (Multer memory), RateLimiter, ErrorHandler
│   │   ├── models/             # Mongoose schemas: Collection, Product
│   │   ├── routes/             # REST API routes (/api/v1)
│   │   ├── services/           # Cloudinary stream uploads & Auth token logic
│   │   ├── utils/              # URL validation, slug collision generator, password hasher
│   │   ├── app.js              # Express app setup (Helmet, CORS, cookie-parser)
│   │   └── server.js           # Server entry point & graceful shutdown
│   ├── test/                   # Automated API integration tests (node:test + mongodb-memory-server)
│   ├── .env.example            # Backend environment variables blueprint
│   ├── package.json
│   └── render.yaml             # Render deployment blueprint
├── frontend/
│   ├── src/
│   │   ├── components/         # Common, Public, and Admin UI components
│   │   ├── context/            # AuthContext (admin session management)
│   │   ├── pages/              # Public & Admin pages
│   │   ├── services/           # API client with credentials & Bearer fallback
│   │   ├── App.jsx             # React Router route definitions
│   │   ├── main.jsx            # Vite React entry point
│   │   └── index.css           # Tailwind base styles and luxury typography
│   ├── public/                 # Favicon and static brand assets
│   ├── .env.example            # Frontend environment variables template
│   ├── package.json
│   ├── tailwind.config.js      # Custom theme colors and letterspacing
│   ├── vite.config.js          # Vite configuration
│   └── vercel.json             # Vercel SPA rewrites config
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (>= 18.0.0)
- npm (>= 9.0.0)
- A free MongoDB Atlas cluster
- A free Cloudinary account
- A Google Cloud Console project (for Google OAuth)

---

### 2. Backend Setup

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Fill in the values in `.env`:
   - `PORT=5000`
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `SESSION_SECRET`: A secure random string (at least 32 characters).
   - `FRONTEND_URL=http://localhost:5173`
   - `BACKEND_URL=http://localhost:5000`
   - `ADMIN_EMAIL`: The Google account email authorized to log in.
   - `ADMIN_USERNAME`: Admin login username (e.g. `admin`).
   - `ADMIN_PASSWORD_HASH`: Generate using:
     ```bash
     npm run hash-password "YourChosenPassword123"
     ```
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: From your Cloudinary Dashboard.
5. Run the automated integration test suite:
   ```bash
   npm test
   ```
6. Start the backend in development mode:
   ```bash
   npm run dev
   ```
   The backend will start at `http://localhost:5000`. Test the health check at `http://localhost:5000/health`.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Verify `VITE_API_BASE_URL` is set to `http://localhost:5000/api/v1`.
5. Start the frontend development server:
   ```bash
   npm run dev
   ```
6. Visit `http://localhost:5173` in your browser.

---

## 🔒 Google OAuth 2.0 Configuration Guide

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **Prince Digital**.
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   - Choose **External**.
   - Fill in App Name (`Prince Digital`), User support email, and Developer email.
   - Add scopes: `.../auth/userinfo.email` and `.../auth/userinfo.profile`.
4. Navigate to **Credentials** > **Create Credentials** > **OAuth client ID**:
   - Application type: **Web application**.
   - Name: `Prince Digital Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
     - `https://your-frontend.vercel.app`
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/v1/auth/google/callback`
     - `https://your-backend.onrender.com/api/v1/auth/google/callback`
     *(Note: The callback MUST point to the Express backend endpoint, NOT the frontend URL).*
5. Copy the **Client ID** and **Client Secret** into your backend `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
6. Set `ADMIN_EMAIL` to your designated admin email. Any other Google user attempting to sign in will be rejected with `403 Forbidden`.

---

## ☁️ Cloudinary Configuration Guide

1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. From the Cloudinary Dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Paste them into your backend `.env`.
4. Uploaded images are streamed directly from RAM into:
   - `prince-digital/collections/`
   - `prince-digital/products/`
5. When collections or products are deleted or replaced, their corresponding Cloudinary assets are cleanly destroyed using Cloudinary's uploader API.

---

## 🚢 Render Backend Deployment Guide

1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your Git repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. In the **Environment Variables** tab, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `FRONTEND_URL`: `https://your-prince-digital.vercel.app`
   - `BACKEND_URL`: `https://your-prince-digital.onrender.com`
   - `SESSION_SECRET`: `<64-character random string>`
   - `GOOGLE_CLIENT_ID`: `<Your Google Client ID>`
   - `GOOGLE_CLIENT_SECRET`: `<Your Google Client Secret>`
   - `GOOGLE_CALLBACK_URL`: `https://your-prince-digital.onrender.com/api/v1/auth/google/callback`
   - `ADMIN_EMAIL`: `<Your Admin Email>`
   - `ADMIN_USERNAME`: `<Your Admin Username>`
   - `ADMIN_PASSWORD_HASH`: `<Generated Bcrypt Hash>`
   - `CLOUDINARY_CLOUD_NAME`: `<Cloud Name>`
   - `CLOUDINARY_API_KEY`: `<API Key>`
   - `CLOUDINARY_API_SECRET`: `<API Secret>`
   - `MAX_IMAGE_SIZE_MB`: `5`
   - `COOKIE_SAME_SITE`: `none`
   - `COOKIE_SECURE`: `true`
5. Click **Deploy Web Service**. Verify that `https://your-backend.onrender.com/health` returns `{"status":"healthy"}`.

---

## ⚡ Vercel Frontend Deployment Guide

1. Create a new Project on [Vercel](https://vercel.com/).
2. Import your Git repository.
3. Set the **Root Directory** to `frontend`.
4. Framework Preset: **Vite**.
5. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://your-prince-digital.onrender.com/api/v1`
6. Click **Deploy**.
7. The included `vercel.json` automatically provides SPA rewrites:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
   Directly refreshing `/collection/peak-formals` or `/admin/dashboard` will seamlessly route to `index.html`.

---

## 🧪 Comprehensive Verification Checklist

- [x] **Public Catalog Access**: Visitors can open `/` and browse published collections without logging in.
- [x] **Draft Hiding**: Unpublished collections and products are never returned to public visitors.
- [x] **Dynamic Collection Route**: Visitors can click into `/collection/:slug` to see products.
- [x] **Product External Links**: Clicking **Open** or tapping the product image opens the destination URL in a new tab with `rel="noopener noreferrer"`.
- [x] **URL Protocol Validation**: Invalid URLs (`javascript:`, `ftp://`) are rejected on submission.
- [x] **Admin Authorization**: Unauthenticated requests to `/admin/*` redirect to `/admin/login`.
- [x] **Google Allowlist Enforced**: Only the email configured in `ADMIN_EMAIL` can access the admin console.
- [x] **Password Login Protection**: Rate limited against brute-force attacks.
- [x] **Cloudinary In-Memory Upload**: Images never touch the local filesystem.
- [x] **Safe Image Replacement**: New asset is uploaded and saved to DB before old asset is deleted.
- [x] **Collection Deletion Cascade**: Removing a collection deletes associated products and triggers Cloudinary asset cleanup.
- [x] **Product Reordering**: Move up / move down controls immediately update order for public visitors.
- [x] **Vercel SPA Refresh**: Direct browser reload on collection details does not return a 404.
- [x] **Cross-Domain Session Reliability**: HTTP-only cookie + fallback authorization token ensures admin stays logged in across domains.
