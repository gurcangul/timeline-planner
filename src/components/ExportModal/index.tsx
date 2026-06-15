import { useState, useMemo } from "react";
import { EMPLOYEES } from "@/constants";
import {
  toInputDateString,
  slotRangeFromInputs,
  getInitials,
  monthRange,
  quarterRange,
  yearRange,
} from "@/utils/date";
import { exportToXlsx } from "@/utils/export";
import type { Assignment } from "@/types";

interface Props {
  assignments: Assignment[];
  allDays: Date[];
  onClose: () => void;
}

export function ExportModal({ assignments, allDays, onClose }: Props) {
  const today = new Date();
  const initial = monthRange(today);

  const [startStr, setStartStr] = useState(toInputDateString(initial.start));
  const [endStr, setEndStr] = useState(toInputDateString(initial.end));
  const [selected, setSelected] = useState<Set<string>>(
    new Set(EMPLOYEES.map((e) => e.id))
  );

  const minDate = allDays[0] ? toInputDateString(allDays[0]) : undefined;
  const maxDate = allDays[allDays.length - 1] ? toInputDateString(allDays[allDays.length - 1]!) : undefined;

  const slotRange = useMemo(
    () => slotRangeFromInputs(startStr, endStr, allDays),
    [startStr, endStr, allDays]
  );

  const matchCount = useMemo(() => {
    if (!slotRange) return 0;
    return assignments.filter(
      (a) =>
        selected.has(a.employeeId) &&
        a.startSlot < slotRange[1] &&
        a.endSlot > slotRange[0]
    ).length;
  }, [assignments, selected, slotRange]);

  const toggleAll = () => {
    if (selected.size === EMPLOYEES.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(EMPLOYEES.map((e) => e.id)));
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleExport = () => {
    if (!slotRange || selected.size === 0) return;
    exportToXlsx({
      employeeIds: Array.from(selected),
      startSlot: slotRange[0],
      endSlot: slotRange[1],
      assignments,
      allDays,
    });
    onClose();
  };

  const allSelected = selected.size === EMPLOYEES.length;

  return (
    <div style={overlay} onPointerDown={onClose}>
      <div style={modal} onPointerDown={(e) => e.stopPropagation()}>
        <div style={header}>
          <div>
            <div style={kicker}>DIŞA AKTAR</div>
            <div style={title}>Excel Raporu</div>
          </div>
          <button style={closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Date range */}
        <label style={lbl}>Tarih aralığı</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" value={startStr} min={minDate} max={maxDate}
            onChange={(e) => setStartStr(e.target.value)} style={dateInput} />
          <span style={{ color: "#94A3B8" }}>–</span>
          <input type="date" value={endStr} min={startStr} max={maxDate}
            onChange={(e) => setEndStr(e.target.value)} style={dateInput} />
        </div>

        {/* Quick date presets */}
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {[
            { label: "Bu ay", ...monthRange(today) },
            { label: "Bu çeyrek", ...quarterRange(today) },
            { label: "Bu yıl", ...yearRange(today) },
          ].map(({ label, start, end }) => {
            const active =
              toInputDateString(start) === startStr && toInputDateString(end) === endStr;
            return (
            <button key={label} style={{ ...presetBtn, ...(active ? presetBtnActive : {}) }}
              onClick={() => { setStartStr(toInputDateString(start)); setEndStr(toInputDateString(end)); }}>
              {label}
            </button>
            );
          })}
        </div>

        {/* Employee list */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 6 }}>
          <label style={{ ...lbl, margin: 0 }}>Denetçiler</label>
          <button style={toggleAllBtn} onClick={toggleAll}>
            {allSelected ? "Tümünü kaldır" : "Tümünü seç"}
          </button>
        </div>
        <div style={empList}>
          {EMPLOYEES.map((emp) => {
            const checked = selected.has(emp.id);
            return (
              <label key={emp.id} style={{ ...empRow, background: checked ? "#F1F5F9" : "#fff" }}>
                <input type="checkbox" checked={checked} onChange={() => toggle(emp.id)}
                  style={{ accentColor: "#4F46E5", flexShrink: 0 }} />
                <span style={avatar}>{getInitials(emp.name)}</span>
                <span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{emp.name}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{emp.title}</div>
                </span>
              </label>
            );
          })}
        </div>

        {/* Summary */}
        <div style={summary}>
          {slotRange
            ? `${matchCount} atama · ${selected.size} denetçi`
            : "Tarih aralığı seçin"}
        </div>

        <div style={foot}>
          <button style={ghostBtn} onClick={onClose}>Vazgeç</button>
          <button
            style={{ ...primaryBtn, opacity: slotRange && selected.size > 0 && matchCount > 0 ? 1 : 0.4 }}
            disabled={!slotRange || selected.size === 0 || matchCount === 0}
            onClick={handleExport}>
            ⬇ Excel İndir
          </button>
        </div>
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
  background: "#fff", borderRadius: 16, width: 440, maxWidth: "100%",
  padding: 22, boxShadow: "0 24px 60px rgba(15,23,42,0.3)", boxSizing: "border-box",
};
const header: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 };
const kicker: React.CSSProperties = { fontSize: 11, letterSpacing: "0.12em", fontWeight: 700, color: "#64748B" };
const title: React.CSSProperties = { fontSize: 18, fontWeight: 800, color: "#0F172A", marginTop: 2 };
const closeBtn: React.CSSProperties = { border: "none", background: "#F1F5F9", width: 30, height: 30, borderRadius: 8, fontSize: 18, cursor: "pointer", color: "#475569" };
const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 };
const dateInput: React.CSSProperties = { flex: 1, padding: "8px 10px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 13, boxSizing: "border-box", fontFamily: "Inter,-apple-system,sans-serif" };
const presetBtn: React.CSSProperties = { padding: "4px 10px", border: "1.5px solid #E2E8F0", borderRadius: 20, fontSize: 11.5, background: "#F8FAFC", cursor: "pointer", color: "#475569", fontWeight: 600 };
const presetBtnActive: React.CSSProperties = { background: "#0D9488", borderColor: "#0D9488", color: "#fff" };
const empList: React.CSSProperties = { maxHeight: 220, overflowY: "auto", border: "1px solid #E2E8F0", borderRadius: 10 };
const empRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", cursor: "pointer", borderBottom: "1px solid #F1F5F9" };
const avatar: React.CSSProperties = { width: 28, height: 28, minWidth: 28, borderRadius: 7, background: "#1E293B", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 };
const toggleAllBtn: React.CSSProperties = { border: "none", background: "none", fontSize: 11.5, color: "#4F46E5", fontWeight: 600, cursor: "pointer" };
const summary: React.CSSProperties = { marginTop: 12, fontSize: 12.5, color: "#64748B", textAlign: "center", fontWeight: 500 };
const foot: React.CSSProperties = { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 };
const ghostBtn: React.CSSProperties = { padding: "9px 15px", border: "1.5px solid #E2E8F0", background: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#475569" };
const primaryBtn: React.CSSProperties = { padding: "9px 18px", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#fff", background: "#0D9488" };
