import { PlannerHeader } from "@/components/PlannerHeader";
import { PlannerGrid } from "@/components/PlannerGrid";
import "./styles/global.css";
import styles from "./App.module.css";

export default function App() {
  return (
    <div className={styles.page}>
      <PlannerHeader />
      <p className={styles.hint}>
        Boş alanı <strong>sürükle</strong> → aralık seç → tür ata. &nbsp;
        Bar&apos;ı <strong>taşı</strong>, kenarından <strong>uzat</strong>. &nbsp;
        İzin/Sağlık raporu <strong>sabit çapadır</strong> (kaymaz). &nbsp;
        Tam gün = 2 yarım slot.
      </p>
      <PlannerGrid />
    </div>
  );
}
