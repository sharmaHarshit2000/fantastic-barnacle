import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

// Allow your hosted frontend
app.use(cors({
  origin: "https://fantastic-barnacle-eta.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.post("/superset-guest-token", async (req, res) => {
  const { companyId } = req.body;

  try {
    // Call Superset API with admin credentials
    const loginRes = await fetch(`${SUPERSET_URL}/api/v1/security/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Gamma", password: "your_password" })
    });
    const loginData = await loginRes.json();
    const adminToken = loginData.access_token;

    // Create guest token with RLS
    const guestRes = await fetch(`${SUPERSET_URL}/api/v1/dashboard/0ca85b14-d815-4107-8f5f-adea5e49bc39/guest_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        user: `company_${companyId}`,
        rls: [{ dataset_id: 25, clause: `company_id = ${companyId}` }]
      })
    });

    const guestData = await guestRes.json();
    res.json({ token: guestData.token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch token" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
