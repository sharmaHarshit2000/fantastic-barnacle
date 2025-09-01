// App.jsx
import React, { useState } from "react";

function App() {
  const [companyId, setCompanyId] = useState("");
  const [guestToken, setGuestToken] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch(
        "https://fantastic-barnacle.onrender.com/superset-guest-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId }),
        }
      );

      const data = await res.json();
      console.log("Guest token response:", data);
      if (data.token) setGuestToken(data.token);
    } catch (err) {
      console.error("Login error:", err);
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
      />
      <button onClick={handleLogin}>Login & Get Dashboard</button>

      {guestToken && (
        <iframe
          src={`https://superset-develop.solargraf.com/embedded/0ca85b14-d815-4107-8f5f-adea5e49bc39/?guest_token=${guestToken}`}
          title="Superset Dashboard"
          width="100%"
          height="800"
          frameBorder="0"
        />
      )}
    </div>
  );
}

export default App;
