# Urban Harvest Hub

Urban Harvest Hub is a full-stack web application promoting eco-friendly commerce, community engagement, and sustainable living. The platform features a React SPA frontend, Express REST API backend, and SQLite database.

##  Features

### Frontend (React SPA)
-  Component-based architecture with React & Vite
-  Client-side routing (React Router)
-  Dark/Light theme toggle with persistence
-  Multilingual support (English + Spanish)
-  Responsive design with Tailwind CSS
-  Master-detail views for products, workshops, events
-  Search and filter functionality
-  Form validation with custom hooks
-  ARIA roles and accessibility features
-  Progressive Web App (PWA) capabilities

### Backend (Express API)
-  RESTful API with CRUD operations
-  SQLite database for data persistence
-  CORS support for frontend integration
-  Input validation and error handling
-  Routes for Products, Workshops, Events, Bookings

### PWA Features
-  Service Worker with caching strategies
-  Offline functionality
-  Installability (app manifest)
-  Push notifications support
-  Geolocation integration
-  LocalStorage for persistence

##  Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser supporting ES6+

## Getting Started

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### 2. Start Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
npm run backend:start
# Backend runs on http://localhost:5000
```

Or run both in one terminal:
```bash
npm run backend  # This will also start dev server if you configure it
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
urban-harvest-hub/
├── src/                          # Frontend source code
│   ├── components/              # Reusable React components
│   │   ├── Common/             # Shared components (forms, filters)
│   │   ├── Events/             # Event-related components
│   │   ├── Products/           # Product components
│   │   ├── Workshops/          # Workshop components
│   │   ├── Layout/             # Layout components (header, footer)
│   │   └── UI/                 # UI components (modals, buttons)
│   ├── pages/                   # Page components
│   ├── hooks/                   # Custom React hooks
│   ├── context/                 # React Context (theme, language)
│   ├── services/                # API service functions
│   ├── utils/                   # Utility functions
│   ├── data/                    # Mock data
│   └── styles/                  # Global CSS/Tailwind
├── public/                       # Public assets
│   ├── sw.js                    # Service Worker
│   ├── manifest.json            # PWA manifest
│   └── icons/                   # App icons
├── backend/                      # Express backend
│   ├── routes/                  # API routes
│   ├── db/                      # Database setup
│   ├── server.js               # Express server entry point
│   └── package.json
├── tailwind.config.js            # Tailwind configuration
├── vite.config.js               # Vite configuration
└── package.json                 # Project dependencies
```

## 🎨 Customization

### Tailwind CSS

The project includes custom Tailwind configuration with:
- **Custom Colors**: `eco-green` and `eco-sage` color palettes
- **Custom Components**: `.card`, `.btn-primary`, `.input-base`, `.badge`
- **Custom Utilities**: Custom spacing and border radius

Edit `tailwind.config.js` to customize colors, fonts, and components.

### Translations

Add new translations in `src/context/LanguageContext.jsx`:
```javascript
const translations = {
  en: { /* English translations */ },
  es: { /* Spanish translations */ },
  // Add more languages here
};
```

## 🔌 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Workshops
- `GET /api/workshops` - Get all workshops
- `GET /api/workshops/:id` - Get single workshop
- `POST /api/workshops` - Create workshop (admin)
- `PUT /api/workshops/:id` - Update workshop (admin)
- `DELETE /api/workshops/:id` - Delete workshop (admin)

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/email/:email` - Get bookings by email
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking status (admin)
- `DELETE /api/bookings/:id` - Delete booking

## 🧪 Features Implemented

### Task 1: Component-Based SPA (35 marks)
- ✅ **Client-Side SPA** (5 marks): React + Vite with routing
- ✅ **Component-Based Design** (10 marks): Reusable components with props/context
- ✅ **Data Handling** (10 marks): Internal JSON + API integration, master-detail views
- ✅ **Tailwind Styling** (5 marks): Two+ pages with custom config
- ✅ **Discretionary** (5 marks): Accessibility, form validation, responsiveness

### Task 2: PWA with REST API (65 marks)
- ✅ **PWA Implementation** (15 marks): Service Worker, manifest, offline access
- ✅ **API Development** (15 marks): Express REST API with CRUD operations
- ✅ **Database** (10 marks): SQLite with structured data
- ✅ **Frontend Integration** (10 marks): Dynamic data fetching, search/filter
- ✅ **Mobile Capabilities** (5 marks): Dark mode, geolocation, offline
- ✅ **Design** (5 marks): Responsive layout, optimized media
- ✅ **Discretionary** (5 marks): Advanced features, multilingual support

## ♿ Accessibility Features

- **Semantic HTML**: Proper use of heading hierarchy, semantic elements
- **ARIA Labels**: `aria-label`, `aria-describedby`, `aria-invalid`
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Focus States**: Visible focus indicators on form inputs and buttons
- **Screen Reader Support**: Proper labeling and role attributes
- **Color Contrast**: WCAG AA compliant color combinations

## 🔒 Security Considerations

- Environment variables for sensitive data (see `.env.example`)
- CORS configuration to restrict API access
- Input validation on both frontend and backend
- Error handling without exposing sensitive information

## 📱 Mobile Optimization

- **Responsive Design**: Mobile-first approach with breakpoints
- **Touch-Friendly**: Larger tap targets for mobile devices
- **PWA Features**: Installable app experience
- **Lighthouse Scores**: Optimized for performance and accessibility
- **Offline Support**: Service Worker caching strategies

## 🚢 Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Render)
```bash
cd backend
npm install
npm start
```

Set environment variables in your hosting platform's dashboard.

## 📚 Technologies Used

- **Frontend**: React 18, React Router 6, Vite, Tailwind CSS
- **Backend**: Express.js, SQLite3
- **State Management**: React Context API
- **Styling**: Tailwind CSS with custom configuration
- **PWA**: Service Workers, Web Manifest
- **Build Tool**: Vite

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support, email support@urbanharvesthub.com or open an issue on GitHub.

---

**Made with ♻️ for a sustainable future**
