import React, { useEffect } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";

const SupersetEmbed = ({ companyId }) => {
  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch(
          `https://fantastic-barnacle.onrender.com/superset-token?companyId=${companyId}`
        );
        const data = await res.json();

        if (data?.token) {
          await embedDashboard({
            id: "0ca85b14-d815-4107-8f5f-adea5e49bc39", // dashboard UUID
            supersetDomain: "https://superset-develop.solargraf.com",
            mountPoint: document.getElementById("superset-container"),
            fetchGuestToken: async () => data.token,
            dashboardUiConfig: {
              hideTitle: true,
              hideChartControls: true,
            },
          });
        }
      } catch (err) {
        console.error("Failed to embed Superset:", err);
      }
    }

    // Delay so container is painted before embedding
    const timer = setTimeout(loadDashboard, 100);
    return () => clearTimeout(timer);
  }, [companyId]);

  return (
    <div
      id="superset-container"
      style={{
        width: "100%",
        height: "90vh",
        minHeight: "600px",
        border: "none",
      }}
    />
  );
};

export default SupersetEmbed;
