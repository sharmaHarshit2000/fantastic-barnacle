import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // npm install node-fetch

const app = express();
app.use(express.json());

// Allow your frontend domain
app.use(cors({
  origin: "https://fantastic-barnacle-eta.vercel.app",
  credentials: true,
}));

// Environment / config
const SUPERSET_URL = "https://superset-develop.solargraf.com";
const DASHBOARD_ID = "0ca85b14-d815-4107-8f5f-adea5e49bc39";
const DATASET_ID = 25;
const ADMIN_USER = "admin";       // your Superset admin user
const ADMIN_PASS = "admin"; // your Superset password

app.post("/superset-guest-token", async (req, res) => {
  const { companyId } = req.body;

  try {
    // 1️⃣ Login as admin
    const loginRes = await fetch(`${SUPERSET_URL}/api/v1/security/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS, provider: "db" })
    });

    if (!loginRes.ok) {
      const text = await loginRes.text();
      console.error("Superset login failed:", loginRes.status, text);
      return res.status(500).json({ error: "Superset login failed" });
    }

    const loginData = await loginRes.json();
    const adminToken = loginData.access_token;

    // 2️⃣ Request guest token for the dashboard
    const guestRes = await fetch(`${SUPERSET_URL}/api/v1/dashboard/${DASHBOARD_ID}/guest_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        user: `company_${companyId}`,
        rls: [{ dataset_id: DATASET_ID, clause: `company_id = ${companyId}` }]
      })
    });

    if (!guestRes.ok) {
      const text = await guestRes.text();
      console.error("Guest token request failed:", guestRes.status, text);
      return res.status(500).json({ error: "Superset guest token failed" });
    }

    const guestData = await guestRes.json();
    res.json({ token: guestData.token });

  } catch (err) {
    console.error("Full error:", err);
    res.status(500).json({ error: "Failed to fetch token" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
