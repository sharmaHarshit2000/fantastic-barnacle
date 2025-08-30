import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const SUPERSET_URL = "https://superset-develop.solargraf.com";
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";

let adminToken = null;
let tokenExpire = null;

// Login as admin and get access token
async function loginAdmin() {
  if (adminToken && tokenExpire && new Date() < tokenExpire) {
    return adminToken; // reuse token if valid
  }

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

  const data = await res.json();
  adminToken = data.access_token;
  tokenExpire = new Date(new Date().getTime() + 55 * 60 * 1000); // 55 min expiry
  return adminToken;
}

// API to fetch dashboard data by company ID
app.post("/company-data", async (req, res) => {
  try {
    const { companyId } = req.body;
    const token = await loginAdmin();

    // Example: get dashboard 12
    const dashboardRes = await fetch(`${SUPERSET_URL}/api/v1/dashboard/12/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const dashboardData = await dashboardRes.json();

    // Return filtered data (here we just pass the whole dashboard)
    res.json({ dashboard: dashboardData, companyId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Superset data" });
  }
});

app.listen(4000, () => console.log("Server running on port 4000"));
