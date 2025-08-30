import React, { useEffect, useState } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";

const SupersetEmbed = ({ companyId }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://fantastic-barnacle.onrender.com/superset-token?companyId=${companyId}`
        );
        const data = await res.json();

        if (data?.token) {
          await embedDashboard({
            id: "0ca85b14-d815-4107-8f5f-adea5e49bc39",
            supersetDomain: "https://superset-develop.solargraf.com",
            mountPoint: document.getElementById("superset-container"),
            fetchGuestToken: async () => data.token,
            dashboardUiConfig: { hideTitle: true, hideChartControls: true },
          });
        }
      } catch (err) {
        console.error("Failed to embed Superset:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [companyId]);

  return (
    <div style={{ position: "relative", width: "100%", height: "90vh" }}>
      {loading && (
        <div className="loader">
          <p>Loading dashboard…</p>
        </div>
      )}
      <div
        id="superset-container"
        style={{ width: "100%", height: "100%", minHeight: "600px" }}
      />
    </div>
  );
};

export default SupersetEmbed;
