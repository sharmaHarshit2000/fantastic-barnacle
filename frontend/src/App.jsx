import { useState, useEffect, useRef } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";

export default function App() {
  const [guestToken, setGuestToken] = useState(null);
  const containerRef = useRef(null);

  // fetch guest token from backend
  useEffect(() => {
    async function fetchToken() {
      try {
        const resp = await fetch("https://fantastic-barnacle.onrender.com/superset-guest-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId: 20008 }),
        });
        const data = await resp.json();
        setGuestToken(data.token);
      } catch (err) {
        console.error("Login error:", err);
      }
    }
    fetchToken();
  }, []);

  // once token is available, embed dashboard
  useEffect(() => {
    if (!guestToken || !containerRef.current) return;

    embedDashboard({
      id: "0ca85b14-d815-4107-8f5f-adea5e49bc39", // dashboard UUID
      supersetDomain: "https://superset-develop.solargraf.com",
      mountPoint: containerRef.current,
      fetchGuestToken: async () => guestToken,
      dashboardUiConfig: {
        hideTitle: true,
        hideChartControls: true,
      },
    });
  }, [guestToken]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {!guestToken ? (
        <p>Loading dashboard...</p>
      ) : (
        <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      )}
    </div>
  );
}
