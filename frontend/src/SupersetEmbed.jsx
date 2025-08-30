import React, { useEffect } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";

const SupersetEmbed = () => {
  useEffect(() => {
    async function loadDashboard() {
      // Request guest token from your backend
      const res = await fetch("http://localhost:4000/superset-token");
      const { token } = await res.json();

      await embedDashboard({
        id: "12", // dashboard id
        supersetDomain: "https://superset-develop.solargraf.com",
        mountPoint: document.getElementById("superset-container"),
        fetchGuestToken: () => token,
        dashboardUiConfig: {
          hideTitle: true,
          hideChartControls: true,
          filters: { expanded: true },
        },
      });
    }
    loadDashboard();
  }, []);

  return <div id="superset-container" style={{ height: "100vh", width: "100%" }} />;
};

export default SupersetEmbed;
