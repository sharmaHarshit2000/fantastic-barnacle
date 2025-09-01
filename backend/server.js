const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(
  cors({
    origin: [
      "https://fantastic-barnacle-eta.vercel.app",
      "https://fantastic-barnacle.onrender.com",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Superset config
const SUPERSET_BASE_URL = "https://superset-develop.solargraf.com";
const GUEST_TOKEN_JWT_SECRET = "SUp3rS3cr3tGue5tJWTKey_2025_08_07_XYZ";
const GUEST_TOKEN_JWT_ALGO = "HS256";
const DASHBOARD_ID = "0ca85b14-d815-4107-8f5f-adea5e49bc39";
const DATASET_ID = 25;

// Guest token endpoint
app.post("/api/superset/guest-token", async (req, res) => {
  try {
    const { companyId } = req.body;
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    // Step 1: Build payload
    const payload = {
      user: {
        username: `company_${companyId}`,
        first_name: "Embedded",
        last_name: "User",
      },
      resources: [{ type: "dashboard", id: DASHBOARD_ID }],
      rls: [{ dataset: DATASET_ID, clause: `company_id = '${companyId}'` }],
    };

    // Step 2: Sign with Superset guest secret
    const signedJwt = jwt.sign(payload, GUEST_TOKEN_JWT_SECRET, {
      algorithm: GUEST_TOKEN_JWT_ALGO,
      expiresIn: "5m",
    });

    // Step 3: Request guest_token from Superset
    const response = await fetch(
      `${SUPERSET_BASE_URL}/api/v1/security/guest_token/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${signedJwt}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Superset error:", errorText);
      return res
        .status(500)
        .json({ error: "Failed to fetch guest token", details: errorText });
    }

    const data = await response.json();

    res.json({
      token: data.token,
      supersetUrl: SUPERSET_BASE_URL,
    });
  } catch (error) {
    console.error("Guest token error:", error);
    res.status(500).json({ error: "Failed to generate guest token" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
