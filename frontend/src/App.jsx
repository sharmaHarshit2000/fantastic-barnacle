"use client";
import React, { useState } from "react";
import SupersetEmbed from "./SupersetEmbed";

const App = () => {
  const [companyId, setCompanyId] = useState("20008");
  const [submittedId, setSubmittedId] = useState("20008");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedId(companyId);
  };

  return (
    <div className="p-4">
      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 mb-4 items-center justify-center"
      >
        <input
          type="text"
          placeholder="Enter Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="border p-2 rounded w-60"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Load Dashboard
        </button>
      </form>

      {/* Embed Superset */}
      <SupersetEmbed companyId={submittedId} />
    </div>
  );
};

export default App;
