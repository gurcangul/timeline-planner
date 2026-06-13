import { ACTIVITY_TYPE_LIST } from "@/constants";

export function PlannerHeader() {
  return (
    <header style={headerStyle}>
      <div>
        <div style={kickerStyle}>İÇ KONTROL · DENETİM PLANI</div>
        <h1 style={h1Style}>Saha Çizelgesi</h1>
      </div>
      <div style={legendStyle}>
        {ACTIVITY_TYPE_LIST.map((type) => (
          <span key={type.id} style={legendItemStyle}>
            <span style={{ ...swatchStyle, background: type.color }} />
            {type.label}
            {type.pinned && " 🔒"}
          </span>
        ))}
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  flexWrap: "wrap",
  gap: 16,
  marginBottom: 4,
};

const kickerStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.12em",
  fontWeight: 700,
  color: "#64748B",
};

const h1Style: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 800,
  margin: "2px 0 0",
  letterSpacing: "-0.02em",
  color: "#0F172A",
};

const legendStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
  flexWrap: "wrap",
};

const legendItemStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12.5,
  color: "#475569",
  fontWeight: 500,
};

const swatchStyle: React.CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: 3,
  display: "inline-block",
};
