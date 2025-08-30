import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const SUPERSET_URL = "https://superset-develop.solargraf.com";
const DASHBOARD_ID = "0ca85b14-d815-4107-8f5f-adea5e49bc39";

// Use your admin login token here (refresh periodically)
const ADMIN_JWT = "eyJ0eXAiOiJKV1QiLCJhbGciOi..."; // <--- paste your valid access_token

app.get("/superset-token", async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ error: "companyId required" });

  const payload = {
    user: {
      username: `company_${companyId}`,
      first_name: "Company",
      last_name: String(companyId),
    },
    resources: [{ type: "dashboard", id: DASHBOARD_ID }],
    rls: [{ clause: `company_id = '${companyId}'` }],
  };

  try {
    const response = await fetch(`${SUPERSET_URL}/api/v1/security/guest_token/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ADMIN_JWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching guest token:", error);
    res.status(500).json({ error: "Failed to fetch guest token" });
  }
});

app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
