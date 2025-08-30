import { useState } from "react";

export default function App() {
  const [companyId, setCompanyId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/company-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setData(null);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Superset Dashboard Fetch</h1>
      <input
        type="text"
        placeholder="Enter Company ID"
        value={companyId}
        onChange={(e) => setCompanyId(e.target.value)}
      />
      <button onClick={fetchData}>Fetch Data</button>

      {loading && <p>Loading dashboard...</p>}
      {data && (
        <pre style={{ background: "#eee", padding: "1rem" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
