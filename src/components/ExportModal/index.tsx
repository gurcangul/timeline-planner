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
import base from "@/styles/modalBase.module.css";
import styles from "./ExportModal.module.css";

const ACCENT = "var(--c-accent)";

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
    <div className={base.overlay} onPointerDown={onClose}>
      <div className={styles.card} onPointerDown={(e) => e.stopPropagation()}>
        <div className={base.header}>
          <div>
            <div className={base.kicker}>DIŞA AKTAR</div>
            <div className={base.title}>Excel Raporu</div>
          </div>
          <button className={base.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Date range */}
        <label className={base.fieldLabel}>Tarih aralığı</label>
        <div className={styles.dateRow}>
          <input type="date" value={startStr} min={minDate} max={maxDate}
            onChange={(e) => setStartStr(e.target.value)} className={base.dateInput} />
          <span className={styles.dash}>–</span>
          <input type="date" value={endStr} min={startStr} max={maxDate}
            onChange={(e) => setEndStr(e.target.value)} className={base.dateInput} />
        </div>

        {/* Quick date presets */}
        <div className={styles.presetRow}>
          {[
            { label: "Bu ay", ...monthRange(today) },
            { label: "Bu çeyrek", ...quarterRange(today) },
            { label: "Bu yıl", ...yearRange(today) },
          ].map(({ label, start, end }) => {
            const active =
              toInputDateString(start) === startStr && toInputDateString(end) === endStr;
            return (
              <button
                key={label}
                className={`${base.presetBtn} ${active ? base.presetBtnActive : ""}`}
                style={active ? { ["--preset-active-bg" as string]: ACCENT } : undefined}
                onClick={() => { setStartStr(toInputDateString(start)); setEndStr(toInputDateString(end)); }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Employee list */}
        <div className={styles.listHead}>
          <label className={`${base.fieldLabel} ${styles.listHeadLabel}`}>Denetçiler</label>
          <button className={styles.toggleAllBtn} onClick={toggleAll}>
            {allSelected ? "Tümünü kaldır" : "Tümünü seç"}
          </button>
        </div>
        <div className={styles.empList}>
          {EMPLOYEES.map((emp) => {
            const checked = selected.has(emp.id);
            return (
              <label
                key={emp.id}
                className={`${styles.empRow} ${checked ? styles.empRowChecked : ""}`}
              >
                <input type="checkbox" checked={checked} onChange={() => toggle(emp.id)}
                  className={styles.checkbox} />
                <span className={styles.avatar}>{getInitials(emp.name)}</span>
                <span>
                  <div className={styles.empName}>{emp.name}</div>
                  <div className={styles.empTitle}>{emp.title}</div>
                </span>
              </label>
            );
          })}
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          {slotRange
            ? `${matchCount} atama · ${selected.size} denetçi`
            : "Tarih aralığı seçin"}
        </div>

        <div className={base.footer}>
          <button className={base.ghostBtn} onClick={onClose}>Vazgeç</button>
          <button
            className={base.primaryBtn}
            style={{ ["--primary-bg" as string]: ACCENT }}
            disabled={!slotRange || selected.size === 0 || matchCount === 0}
            onClick={handleExport}>
            ⬇ Excel İndir
          </button>
        </div>
      </div>
    </div>
  );
}
