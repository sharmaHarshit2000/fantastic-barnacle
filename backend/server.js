// server.js
import express from "express";
import fetch from "node-fetch"; // or native fetch in Node 18+

const app = express();
app.use(express.json());

const SUPERSET_URL = "https://superset-develop.solargraf.com";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";

let adminToken = null;
let adminTokenExpiry = 0;

// Function to get admin access token
async function getAdminToken() {
  if (adminToken && Date.now() < adminTokenExpiry) {
    return adminToken;
  }

  const res = await fetch(`${SUPERSET_URL}/api/v1/security/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      provider: "db",
      refresh: true,
    }),
  });
  const data = await res.json();
  adminToken = data.access_token;
  // Superset tokens usually expire in 60 min (3600 sec)
  adminTokenExpiry = Date.now() + 55 * 60 * 1000; // renew 5 min before expiry
  return adminToken;
}

// Endpoint to get guest token
app.post("/superset-guest-token", async (req, res) => {
  try {
    const { companyId } = req.body; // e.g., "20008"
    const token = await getAdminToken();

    const guestRes = await fetch(
      `${SUPERSET_URL}/api/v1/security/guest_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: `company_${companyId}`,
          roles: ["Gamma"],
          dashboard_id: 12,
          rls: [
            {
              dataset_id: 25,
              clause: `company_id = ${companyId}`,
            },
          ],
        }),
      }
    );

    const guestData = await guestRes.json();
    res.json(guestData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get guest token" });
  }
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
