import React, { useState } from "react";

const DASHBOARD_ID = "0ca85b14-d815-4107-8f5f-adea5e49bc39";

export default function DashboardEmbed() {
  const [companyId, setCompanyId] = useState("");
  const [guestToken, setGuestToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://fantastic-barnacle.onrender.com/superset-guest-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch guest token");
      }

      const data = await res.json();
      setGuestToken(data.token);

    } catch (err) {
      console.error(err);
      setError(err.message || "Error fetching token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Superset Dashboard Embed</h2>

      <input
        type="text"
        placeholder="Enter Company ID"
        value={companyId}
        onChange={(e) => setCompanyId(e.target.value)}
        style={{ padding: "8px", width: "200px", marginRight: "10px" }}
      />
      <button onClick={handleLoadDashboard} disabled={loading}>
        {loading ? "Loading..." : "Load Dashboard"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {guestToken && (
        <iframe
          title="Superset Dashboard"
          width="100%"
          height="800px"
          src={`https://superset-develop.solargraf.com/superset/dashboard/${DASHBOARD_ID}/?guest_token=${guestToken}`}
          frameBorder="0"
        />
      )}
    </div>
  );
}
