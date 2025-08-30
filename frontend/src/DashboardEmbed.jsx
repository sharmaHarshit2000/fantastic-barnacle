import React, { useEffect, useState } from "react";

const SupersetDashboard = ({ companyId }) => {
  const [guestToken, setGuestToken] = useState(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("http://localhost:4000/superset-guest-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId }),
        });
        const data = await res.json();
        setGuestToken(data.token);
      } catch (err) {
        console.error("Failed to fetch guest token", err);
      }
    }
    fetchToken();
  }, [companyId]);

  if (!guestToken) return <div>Loading dashboard...</div>;

  return (
    <iframe
      title="Superset Dashboard"
      src={`https://superset-develop.solargraf.com/superset/dashboard/12/?guest_token=${guestToken}`}
      width="100%"
      height="800px"
    />
  );
};

export default SupersetDashboard;
