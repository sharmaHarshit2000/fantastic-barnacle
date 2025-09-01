// server.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// Superset and Dashboard Configuration
const SUPERSET_BASE_URL = "https://superset-develop.solargraf.com";
const SUPERSET_USERNAME = "embedded";
const SUPERSET_PASSWORD = "123456";
const GUEST_TOKEN_JWT_SECRET = "SUp3rS3cr3tGue5tJWTKey_2025_08_07_XYZ";
const DASHBOARD_UUID = "0ca85b14-d815-4107-8f5f-adea5e49bc39";
const DATASET_ID = 25;

// CORS configuration for live URLs and local development
app.use(cors({
  origin: [
    'https://fantastic-barnacle-eta.vercel.app', 
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRFToken']
}));

app.use(express.json());

// Function to handle Superset authentication and token generation
async function getSupersetAuth() {
    try {
        // 1. Get an access token using the service account credentials
        const loginResponse = await fetch(`${SUPERSET_BASE_URL}/api/v1/security/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: SUPERSET_USERNAME,
                password: SUPERSET_PASSWORD,
                provider: 'db'
            }),
        });

        if (!loginResponse.ok) {
            throw new Error(`Superset login failed: ${loginResponse.statusText}`);
        }

        const loginData = await loginResponse.json();
        const accessToken = loginData.access_token;

        // 2. Get a CSRF token (required for POST requests)
        const csrfResponse = await fetch(`${SUPERSET_BASE_URL}/api/v1/security/csrf_token/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        
        if (!csrfResponse.ok) {
            throw new Error(`Superset CSRF token fetch failed: ${csrfResponse.statusText}`);
        }

        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.result;

        return { accessToken, csrfToken };

    } catch (error) {
        console.error('Superset authentication error:', error);
        throw error;
    }
}

// Guest token endpoint
app.post('/api/superset/guest-token', async (req, res) => {
    const { companyId } = req.body;

    if (!companyId) {
        return res.status(400).json({ error: "Company ID is required" });
    }

    try {
        const { accessToken, csrfToken } = await getSupersetAuth();
        
        // Payload for the guest token request
        const guestTokenPayload = {
            resources: [{ type: "dashboard", id: DASHBOARD_UUID }],
            rls: [{ dataset: DATASET_ID, clause: `company_id = '${companyId}'` }],
            user: {
                username: `embedded_guest_${companyId}`,
                first_name: "Embedded",
                last_name: "User"
            }
        };

        // Request the guest token from Superset
        const guestResponse = await fetch(`${SUPERSET_BASE_URL}/api/v1/security/guest_token/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(guestTokenPayload),
        });

        if (!guestResponse.ok) {
            const errorData = await guestResponse.json();
            console.error('Guest token error response:', errorData);
            throw new Error(`Failed to get guest token: ${guestResponse.statusText}`);
        }

        const { token } = await guestResponse.json();
        
        res.json({ token });

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

// Handle preflight requests for CORS
app.options('*', cors());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});
