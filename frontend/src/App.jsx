import React, { useState } from "react";
import SupersetEmbed from "./SupersetEmbed";

export default function App() {
  const [companyId, setCompanyId] = useState("20008");
  const [activeId, setActiveId] = useState(companyId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setActiveId(companyId);
  };

  return (
    <div className="app-wrapper">
      <form onSubmit={handleSubmit} className="filter-form">
        <input
          type="text"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="Enter Company ID"
          className="filter-input"
        />
        <button type="submit" className="filter-button">
          Load Dashboard
        </button>
      </form>

      {/* Embed Superset */}
      <SupersetEmbed companyId={activeId} />
    </div>
  );
}
