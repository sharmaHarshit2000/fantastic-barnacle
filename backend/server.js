const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Simple CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Configuration
const GUEST_TOKEN_JWT_SECRET = "SUp3rS3cr3tGue5tJWTKey_2025_08_07_XYZ";
const GUEST_TOKEN_JWT_ALGO = "HS256";
const SUPERSET_BASE_URL = "https://superset-develop.solargraf.com";
const DASHBOARD_ID = "0ca85b14-d815-4107-8f5f-adea5e49bc39";
const DATASET_ID = 25;

// Guest token endpoint with EXACT filter structure from API
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
      // RLS for database-level security
      rls: [{ 
        dataset: DATASET_ID, 
        clause: `company_id = '${companyId}'` 
      }],
      user: {
        username: "admin",
        first_name: "Admin",
        last_name: "User"
      },
      // EXACT FILTER STRUCTURE FROM THE API CALL
      extra_form_data: {
        "filters": [
          {
            "col": "company_id",
            "op": "IN",
            "val": [parseInt(companyId)]
          }
        ]
      },
      // Also include filter_state for UI pre-selection
      filter_state: {
        "NATIVE_FILTER-COMPANY": {
          "id": "NATIVE_FILTER-COMPANY",
          "extraFormData": {
            "filters": [
              {
                "col": "company_id",
                "op": "IN",
                "val": [parseInt(companyId)]
              }
            ]
          },
          "currentState": {
            "value": parseInt(companyId)
          }
        }
      },
      exp: Math.floor(Date.now() / 1000) + 300
    };

    const token = jwt.sign(payload, GUEST_TOKEN_JWT_SECRET, { 
      algorithm: GUEST_TOKEN_JWT_ALGO 
    });

    res.json({ 
      token, 
      supersetUrl: SUPERSET_BASE_URL,
      message: `Dashboard pre-filtered for company ${companyId}`
    });

  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ 
      error: "Failed to generate guest token",
      details: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});