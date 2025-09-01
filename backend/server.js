const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// CORS configuration for LIVE URLs
app.use(cors({
  origin: [
    'https://fantastic-barnacle-eta.vercel.app', // Your Vercel frontend
    'https://fantastic-barnacle.onrender.com',    // Your Render backend
    'http://localhost:5173',                      // Local development
    'http://localhost:3000'                       // Local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Configuration
const GUEST_TOKEN_JWT_SECRET = "SUp3rS3cr3tGue5tJWTKey_2025_08_07_XYZ";
const GUEST_TOKEN_JWT_ALGO = "HS256";
const SUPERSET_BASE_URL = "https://superset-develop.solargraf.com";
const DASHBOARD_ID = "0ca85b14-d815-4107-8f5f-adea5e49bc39"; // UUID for embedding
const DATASET_ID = 25;

// Guest token endpoint
app.post('/api/superset/guest-token', async (req, res) => {
  try {
    const { companyId } = req.body;
    
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const payload = {
      resources: [{ 
        type: "dashboard", 
        id: DASHBOARD_ID
      }],
      rls: [{ 
        dataset: DATASET_ID, 
        clause: `company_id = '${companyId}'` 
      }],
      user: {
        username: "embedded",
        first_name: "Embedded",
        last_name: "User"
      },
      exp: Math.floor(Date.now() / 1000) + 300
    };

    const token = jwt.sign(payload, GUEST_TOKEN_JWT_SECRET, { 
      algorithm: GUEST_TOKEN_JWT_ALGO 
    });

    res.json({ 
      token, 
      supersetUrl: SUPERSET_BASE_URL,
      dashboardId: DASHBOARD_ID
    });

  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: "Failed to generate guest token" });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    allowedOrigins: [
      'https://fantastic-barnacle-eta.vercel.app',
      'https://fantastic-barnacle.onrender.com',
      'http://localhost:5173',
      'http://localhost:3000'
    ]
  });
});

// Handle preflight requests
app.options('/api/superset/guest-token', cors());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Token endpoint: http://localhost:${PORT}/api/superset/guest-token`);
  console.log(`✅ Allowed origins: Vercel frontend, Render backend, and localhost`);
});