import { useEffect, useState } from "react";

export default function SupersetEmbed({ companyId }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch(
          `https://fantastic-barnacle.onrender.com/superset-token?companyId=${companyId}`
        );
        const data = await res.json();
        if (data.token) setToken(data.token);
      } catch (err) {
        console.error("Failed to fetch token:", err);
      }
    }
    fetchToken();
  }, [companyId]);

  if (!token) {
    return <p className="text-center p-4">Loading dashboard...</p>;
  }

  const iframeUrl = `https://superset-develop.solargraf.com/superset/dashboard/0ca85b14-d815-4107-8f5f-adea5e49bc39/?standalone=1&guest_token=${token}`;

  return (
    <iframe
      src={iframeUrl}
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
      }}
      allow="fullscreen"
    />
  );
}
