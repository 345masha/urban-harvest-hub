import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { initializeDB } from './db/database.js';
import productsRouter from './routes/products.js';
import workshopsRouter from './routes/workshops.js';
import eventsRouter from './routes/events.js';
import bookingsRouter from './routes/bookings.js';
import notificationsRouter from './routes/notifications.js';
import usersRouter from './routes/users.js';
import weatherRouter from './routes/weather.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json());

// Initialize database
initializeDB();

// Routes
app.use('/api/products', productsRouter);
app.use('/api/workshops', workshopsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/users', usersRouter);
app.use('/api/weather', weatherRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`🌱 Urban Harvest Hub API running on http://localhost:${PORT}`);
  console.log(`📍 API Documentation: http://localhost:${PORT}/api/health`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    if (PORT === 5000) {
      const fallbackPort = 5001;
      console.log(`🔁 Trying fallback port ${fallbackPort}...`);
      app.listen(fallbackPort, () => {
        console.log(`🌱 Urban Harvest Hub API running on http://localhost:${fallbackPort}`);
        console.log(`📍 API Documentation: http://localhost:${fallbackPort}/api/health`);
      }).on('error', (fallbackError) => {
        console.error(`❌ Fallback port ${fallbackPort} failed:`, fallbackError.message);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  } else {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
});
