import SupersetEmbed from "./SupersetEmbed";

function App() {
  // Example: companyId can come from login-free input
  const companyId = 20008;

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <SupersetEmbed companyId={companyId} />
    </div>
  );
}

export default App;
