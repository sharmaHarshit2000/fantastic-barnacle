import React, { useState } from "react";

export default function DashboardEmbed() {
  const [companyId, setCompanyId] = useState("");
  const [token, setToken] = useState("");

  const handleLoadDashboard = async () => {
    try {
      const res = await fetch("https://fantastic-barnacle.onrender.com/superset-guest-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId })
      });

      if (!res.ok) throw new Error("Failed to fetch guest token");

      const data = await res.json();
      setToken(data.token);
    } catch (err) {
      console.error("Error fetching guest token:", err);
      alert("Failed to fetch guest token. Check console.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Superset Dashboard Embed</h1>
      <input
        type="text"
        placeholder="Enter Company ID"
        value={companyId}
        onChange={(e) => setCompanyId(e.target.value)}
        style={{ padding: "8px", width: "200px", marginRight: "10px" }}
      />
      <button onClick={handleLoadDashboard} style={{ padding: "8px 12px" }}>
        Load Dashboard
      </button>

      {token && (
        <iframe
          title="Superset Dashboard"
          src={`https://superset-develop.solargraf.com/superset/dashboard/0ca85b14-d815-4107-8f5f-adea5e49bc39/?guest_token=${token}`}
          width="100%"
          height="800px"
          frameBorder="0"
          style={{ marginTop: "20px" }}
        />
      )}
    </div>
  );
}
