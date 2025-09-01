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

// Guest token endpoint - Using admin user to bypass permission issues
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
        username: "admin",        // Using admin user to avoid permission issues
        first_name: "Admin",      // Admin first name
        last_name: "User"         // Admin last name
      },
      exp: Math.floor(Date.now() / 1000) + 300 // 5 minutes expiry
    };

    const token = jwt.sign(payload, GUEST_TOKEN_JWT_SECRET, { 
      algorithm: GUEST_TOKEN_JWT_ALGO 
    });

    res.json({ 
      token, 
      supersetUrl: SUPERSET_BASE_URL,
      dashboardId: DASHBOARD_ID,
      message: "Token generated with admin user for embedded dashboard"
    });

  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ 
      error: "Failed to generate guest token",
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      guestToken: '/api/superset/guest-token'
    },
    allowedOrigins: [
      'https://fantastic-barnacle-eta.vercel.app',
      'https://fantastic-barnacle.onrender.com',
      'http://localhost:5173',
      'http://localhost:3000'
    ]
  });
});

// Handle preflight requests
//app.options('*', cors());

// Test endpoint for debugging
app.post('/api/superset/test-token', async (req, res) => {
  try {
    const { companyId } = req.body;
    
    const payload = {
      resources: [{ 
        type: "dashboard", 
        id: DASHBOARD_ID
      }],
      rls: [{ 
        dataset: DATASET_ID, 
        clause: `company_id = '${companyId || "test"}'` 
      }],
      user: {
        username: "admin",
        first_name: "Test",
        last_name: "User"
      },
      exp: Math.floor(Date.now() / 1000) + 300
    };

    const token = jwt.sign(payload, GUEST_TOKEN_JWT_SECRET, { 
      algorithm: GUEST_TOKEN_JWT_ALGO 
    });

    res.json({ 
      token,
      payload: payload, // For debugging
      message: "Test token generated successfully"
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to generate test token" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Token endpoint: http://localhost:${PORT}/api/superset/guest-token`);
  console.log(`✅ Test endpoint: http://localhost:${PORT}/api/superset/test-token`);
  console.log(`✅ Allowed origins: Vercel frontend, Render backend, and localhost`);
});
