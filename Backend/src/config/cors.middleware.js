const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    // Permettre les requêtes sans origin (comme Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  // ✅ CRITIQUE: Exposer les headers personnalisés au frontend
  exposedHeaders: [
    'X-PDF-Hash',           // Hash du PDF pour vérification
    'Content-Disposition',  // Nom du fichier
    'Content-Length',       // Taille du fichier
    'Content-Type'          // Type MIME
  ]
};

module.exports = cors(corsOptions);
