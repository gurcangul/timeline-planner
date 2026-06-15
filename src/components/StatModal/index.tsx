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
import base from "@/styles/modalBase.module.css";
import styles from "./StatModal.module.css";

const PRIMARY = "var(--c-primary)";

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
    <div className={base.overlay} onPointerDown={onClose}>
      <div
        className={styles.card}
        style={{ width: isAll ? 680 : 460 }}
        onPointerDown={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className={base.header}>
          <div>
            <div className={base.kicker}>İSTATİSTİK</div>
            <div className={base.title}>
              {isAll ? "Tüm Denetçiler" : targetEmployee?.name ?? "—"}
            </div>
            {!isAll && targetEmployee && (
              <div className={styles.subtitle}>{targetEmployee.title}</div>
            )}
          </div>
          <button className={base.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Date range controls */}
        <div className={styles.dateRow}>
          <input type="date" value={startStr} min={minDate} max={maxDate}
            onChange={(e) => setStartStr(e.target.value)} className={base.dateInput} />
          <span className={styles.dash}>–</span>
          <input type="date" value={endStr} min={startStr} max={maxDate}
            onChange={(e) => setEndStr(e.target.value)} className={base.dateInput} />
        </div>
        <div className={styles.presetRow}>
          {presets.map(({ label, start, end }) => {
            const active =
              toInputDateString(start) === startStr && toInputDateString(end) === endStr;
            return (
              <button
                key={label}
                className={`${base.presetBtn} ${active ? base.presetBtnActive : ""}`}
                style={active ? { ["--preset-active-bg" as string]: PRIMARY } : undefined}
                onClick={() => { setStartStr(toInputDateString(start)); setEndStr(toInputDateString(end)); }}>
                {label}
              </button>
            );
          })}
        </div>

        {!slotRange && <div className={styles.empty}>Tarih aralığı seçin</div>}

        {/* ── Single employee ─────────────────────────────────────────────── */}
        {!isAll && slotRange && singleStats && (
          <div className={styles.single}>
            <PieChart slices={singleSlices} size={180} />
            <div className={styles.legend}>
              {singleSlices.map((s) => {
                const total = singleSlices.reduce((a, b) => a + b.value, 0);
                const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                const days = (s.value / 2).toFixed(1);
                return (
                  <div key={s.label} className={styles.legendRow}>
                    <span className={styles.dot} style={{ ["--dot-color" as string]: s.color }} />
                    <span className={styles.legendLabel}>{s.label}</span>
                    <span className={styles.legendDays}>{days} gün</span>
                    <span className={styles.legendPct}>{pct}%</span>
                  </div>
                );
              })}
              <div className={styles.total}>
                Toplam: {((slotRange[1] - slotRange[0]) / 2).toFixed(0)} iş günü
              </div>
            </div>
          </div>
        )}

        {/* ── All employees ───────────────────────────────────────────────── */}
        {isAll && slotRange && allStats && (
          <div className={styles.scrollArea}>
            <div className={styles.grid}>
              {allStats.map(({ emp, stats }) => {
                const slices = statsToSlices(stats, rangeSlotCount(slotRange[0], slotRange[1]));
                const hasData = slices.some((s) => s.label !== UNPLANNED_LABEL && s.value > 0);
                return (
                  <div key={emp.id} className={styles.empCard}>
                    <div className={styles.cardHead}>
                      <span className={styles.cardAvatar}>{getInitials(emp.name)}</span>
                      <div>
                        <div className={styles.cardName}>{emp.name}</div>
                        <div className={styles.cardTitle}>{emp.title}</div>
                      </div>
                    </div>
                    <div className={styles.cardChart}>
                      <PieChart slices={slices} size={90} />
                    </div>
                    {hasData ? (
                      <div>
                        {slices.filter(s => s.label !== UNPLANNED_LABEL).map((s) => {
                          const total = slices.reduce((a, b) => a + b.value, 0);
                          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                          return (
                            <div key={s.label} className={styles.cardLegendRow}>
                              <span className={styles.cardDot} style={{ ["--dot-color" as string]: s.color }} />
                              <span className={styles.cardLegendLabel}>
                                {ACTIVITY_TYPES[ACTIVITY_TYPE_LIST.find(t => t.label === s.label)?.id ?? ""]?.short ?? s.label}
                              </span>
                              <span className={styles.cardLegendPct}>{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={styles.noData}>Plan yok</div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Combined bar across all employees */}
            <div className={styles.combined}>
              <div className={styles.combinedTitle}>Tüm ekip dağılımı</div>
              {(() => {
                const combined = computeStats(assignments, employeeIds, slotRange[0], slotRange[1]);
                const total = Array.from(combined.values()).reduce((a, b) => a + b, 0);
                const present = ACTIVITY_TYPE_LIST.filter(t => (combined.get(t.id) ?? 0) > 0);
                return (
                  <>
                    <div className={styles.combinedBar}>
                      {present.map((t) => (
                        <div key={t.id} className={styles.combinedSeg}
                          title={`${t.label}: ${Math.round((combined.get(t.id)! / total) * 100)}%`}
                          style={{ flex: combined.get(t.id), ["--seg-bg" as string]: t.color }} />
                      ))}
                    </div>
                    <div className={styles.combinedLegend}>
                      {present.map((t) => (
                        <span key={t.id} className={styles.combinedLegendItem}>
                          <span className={styles.dot} style={{ width: 8, height: 8, ["--dot-color" as string]: t.color }} />
                          {t.short} · {Math.round((combined.get(t.id)! / total) * 100)}%
                        </span>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
