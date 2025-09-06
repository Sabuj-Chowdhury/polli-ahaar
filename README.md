# পল্লী আহার — Polli Ahaar

A modern e-commerce web app for authentic Bangladeshi grocery items — honey, rice, ghee, spices & more. Built with React + Firebase Auth on the front, Express + MongoDB Atlas on the back, and wired together with React Query for a smooth, near real-time UX.

**Live:** https://polli-ahaar.web.app  
**Backend API base (client env):** `VITE_URL=https://polliaharbackend.vercel.app`

---

## 🧩 What’s inside (TL;DR)

- 🔐 **Auth:** Firebase (Email/Password + Google) + **JWT** for backend
- 🛒 **Cart & Orders:** variants, stock checks, place/update/cancel
- ⭐ **Reviews:** one review per delivered order, optional **anonymous**
- 📦 **Products:** variants, min price, stock, **orderCount** (auto-incremented)
- 🧑‍💼 **Admin:** role-based dashboard  
  – **Add/Manage/Delete products** ✅  
  – **Add/Manage/Delete orders** ✅  
  – Update order **status** (pending → processing → shipped → delivered → completed)  
  – Search, sort, filter, paginate
- 🖼️ **Image Upload:** via **imgbb API**, store hosted URL in DB
- 📊 **Analytics:** `/admin-stats` for revenue, trends, top products, status mix
- ⚡ **React Query** caching + targeted invalidation for instant UI refresh
- 🎨 **Tailwind**, **Framer Motion**, **Headless UI**, **Recharts**, **react-fast-marquee**
- 🔎 Powerful **product filtering** (category, brand, origin, unit, in-stock, price range, search)

---

## 🗃 Project Structure (high level)

```
client/
  src/
    components/
      navbar/
      orders/
      products/
      modal/
    hooks/          # useAuth, useAxiosSecure, useAxiosPublic, useAdmin, useCart
    pages/
      dashboard/
        admin/
        user/
    sections/       # e.g. ReviewsMarquee
    provider/
      AuthProvider.jsx
      CartProvider.jsx
    routes/
    context/
  .env              # VITE_* client vars

server/
  index.js          # single-file Express app (routes + middleware)
  .env              # ACCESS_TOKEN, DB_USER, DB_PASS, etc.
```

---

## 🌱 Environment Setup

### Frontend — `client/.env`

```env
# Backend API
VITE_URL=https://polliaharbackend.vercel.app

# Firebase (use your real credentials)
VITE_apiKey=YOUR_FIREBASE_API_KEY
VITE_authDomain=YOUR_FIREBASE_AUTH_DOMAIN
VITE_projectId=YOUR_FIREBASE_PROJECT_ID
VITE_storageBucket=YOUR_FIREBASE_STORAGE_BUCKET
VITE_messagingSenderId=YOUR_FIREBASE_SENDER_ID
VITE_appId=YOUR_FIREBASE_APP_ID

# Image hosting (imgbb)
VITE_IMGBB_KEY=YOUR_IMGBB_API_KEY
```

### Backend — `server/.env`

```env
PORT=5000
ACCESS_TOKEN=super_secret_jwt_key
DB_USER=YOUR_ATLAS_USER
DB_PASS=YOUR_ATLAS_PASS
```

---

## ▶️ Running Locally

```bash
# backend
cd server
npm i
npm run dev   # or: node index.js

# frontend
cd ../client
npm i
npm run dev
```

---

## 🔑 Auth & Tokens (flow)

1. User signs in via **Firebase** (email/password or Google).
2. `AuthProvider` observes auth state → saves/updates user in DB → requests **JWT** from `/jwt` and stores in `localStorage`.
3. `useAxiosSecure` automatically attaches `Authorization: Bearer <token>` for protected endpoints.

---

## 🔌 Core API Endpoints

> Base URL: `https://polliaharbackend.vercel.app` (set as `VITE_URL`)

### Auth / Users

- `POST /jwt` → `{ token }`
- `POST /users` → create if new
- `GET /user/:email` _(auth)_
- `GET /user/admin/:email` _(auth)_ → `{ admin: boolean }`
- `GET /users` _(admin)_ → paginated list, search & role filters
- `PUT /user/:id/role` _(admin)_

### Products

- `POST /add-product` _(admin)_
- `GET /products` → rich filters:  
  `search, category, status, featured, origin, brand, type, unit, inStock, minPrice, maxPrice, sort, page, limit`
- `PUT /product/:id` _(admin)_
- `DELETE /product/:id` _(auth)_

