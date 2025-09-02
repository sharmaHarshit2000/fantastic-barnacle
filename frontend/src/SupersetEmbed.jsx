import React, { useEffect, useRef } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";

const SupersetEmbed = ({ token }) => {
  const ref = useRef(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token || !ref.current) return;

      try {
        await embedDashboard({
          id: "0ca85b14-d815-4107-8f5f-adea5e49bc39", // your dashboard UUID
          supersetDomain: "https://superset-develop.solargraf.com",
          mountPoint: ref.current,
          fetchGuestToken: async () => token,
          dashboardUiConfig: {
            hideTitle: true,
            filters: { expanded: false },
          },
        });
      } catch (err) {
        console.error("Error embedding dashboard:", err);
      }
    };

    loadDashboard();
  }, [token]);

  return <div ref={ref} style={{ height: "90vh", width: "100%" }} />;
};

export default SupersetEmbed;
