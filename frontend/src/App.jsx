import { useState } from "react";

export default function SupersetEmbed() {
  const [companyId, setCompanyId] = useState("");
  const [token, setToken] = useState("");

  const loadDashboard = async () => {
    try {
      const res = await fetch("https://fantastic-barnacle.onrender.com/superset-guest-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId })
      });
      const data = await res.json();
      setToken(data.token);
    } catch (err) {
      console.error("Error fetching guest token:", err);
    }
  };

  return (
    <div>
      <input
        placeholder="Enter Company ID"
        value={companyId}
        onChange={(e) => setCompanyId(e.target.value)}
      />
      <button onClick={loadDashboard}>Load Dashboard</button>

      {token && (
        <iframe
          title="Superset Dashboard"
          width="100%"
          height="800"
          src={`https://superset-develop.solargraf.com/superset/dashboard/0ca85b14-d815-4107-8f5f-adea5e49bc39/?guest_token=${token}`}
          frameBorder="0"
          allowFullScreen
        />
      )}
    </div>
  );
}