> When an order is placed, each product’s **\`orderCount\`** is auto-incremented by total qty; variant stock is decremented.

### Orders

- `POST /orders` _(auth)_ → items (name/label/imageUrl/price/qty) are **normalized**; totals computed server-side; **orderCount** & stock updated
- `GET /orders/my/:email` _(auth)_ → paginated
- `GET /orders/:id` _(auth)_
- `GET /orders` _(admin)_ → search + status + sort + pagination
- `PATCH /orders/:id` _(auth)_ → update shipping while pending
- `PATCH /orders/:id/cancel` _(auth)_ → only while pending
- `PATCH /orders/:id/status` _(admin)_ → `pending|processing|shipped|delivered|completed|cancelled`
- `DELETE /orders/:id` _(admin)_

### Reviews

- `POST /review` _(auth)_ → `{ orderId, userId, name, stars|rating, text, createdAt }`  
  Also sets `order.reviewed = true`.
- `GET /reviews` → list all reviews for homepage marquee

### Admin Analytics

- `GET /admin-stats` _(admin)_ → totals, revenue, status distribution, time series, top products
  ```json
  {
    "totals": { "users": 120, "products": 37, "orders": 260, "reviews": 58 },
    "revenue": { "allTime": 145600, "last30d": 18400 },
    "ordersByStatus": { "pending": 4, "processing": 2, "shipped": 1, "delivered": 8, "cancelled": 0, "completed": 16 },
    "revenueByMonth": [{ "month": "2025-05", "revenue": 21900 }, ...],
    "topProducts": [{ "_id": "...", "name": "মধু", "orderCount": 42, "minPrice": 480, "image": "..." }, ...]
  }
  ```

---

## 🧑‍💼 Admin Capabilities

- **Products**
  - ➕ Add (with image upload)
  - ✏️ Edit (details, variants, price, stock, featured)
  - 🗑️ Delete
- **Orders**
  - 🔎 Search, filter by status, paginate
  - 🔁 Update status: `pending → processing → shipped → delivered → completed`
  - 🛑 Cancel / 🗑️ Delete (with safeguards)
- **Analytics**
  - 📈 KPI cards & charts powered by `/admin-stats`
  - 🏆 Top ordered products (by `orderCount`)
  - 🔄 Trend lines for revenue & orders

---

## 🖼️ Image Upload with imgbb

We use **imgbb** to host product images from the client:

1. Get an API key from https://api.imgbb.com/
2. Put it in `client/.env` as `VITE_IMGBB_KEY`
3. Typical upload (client-side):

```js
const form = new FormData();
form.append("image", file); // a File/Blob from input

const res = await fetch(
  `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_KEY}`,
  { method: "POST", body: form }
);
const data = await res.json();
const imageUrl = data?.data?.url; // store this URL in your product payload
```

> The server stores this `imageUrl` alongside product info. When orders are placed, item snapshots keep the `imageUrl` for accurate history.

---

## 🧠 Frontend Patterns

- **React Query** for all server reads
  - cache lists with stable keys
  - **invalidate** after mutations (e.g., `["my-orders"]`, `["admin-orders"]`, `["order"]`, `["reviews"]`)
  - optional **refetch on focus** for natural freshness
- **Headless UI** for accessible modals (e.g., Review modal)
- **Recharts** for Analytics (Area, Bar, Pie/Radial)
- **Framer Motion** for subtle interaction polish
- **Navbar** ready-state handling: avoids flicker by waiting for JWT and role check

---

## 📈 Admin Analytics UI Idea

- **KPI Cards:** Total Revenue, Avg Order Value, Orders Today, New Users
- **Area Chart:** Revenue by month (from `revenueByMonth`)
- **Bar Chart:** Top products by `orderCount`
- **Pie / Radial:** Order distribution by status
- **Recent Activity:** Latest orders, latest reviews

---

## 🛡 Security Notes

- Protected endpoints require `Authorization: Bearer <JWT>`.
- Admin endpoints use **`verifyToken` + `verifyAdmin`**.
- Server recomputes order totals & adjusts stock — **never trust client prices**.
- Page size limits (`limit ≤ 100`) & query sanitization enabled.
- Avoid leaking sensitive fields (project/omit in queries).

---

## 🧪 Testing Tips

- Create an **admin** by setting `role: "admin"` in `users` collection.
- Place test orders; move to **delivered**; submit a **single review** per order.
- Confirm `orderCount` increments and variant stock decrements.
- Try product search & filters; verify analytics reflect your changes.

---

## 🛠 Scripts

**Frontend**

```bash
npm run dev       # local dev
npm run build     # production build
npm run preview   # serve build locally
```

**Backend**

```bash
npm run dev       # nodemon (if configured)
node index.js     # start server
```

---

## 🌐 Deployment

- **Frontend:** Firebase Hosting  
  `npm run build` → `firebase deploy`
- **Backend:** Vercel (Serverless)  
  Add env vars (`ACCESS_TOKEN`, `DB_USER`, `DB_PASS`) in Vercel → deploy  
  Expose the API base as `VITE_URL` on the client

---

## 🤝 Contributing

1. Fork & create a feature branch
2. Commit with clear messages
3. Open a PR — include screenshots for UI changes

---

## 📄 License

MIT — do what you like; attribution appreciated. 🙌

---

## 🙏 Credits

- Crafted with ❤️ for real Bangla food lovers
- Icons: `react-icons` • Animations: `framer-motion` • Charts: `recharts`
- Marquee: `react-fast-marquee`
