import { ACTIVITY_TYPE_LIST } from "@/constants";
import styles from "./PlannerHeader.module.css";

export function PlannerHeader() {
  return (
    <header className={styles.header}>
      <div>
        <div className={styles.kicker}>İÇ KONTROL · DENETİM PLANI</div>
        <h1 className={styles.title}>Saha Çizelgesi</h1>
      </div>
      <div className={styles.legend}>
        {ACTIVITY_TYPE_LIST.map((type) => (
          <span key={type.id} className={styles.legendItem}>
            <span
              className={styles.swatch}
              style={{ ["--swatch-color" as string]: type.color }}
            />
            {type.label}
            {type.pinned && " 🔒"}
          </span>
        ))}
      </div>
    </header>
  );
}
