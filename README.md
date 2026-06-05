# Urban Harvest Hub

Urban Harvest Hub is a community-driven Progressive Web App (PWA) designed to foster sustainable living, local farming, and eco-friendly products. It includes an integrated e-commerce system, event and workshop management, interactive dashboard, full offline capabilities, and multi-language support (English, Sinhala, Tamil).

## Features

- **Progressive Web App (PWA):** Installable, works offline via Service Workers and IndexedDB.
- **Multilingual Support:** Seamlessly switch between English, Sinhala, and Tamil.
- **Dynamic Weather Widget:** Geolocation-based weather and climate tips.
- **Full E-commerce:** Shopping cart, wishlist, product catalog.
- **Event & Workshop Management:** Registration, calendar, timeline views.
- **Admin Dashboard:** Full CRUD operations for products, events, workshops, bookings, and users. SVG analytics and CSV/PDF reports.
- **Push Notifications:** Web Push API integration for system-wide announcements.
- **Premium UI/UX:** Glassmorphism, Tailwind Customization, Dark/Light modes, micro-animations.

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, React-i18next
- **Backend:** Node.js, Express, web-push
- **Database:** MySQL (Powered by `mysql2` module. The database schema auto-initializes and seeds data on server startup)

## Development Setup

### 1. Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend` directory. 
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=urban_harvest
WEATHER_API_KEY=your_weather_api_key_here
```

### 3. Database Setup
The backend uses a MySQL database. Ensure you have a MySQL server running locally on port `3306` with the credentials matching your `.env` file.
When you start the backend server for the first time, it will automatically connect, create the `urban_harvest` schema, build the tables, and seed them with initial data. **No manual SQL scripts are required.**

### 4. Run the App Locally
Start the backend server (API):
```bash
cd backend
npm start
```
Start the frontend development server (GUI):
```bash
npm run dev
```

## Testing the API and GUI

### Testing the API
You can test the backend REST API directly using tools like Postman, Insomnia, or cURL.
The API runs on `http://localhost:5000`.
- **GET /api/products**: Returns a list of seeded products.
- **GET /api/weather?city=colombo**: Tests the external API integration.
- **POST /api/notifications/subscribe**: Test saving a Web Push subscription.

### Testing the GUI
1. Open your browser and navigate to `http://localhost:5173`.
2. **Responsiveness:** Resize the browser window to see the mobile-first Tailwind design adapt smoothly.
3. **PWA Features:** Open Chrome DevTools -> Application tab. You will see the Service Worker active, the Web Manifest registered, and caching strategies caching network requests.
4. **Push Notifications:** Click the 🔔 icon in the header. Allow permissions, and verify you are subscribed.
5. **Master-Detail & Interactions:** Click on "Explore Now", use the search bar, filter by category, and click on a product card to view the dynamic detail page.

## Deployment Guide

### Deploying the Frontend (Vercel / Netlify)

1. Connect your GitHub repository to Vercel or Netlify.
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. Set the `VITE_API_BASE_URL` environment variable to your deployed backend URL.

### Deploying the Backend (Railway / Render)

1. Create a new Web Service on Railway or Render, connected to your GitHub repository.
2. Root Directory: `backend`
3. Start Command: `npm start`
4. Add your `.env` variables (Database URL, VAPID keys, etc.) to the platform's Environment Variables section.

## Lighthouse & Accessibility

This app is optimized to score >90 in Performance, Accessibility, Best Practices, and SEO on Google Lighthouse.
Proper ARIA tags, semantic HTML, meta tags, and contrast ratios are enforced.

## License
MIT License
