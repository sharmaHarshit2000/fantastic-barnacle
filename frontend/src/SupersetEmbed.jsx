// SupersetEmbed.jsx
import React, { useEffect } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";

const DASHBOARD_ID = "0ca85b14-d815-4107-8f5f-adea5e49bc39";
const SUPERSET_DOMAIN = "https://superset-develop.solargraf.com";
const BACKEND_URL = "https://fantastic-barnacle.onrender.com"; // your backend

export default function SupersetEmbed({ companyId }) {
  useEffect(() => {
    async function load() {
      try {
        // 🔑 get guest token from backend
        const res = await fetch(
          `${BACKEND_URL}/superset-token?companyId=${companyId}`
        );
        const data = await res.json();

        if (!data.token) {
          console.error("No token returned:", data);
          return;
        }

        // 🖼️ embed dashboard
        await embedDashboard({
          id: DASHBOARD_ID,
          supersetDomain: SUPERSET_DOMAIN,
          mountPoint: document.getElementById("superset-container"),
          fetchGuestToken: async () => data.token,
          dashboardUiConfig: {
            hideTitle: true,
            hideChartControls: true,
          },
        });
      } catch (err) {
        console.error("Embed error:", err);
      }
    }

    load();
  }, [companyId]);

  return (
    <div
      id="superset-container"
      style={{
        width: "100%",
        height: "90vh",
        minHeight: "600px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    />
  );
}
