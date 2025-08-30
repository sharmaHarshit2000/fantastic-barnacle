// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());

// Allow your frontend domain
app.use(cors({
  origin: "https://fantastic-barnacle-eta.vercel.app", // or your deployed frontend
  credentials: true,
}));

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

    // 2️⃣ Request guest token for the company
    const guestRes = await fetch(`${SUPERSET_URL}/api/v1/dashboard/12/guest_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        user: `company_${companyId}`,           // matches your RLS
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

    // 3️⃣ Return only the token to frontend
    res.json({ token: guestData.token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch token", details: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
