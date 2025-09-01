// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// ✅ allow your frontend domain
app.use(
  cors({
    origin: "https://fantastic-barnacle.onrender.com",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const SUPERSET_BASE_URL = "https://superset-develop.solargraf.com";
const SUPERSET_USERNAME = "admin";
const SUPERSET_PASSWORD = "admin";

// helper: login and get JWT
async function getAccessToken() {
  const resp = await fetch(`${SUPERSET_BASE_URL}/api/v1/security/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: SUPERSET_USERNAME,
      password: SUPERSET_PASSWORD,
      provider: "db",
      refresh: true,
    }),
  });
  const data = await resp.json();
  return data.access_token;
}

// 🎯 generate guest token for embed
app.post("/superset-guest-token", async (req, res) => {
  try {
    const { companyId } = req.body; // frontend passes companyId
    const token = await getAccessToken();

    const guestResp = await fetch(`${SUPERSET_BASE_URL}/api/v1/security/guest_token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resources: [
          {
            type: "dashboard",
            id: "0ca85b14-d815-4107-8f5f-adea5e49bc39", // your dashboard UUID
          },
        ],
        rls: [
          {
            clause: `company_id = ${companyId}`,
            dataset: 25,
          },
        ],
        user: {
          username: `company_${companyId}`,
          first_name: "Company",
          last_name: companyId,
        },
      }),
    });

    const guestData = await guestResp.json();
    res.json(guestData);
  } catch (err) {
    console.error("Guest token error:", err);
    res.status(500).json({ error: "Failed to fetch guest token" });
  }
});

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
