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
    <div style={overlay} onPointerDown={onCancel}>
      <div style={modal} onPointerDown={(e) => e.stopPropagation()}>
        <div style={iconWrap(danger)}>{danger ? "🗑" : "?"}</div>
        <div style={ttl}>{title}</div>
        <div style={msg}>{message}</div>
        <div style={footer}>
          <button style={ghostBtn} onClick={onCancel}>{cancelLabel}</button>
          <button
            style={{ ...primaryBtn, background: danger ? "#E11D48" : "#4F46E5" }}
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

// ── styles ────────────────────────────────────────────────────────────────────

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20,
};
const modal: React.CSSProperties = {
  background: "#fff", borderRadius: 16, width: 380, maxWidth: "100%",
  padding: 24, boxShadow: "0 24px 60px rgba(15,23,42,0.3)", boxSizing: "border-box",
  textAlign: "center",
};
const iconWrap = (danger: boolean): React.CSSProperties => ({
  width: 48, height: 48, borderRadius: 12, margin: "0 auto 14px",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 22, background: danger ? "#FCE5EA" : "#EEF0FF",
});
const ttl: React.CSSProperties = {
  fontSize: 17, fontWeight: 800, color: "#0F172A", marginBottom: 6,
};
const msg: React.CSSProperties = {
  fontSize: 13.5, color: "#64748B", lineHeight: 1.5, marginBottom: 20,
};
const footer: React.CSSProperties = {
  display: "flex", justifyContent: "center", gap: 10,
};
const ghostBtn: React.CSSProperties = {
  padding: "9px 18px", border: "1.5px solid #E2E8F0", background: "#fff",
  borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#475569",
};
const primaryBtn: React.CSSProperties = {
  padding: "9px 20px", border: "none", borderRadius: 10,
  fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#fff",
};
