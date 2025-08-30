import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ["https://fantastic-barnacle-eta.vercel.app"], // frontend domain
  methods: ["GET", "POST"],
}));
app.use(express.json());

const SUPERSET_URL = "https://superset-develop.solargraf.com";
const DASHBOARD_ID = "0ca85b14-d815-4107-8f5f-adea5e49bc39";

// 🔑 Admin credentials (store securely in Render environment variables)
const ADMIN_USER = process.env.SUPERSET_ADMIN_USER || "admin";
const ADMIN_PASS = process.env.SUPERSET_ADMIN_PASS || "admin";

// function to login and get a fresh JWT
async function getAdminJwt() {
  const res = await fetch(`${SUPERSET_URL}/api/v1/security/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: ADMIN_USER,
      password: ADMIN_PASS,
      provider: "db",
      refresh: true,
    }),
  });

  if (!res.ok) throw new Error("Failed to login to Superset");
  const data = await res.json();
  return data.access_token;
}

app.get("/superset-token", async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ error: "companyId required" });

  try {
    // always get a fresh admin token
    const adminJwt = await getAdminJwt();

    const payload = {
      user: {
        username: `company_${companyId}`,
        first_name: "Company",
        last_name: String(companyId),
      },
      resources: [{ type: "dashboard", id: DASHBOARD_ID }],
      rls: [{ clause: `company_id = '${companyId}'` }],
    };

    const response = await fetch(`${SUPERSET_URL}/api/v1/security/guest_token/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminJwt}`,
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
