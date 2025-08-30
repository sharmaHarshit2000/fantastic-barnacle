// App.jsx
import React, { useState } from "react";
import SupersetEmbed from "./SupersetEmbed";

export default function App() {
  const [companyId, setCompanyId] = useState("");
  const [activeId, setActiveId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setActiveId(companyId.trim());
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🔎 Superset Dashboard Embed</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="Enter Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="border rounded p-2 mr-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Load Dashboard
        </button>
      </form>

      {activeId && <SupersetEmbed companyId={activeId} />}
    </div>
  );
}
