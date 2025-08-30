"use client";
import React, { useEffect, useState } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";

const SupersetEmbed = ({ companyId }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!companyId) return;

      setLoading(true);
      try {
        // call your backend
        const res = await fetch(
          `https://fantastic-barnacle.onrender.com/superset-token?companyId=${companyId}`
        );
        const data = await res.json();

        if (data?.token) {
          await embedDashboard({
            id: "0ca85b14-d815-4107-8f5f-adea5e49bc39", // Dashboard UUID
            supersetDomain: "https://superset-develop.solargraf.com",
            mountPoint: document.getElementById("superset-container"),
            fetchGuestToken: async () => data.token,
            dashboardUiConfig: {
              hideTitle: true,
              hideChartControls: true,
            },
          });
        } else {
          console.error("No token received from backend");
        }
      } catch (err) {
        console.error("Error embedding dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [companyId]);

  return (
    <div className="w-full h-screen flex flex-col">
      {loading && (
        <div className="flex justify-center items-center h-20 bg-gray-100 text-gray-600">
          Loading dashboard...
        </div>
      )}
      <div id="superset-container" className="flex-1" />
    </div>
  );
};

export default SupersetEmbed;
