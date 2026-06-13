import { PlannerHeader } from "@/components/PlannerHeader";
import { PlannerGrid } from "@/components/PlannerGrid";
import "./styles/global.css";

export default function App() {
  return (
    <div style={pageStyle}>
      <PlannerHeader />
      <p style={hintStyle}>
        Boş alanı <strong>sürükle</strong> → aralık seç → tür ata. &nbsp;
        Bar&apos;ı <strong>taşı</strong>, kenarından <strong>uzat</strong>. &nbsp;
        İzin/Sağlık raporu <strong>sabit çapadır</strong> (kaymaz). &nbsp;
        Tam gün = 2 yarım slot.
      </p>
      <PlannerGrid />
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  color: "#0F172A",
  background: "#F1F5F9",
  minHeight: "100vh",
  padding: 24,
  boxSizing: "border-box",
};

const hintStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#64748B",
  margin: "12px 0 16px",
  lineHeight: 1.6,
  maxWidth: 880,
};
