// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

const SUPERSET_URL = "https://superset-develop.solargraf.com";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";

app.post("/superset-guest-token", async (req, res) => {
  const { companyId } = req.body;

  try {
    // 1️⃣ Login as admin
    const loginRes = await fetch(`${SUPERSET_URL}/api/v1/security/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
        provider: "db",
        refresh: true
      })
    });

    if (!loginRes.ok) {
      const text = await loginRes.text();
      throw new Error(`Admin login failed: ${text}`);
    }

    const loginData = await loginRes.json();
    const adminToken = loginData.access_token;

    // 2️⃣ Request guest token
    const guestRes = await fetch(`${SUPERSET_URL}/api/v1/security/guest_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        user: `company_${companyId}`,
        roles: ["Gamma"], 
        resources: [{ type: "dashboard", id: 12 }],
        rls: [
          { dataset_id: 25, clause: `company_id = ${companyId}` }
        ]
      })
    });

    if (!guestRes.ok) {
      const text = await guestRes.text();
      throw new Error(`Guest token request failed: ${text}`);
    }

    const guestData = await guestRes.json();
    res.json({ token: guestData.token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch token", details: err.message });
  }
});

app.listen(4000, () => console.log("Backend running on port 4000"));
