import base from "@/styles/modalBase.module.css";
import styles from "./ConfirmModal.module.css";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true → onay butonu kırmızı (yıkıcı işlem) */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Sil",
  cancelLabel = "Vazgeç",
  danger = true,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className={styles.overlay} onPointerDown={onCancel}>
      <div className={styles.card} onPointerDown={(e) => e.stopPropagation()}>
        <div className={`${styles.icon} ${danger ? "" : styles.iconNeutral}`}>
          {danger ? "🗑" : "?"}
        </div>
        <div className={styles.title}>{title}</div>
        <div className={styles.message}>{message}</div>
        <div className={styles.footer}>
          <button className={base.ghostBtn} onClick={onCancel}>{cancelLabel}</button>
          <button
            className={base.primaryBtn}
            style={{ ["--primary-bg" as string]: danger ? "var(--c-danger)" : "var(--c-primary)" }}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
