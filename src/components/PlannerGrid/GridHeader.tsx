import { DAY_W, HEADER_H, LEFT_W, DAYS_PER_WEEK } from "@/constants";
import { TR_DAY_NAMES, TR_MONTH_NAMES, isWeekend } from "@/utils/date";

interface Props {
  days: Date[];
  onHeaderClick?: () => void;
}

export function GridHeader({ days, onHeaderClick }: Props) {
  return (
    <div style={{ display: "flex", height: HEADER_H, position: "sticky", top: 0, zIndex: 5 }}>
      <div
        style={{ ...cornerStyle, cursor: onHeaderClick ? "pointer" : "default" }}
        onClick={onHeaderClick}
        title={onHeaderClick ? "Tüm denetçilerin istatistiklerini gör" : undefined}
      >
        Denetçi {onHeaderClick && <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 2 }}>📊</span>}
      </div>
      <div style={{ display: "flex" }}>
        {days.map((day, i) => {
          const isWeekStart = i % DAYS_PER_WEEK === 0 && i !== 0;
          const weekend = isWeekend(day);
          return (
            <div
              key={i}
              style={{
                ...dayCellStyle,
                background: weekend ? "#F1F2F6" : "#F8FAFC",
                ...(isWeekStart ? weekSepStyle : {}),
              }}
            >
              <span style={{ ...dowStyle, color: weekend ? "#9CA3AF" : "#94A3B8" }}>
                {TR_DAY_NAMES[day.getDay()]}
              </span>
              <span style={{ ...dayNumStyle, color: weekend ? "#9CA3AF" : "#0F172A" }}>
                {day.getDate()}
                <span style={monthStyle}> {TR_MONTH_NAMES[day.getMonth()]}</span>
              </span>
              <div style={halfMarkContainerStyle}>
                <span style={halfMarkStyle} />
                <span style={halfMarkStyle} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const cornerStyle: React.CSSProperties = {
  width: LEFT_W,
  minWidth: LEFT_W,
  position: "sticky",
  left: 0,
  zIndex: 6,
  background: "#F8FAFC",
  borderRight: "1px solid #E2E8F0",
  borderBottom: "1px solid #E2E8F0",
  display: "flex",
  alignItems: "center",
  padding: "0 18px",
  fontSize: 12,
  fontWeight: 700,
  color: "#475569",
  letterSpacing: "0.04em",
};

const dayCellStyle: React.CSSProperties = {
  width: DAY_W,
  borderRight: "1px solid #EEF2F6",
  borderBottom: "1px solid #E2E8F0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  padding: "6px 0",
};

const weekSepStyle: React.CSSProperties = {
  borderLeft: "2px solid #CBD5E1",
};

const dowStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  textTransform: "uppercase",
};

const dayNumStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.1,
};

const monthStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#94A3B8",
  fontWeight: 600,
};

const halfMarkContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: DAY_W - 14,
  marginTop: 3,
  opacity: 0.5,
};

const halfMarkStyle: React.CSSProperties = {
  width: 1,
  height: 4,
  background: "#94A3B8",
};
