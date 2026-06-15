import { useState, useMemo } from "react";
import { EMPLOYEES, ACTIVITY_TYPES, ACTIVITY_TYPE_LIST } from "@/constants";
import {
  toInputDateString,
  slotRangeFromInputs,
  getInitials,
  monthRange,
  weekRange,
  quarterRange,
} from "@/utils/date";
import {
  computeStats,
  statsToSlices,
  rangeSlotCount,
  UNPLANNED_LABEL,
} from "@/utils/statistics";
import { PieChart } from "@/components/PieChart";
import type { Assignment } from "@/types";

interface Props {
  /** Single employee id or 'all' for the header-click view */
  target: string | "all";
  assignments: Assignment[];
  allDays: Date[];
  onClose: () => void;
}

export function StatModal({ target, assignments, allDays, onClose }: Props) {
  const today = new Date();
  const initial = monthRange(today);
  const [startStr, setStartStr] = useState(toInputDateString(initial.start));
  const [endStr, setEndStr] = useState(toInputDateString(initial.end));

  const isAll = target === "all";
  const targetEmployee = isAll ? null : EMPLOYEES.find((e) => e.id === target);
  const employeeIds = isAll ? EMPLOYEES.map((e) => e.id) : [target];

  // Statistics clamp a pre-epoch start to slot 0 so "this month" still resolves.
  const slotRange = useMemo(
    () => slotRangeFromInputs(startStr, endStr, allDays, true),
    [startStr, endStr, allDays]
  );

  const minDate = allDays[0] ? toInputDateString(allDays[0]) : undefined;
  const maxDate = allDays[allDays.length - 1] ? toInputDateString(allDays[allDays.length - 1]!) : undefined;

  // ── single employee view ──────────────────────────────────────────────────
  const singleStats = useMemo(() => {
    if (isAll || !slotRange) return null;
    return computeStats(assignments, [target], slotRange[0], slotRange[1]);
  }, [isAll, assignments, target, slotRange]);

  const singleSlices = useMemo(() => {
    if (!singleStats || !slotRange) return [];
    return statsToSlices(singleStats, rangeSlotCount(slotRange[0], slotRange[1]));
  }, [singleStats, slotRange]);

  // ── all-employees view ────────────────────────────────────────────────────
  const allStats = useMemo(() => {
    if (!isAll || !slotRange) return null;
    return EMPLOYEES.map((emp) => ({
      emp,
      stats: computeStats(assignments, [emp.id], slotRange[0], slotRange[1]),
    }));
  }, [isAll, assignments, slotRange]);

  const presets = [
    { label: "Bu hafta", ...weekRange(today) },
    { label: "Bu ay", ...monthRange(today) },
    { label: "Bu çeyrek", ...quarterRange(today) },
  ];

  return (
    <div style={overlay} onPointerDown={onClose}>
      <div style={{ ...modal, width: isAll ? 680 : 460 }} onPointerDown={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={hdr}>
          <div>
            <div style={kicker}>İSTATİSTİK</div>
            <div style={ttl}>
              {isAll ? "Tüm Denetçiler" : targetEmployee?.name ?? "—"}
            </div>
            {!isAll && targetEmployee && (
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{targetEmployee.title}</div>
            )}
          </div>
          <button style={closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Date range controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
          <input type="date" value={startStr} min={minDate} max={maxDate}
            onChange={(e) => setStartStr(e.target.value)} style={dateInput} />
          <span style={{ color: "#94A3B8" }}>–</span>
          <input type="date" value={endStr} min={startStr} max={maxDate}
            onChange={(e) => setEndStr(e.target.value)} style={dateInput} />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
          {presets.map(({ label, start, end }) => (
            <button key={label} style={presetBtn}
              onClick={() => { setStartStr(toInputDateString(start)); setEndStr(toInputDateString(end)); }}>
              {label}
            </button>
          ))}
        </div>

        {!slotRange && (
          <div style={{ textAlign: "center", color: "#94A3B8", padding: "20px 0" }}>Tarih aralığı seçin</div>
        )}

        {/* ── Single employee ─────────────────────────────────────────────── */}
        {!isAll && slotRange && singleStats && (
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <PieChart slices={singleSlices} size={180} />
            <div style={{ flex: 1 }}>
              {singleSlices.map((s) => {
                const total = singleSlices.reduce((a, b) => a + b.value, 0);
                const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                const days = (s.value / 2).toFixed(1);
                return (
                  <div key={s.label} style={legendRow}>
                    <span style={{ ...dot, background: s.color }} />
                    <span style={{ flex: 1, fontSize: 13, color: "#0F172A", fontWeight: 500 }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: "#64748B", marginRight: 8 }}>{days} gün</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", minWidth: 36, textAlign: "right" }}>{pct}%</span>
                  </div>
                );
              })}
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #F1F5F9", fontSize: 12, color: "#64748B" }}>
                Toplam: {((slotRange[1] - slotRange[0]) / 2).toFixed(0)} iş günü
              </div>
            </div>
          </div>
        )}

        {/* ── All employees ───────────────────────────────────────────────── */}
        {isAll && slotRange && allStats && (
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <div style={allGrid}>
              {allStats.map(({ emp, stats }) => {
                const slices = statsToSlices(stats, rangeSlotCount(slotRange[0], slotRange[1]));
                const hasData = slices.some((s) => s.label !== UNPLANNED_LABEL && s.value > 0);
                return (
                  <div key={emp.id} style={empCard}>
                    <div style={cardHead}>
                      <span style={cardAvatar}>{getInitials(emp.name)}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{emp.name}</div>
                        <div style={{ fontSize: 10.5, color: "#94A3B8" }}>{emp.title}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
                      <PieChart slices={slices} size={90} />
                    </div>
                    {hasData && (
                      <div>
                        {slices.filter(s => s.label !== UNPLANNED_LABEL).map((s) => {
                          const total = slices.reduce((a, b) => a + b.value, 0);
                          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                          return (
                            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                              <span style={{ ...dot, width: 7, height: 7, background: s.color, flexShrink: 0 }} />
                              <span style={{ fontSize: 10.5, color: "#475569", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {ACTIVITY_TYPES[ACTIVITY_TYPE_LIST.find(t => t.label === s.label)?.id ?? ""]?.short ?? s.label}
                              </span>
                              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#0F172A" }}>{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {!hasData && (
                      <div style={{ fontSize: 11, color: "#94A3B8", textAlign: "center" }}>Plan yok</div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Combined bar across all employees */}
            {slotRange && (
              <div style={{ marginTop: 16, padding: "12px 14px", background: "#F8FAFC", borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>Tüm ekip dağılımı</div>
                {(() => {
                  const combined = computeStats(assignments, employeeIds, slotRange[0], slotRange[1]);
                  const total = Array.from(combined.values()).reduce((a, b) => a + b, 0);
                  return (
                    <>
                      <div style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden", gap: 1 }}>
                        {ACTIVITY_TYPE_LIST.filter(t => (combined.get(t.id) ?? 0) > 0).map((t) => (
                          <div key={t.id} title={`${t.label}: ${Math.round((combined.get(t.id)! / total) * 100)}%`}
                            style={{ flex: combined.get(t.id), background: t.color }} />
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 7 }}>
                        {ACTIVITY_TYPE_LIST.filter(t => (combined.get(t.id) ?? 0) > 0).map((t) => (
                          <span key={t.id} style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ ...dot, width: 8, height: 8, background: t.color }} />
                            {t.short} · {Math.round((combined.get(t.id)! / total) * 100)}%
                          </span>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20,
};
const modal: React.CSSProperties = {
  background: "#fff", borderRadius: 16, maxWidth: "100%",
  padding: 22, boxShadow: "0 24px 60px rgba(15,23,42,0.3)", boxSizing: "border-box",
};
const hdr: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 };
const kicker: React.CSSProperties = { fontSize: 11, letterSpacing: "0.12em", fontWeight: 700, color: "#64748B" };
const ttl: React.CSSProperties = { fontSize: 18, fontWeight: 800, color: "#0F172A", marginTop: 2 };
const closeBtn: React.CSSProperties = { border: "none", background: "#F1F5F9", width: 30, height: 30, borderRadius: 8, fontSize: 18, cursor: "pointer", color: "#475569" };
const dateInput: React.CSSProperties = { flex: 1, padding: "7px 9px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 12.5, boxSizing: "border-box", fontFamily: "Inter,-apple-system,sans-serif" };
const presetBtn: React.CSSProperties = { padding: "4px 10px", border: "1.5px solid #E2E8F0", borderRadius: 20, fontSize: 11.5, background: "#F8FAFC", cursor: "pointer", color: "#475569", fontWeight: 600 };
const legendRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 };
const dot: React.CSSProperties = { width: 10, height: 10, borderRadius: "50%", flexShrink: 0, display: "inline-block" };
const allGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 };
const empCard: React.CSSProperties = { border: "1px solid #E2E8F0", borderRadius: 12, padding: "12px 10px" };
const cardHead: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, marginBottom: 4 };
const cardAvatar: React.CSSProperties = { width: 26, height: 26, minWidth: 26, borderRadius: 7, background: "#1E293B", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, fontWeight: 700 };
