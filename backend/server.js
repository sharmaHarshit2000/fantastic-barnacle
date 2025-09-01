// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// CORS configuration for live URLs and local development
app.use(cors({
  origin: [
    'https://fantastic-barnacle-eta.vercel.app', // Your Vercel frontend
    'http://localhost:5173',                   // Local development
    'http://localhost:3000'                    // Local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRFToken'] // Added X-CSRFToken for completeness
}));

app.use(express.json());

// Configuration - **IMPORTANT: This secret must match your Superset config!**
const GUEST_TOKEN_JWT_SECRET = "SUp3rS3cr3tGue5tJWTKey_2025_08_07_XYZ";
const GUEST_TOKEN_JWT_ALGO = "HS256";
const DASHBOARD_ID = "0ca85b14-d815-4107-8f5f-adea5e49bc39"; // Your dashboard UUID
const DATASET_ID = 25; // Your MySQL dataset ID

// Guest token endpoint
app.post('/api/superset/guest-token', (req, res) => {
  try {
    const { companyId } = req.body;
    
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    // Payload for the JWT
    const payload = {
      resources: [{ type: "dashboard", id: DASHBOARD_ID }],
      rls: [{ dataset: DATASET_ID, clause: `company_id = '${companyId}'` }],
      user: {
        username: `company_${companyId}`,
        first_name: "Guest",
        last_name: companyId.toString()
      },
      exp: Math.floor(Date.now() / 1000) + 300 // 5 minutes expiry
    };

    const token = jwt.sign(payload, GUEST_TOKEN_JWT_SECRET, {
      algorithm: GUEST_TOKEN_JWT_ALGO
    });

    res.json({
      token,
      message: "Token generated with RLS for embedded dashboard"
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
  });
});

// Handle preflight requests
app.options('*', cors());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});
