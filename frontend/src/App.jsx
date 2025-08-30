import SupersetEmbed from "./SupersetEmbed";

function App() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {/* Example companyId */}
      <SupersetEmbed companyId={20008} />
    </div>
  );
}

export default App;
