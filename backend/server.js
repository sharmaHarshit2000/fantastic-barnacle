import express from "express";
import cors from "cors";

const app = express();

// allow your frontend origin
app.use(cors({
  origin: "https://fantastic-barnacle-eta.vercel.app",
  methods: ["POST", "GET"]
}));

app.use(express.json());

app.post("/superset-guest-token", async (req, res) => {
  // generate guest token here
  res.json({ guest_token: "..." });
});

app.listen(4000, () => console.log("Server running on port 4000"));
