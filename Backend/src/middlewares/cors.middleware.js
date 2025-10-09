const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    const allowedOrigins = process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:3001', 'http://localhost:5173'];
    
    // En développement, accepter aussi les IPs locales
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isLocalIP = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+):\d+$/.test(origin);
    
    console.log('CORS Check - Origin:', origin);
    console.log('CORS Check - Allowed:', allowedOrigins);
    console.log('CORS Check - Is Local IP:', isLocalIP);
    
    if (allowedOrigins.includes(origin) || (isDevelopment && isLocalIP)) {
      console.log('✓ Origin allowed');
      callback(null, true);
    } else {
      console.log('✗ Origin blocked');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

module.exports = cors(corsOptions);