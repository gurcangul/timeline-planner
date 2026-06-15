import { DAYS_PER_WEEK } from "@/constants";
import { TR_DAY_NAMES, TR_MONTH_NAMES, isWeekend } from "@/utils/date";
import styles from "./GridHeader.module.css";

interface Props {
  days: Date[];
  onHeaderClick?: () => void;
}

export function GridHeader({ days, onHeaderClick }: Props) {
  return (
    <div className={styles.header}>
      <div
        className={`${styles.corner} ${onHeaderClick ? styles.cornerClickable : ""}`}
        onClick={onHeaderClick}
        title={onHeaderClick ? "Tüm denetçilerin istatistiklerini gör" : undefined}
      >
        Denetçi {onHeaderClick && <span className={styles.statIcon}>📊</span>}
      </div>
      <div className={styles.days}>
        {days.map((day, i) => {
          const isWeekStart = i % DAYS_PER_WEEK === 0 && i !== 0;
          const weekend = isWeekend(day);
          return (
            <div
              key={i}
              className={[
                styles.dayCell,
                weekend ? styles.weekend : "",
                isWeekStart ? styles.weekStart : "",
              ].filter(Boolean).join(" ")}
            >
              <span className={`${styles.dow} ${weekend ? styles.dowWeekend : ""}`}>
                {TR_DAY_NAMES[day.getDay()]}
              </span>
              <span className={`${styles.dayNum} ${weekend ? styles.dayNumWeekend : ""}`}>
                {day.getDate()}
                <span className={styles.month}> {TR_MONTH_NAMES[day.getMonth()]}</span>
              </span>
              <div className={styles.halfMarks}>
                <span className={styles.halfMark} />
                <span className={styles.halfMark} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
