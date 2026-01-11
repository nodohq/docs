export default function App() {
    return (
      <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "250px 1fr 300px" }}>
        <aside style={{ borderRight: "1px solid #222", padding: 16 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#777" }}>LIBRARY</div>
          <p style={{ color: "#aaa", fontSize: 12 }}>Ticket #01 — placeholder</p>
        </aside>
  
        <main style={{ overflow: "hidden" }}>
          <div style={{ borderBottom: "1px solid #222", padding: 16 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "#777" }}>TIMELINE</div>
            <p style={{ color: "#aaa", fontSize: 12 }}>Ticket #01 — aucun drag / aucun snap</p>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ height: 1, background: "#222" }} />
          </div>
        </main>
  
        <aside style={{ borderLeft: "1px solid #222", padding: 16 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#777" }}>INSPECTOR</div>
          <p style={{ color: "#aaa", fontSize: 12 }}>Ticket #01 — read-only</p>
        </aside>
      </div>
    );
  }
  