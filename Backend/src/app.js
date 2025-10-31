const express = require('express');
const helmet = require('helmet');
const corsMiddleware = require('./middlewares/cors.middleware'); // CHANGEMENT ICI
const xss = require('xss-clean');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler.middleware');


// Import routes
const authRoutes = require('./routes/auth.routes');
const utilisateurRoutes = require('./routes/utilisateur.routes');
const permisRoutes = require('./routes/permis.routes');
const zoneRoutes = require('./routes/zone.routes');
const typePermisRoutes = require('./routes/typePermis.routes');
const reportRoutes = require('./routes/report.routes');
const auditLogRoutes = require('./routes/auditLog.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Security middlewares
app.use(helmet());
app.use(corsMiddleware); // CHANGEMENT ICI - utiliser le middleware personnalisé
app.use(xss());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/permis', permisRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/types-permis', typePermisRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/admin', adminRoutes);
const verificationRoutes = require('./routes/verification.routes');
app.use('/api/verify', verificationRoutes);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;