import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db.ts';
import authRoutes from './routes/auth.ts';
import parkingRoutes from './routes/parking.ts';
import bookingsRoutes from './routes/bookings.ts';
import sessionsRoutes from './routes/sessions.ts';
import vehiclesRoutes from './routes/vehicles.ts';
import favoritesRoutes from './routes/favorites.ts';
import reviewsRoutes from './routes/reviews.ts';
import partnerRoutes from './routes/partner.ts';
import adminRoutes from './routes/admin.ts';
import notificationsRoutes from './routes/notifications.ts';

import path from 'path';

dotenv.config();

// Ensure DB is initialized
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Parking Partner API v1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🚗 Parking Partner API Server running at http://localhost:${PORT}`);
});
