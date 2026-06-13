import { useState } from "react";
import { ACTIVITY_TYPE_LIST, ACTIVITY_TYPES, BRANCHES, EMPLOYEES } from "@/constants";
import {
  slotToDate,
  slotHalf,
  dateAndHalfToSlot,
  toInputDateString,
  fromInputDateString,
} from "@/utils/date";
import type { Assignment, ModalContext } from "@/types";

export interface SaveData {
  employeeId: string;
  typeId: string;
  label: string;
  startSlot: number;
  endSlot: number;
}

interface BaseProps {
  allDays: Date[];
  onClose: () => void;
  onSave: (data: SaveData) => boolean;
}

/** Boş slot seçim modalı — Gantt'ta sürükleyerek seçildi */
interface CreateProps extends BaseProps {
  mode: "create";
  ctx: ModalContext; // employeeId + slot range pre-filled
}

/** Toolbar "Plan Ekle" butonundan açılan modal — her şey boş */
interface ToolbarCreateProps extends BaseProps {
  mode: "create-toolbar";
}

/** Mevcut atamaya çift tıkla → düzenleme modalı */
interface EditProps extends BaseProps {
  mode: "edit";
  existing: Assignment;
  onDelete: () => void;
}

type Props = CreateProps | ToolbarCreateProps | EditProps;

export function AssignModal(props: Props) {
  const { allDays, onClose, onSave } = props;
  const isEdit = props.mode === "edit";
  const isToolbar = props.mode === "create-toolbar";
  const seed = isEdit ? props.existing : null;

  const initStartSlot = isEdit ? seed!.startSlot : isToolbar ? -1 : props.ctx.startSlot;
  const initEndSlot   = isEdit ? seed!.endSlot   : isToolbar ? -1 : props.ctx.endSlot;

  const initStartDate = initStartSlot >= 0 ? slotToDate(initStartSlot, allDays) : undefined;
  const initEndDate   = initEndSlot   >  0 ? slotToDate(initEndSlot - 1, allDays) : undefined;

  // ---- state ----
  const [employeeId, setEmployeeId] = useState(
    isEdit ? seed!.employeeId : isToolbar ? "" : props.ctx.employeeId
  );
  const [typeId, setTypeId]   = useState(isEdit ? seed!.typeId : "takip");
  const [branch, setBranch]   = useState(() => (isEdit && seed!.typeId === "sube" ? seed!.label : BRANCHES[0]!));
  const [label, setLabel]     = useState(() => (isEdit && seed!.typeId !== "sube" ? seed!.label : ""));
  const [hasError, setHasError] = useState(false);

  const [startDateStr, setStartDateStr] = useState(
    initStartDate ? toInputDateString(initStartDate) : ""
  );
  const [startHalf, setStartHalf] = useState<"am" | "pm">(
    initStartSlot >= 0 ? slotHalf(initStartSlot) : "am"
  );
  const [endDateStr, setEndDateStr] = useState(
    initEndDate ? toInputDateString(initEndDate) : ""
  );
  const [endHalf, setEndHalf] = useState<"am" | "pm">(
    initEndSlot > 0 ? slotHalf(initEndSlot - 1) : "pm"
  );

  const activeType = ACTIVITY_TYPES[typeId]!;

  const computedSlots = (): { startSlot: number; endSlot: number } | null => {
    if (!startDateStr || !endDateStr) return null;
    const ss = dateAndHalfToSlot(fromInputDateString(startDateStr), startHalf, allDays);
    const es = dateAndHalfToSlot(fromInputDateString(endDateStr), endHalf, allDays);
    if (ss < 0 || es < 0 || es + 1 <= ss) return null;
    return { startSlot: ss, endSlot: es + 1 };
  };

  const handleSave = () => {
    if (isToolbar && !employeeId) { setHasError(true); return; }
    if (typeId === "diger" && !label.trim()) { setHasError(true); return; }
    const slots = computedSlots();
    if (!slots) { setHasError(true); return; }
    const finalLabel =
      typeId === "sube"  ? branch :
      typeId === "diger" ? label.trim() :
      label || activeType.short;
    const resolvedEmpId = isEdit ? seed!.employeeId : employeeId;
    const ok = onSave({ employeeId: resolvedEmpId, typeId, label: finalLabel, ...slots });
    if (!ok) setHasError(true);
  };

  const slots = computedSlots();
  const minDate = allDays[0] ? toInputDateString(allDays[0]) : undefined;
  const maxDate = allDays[allDays.length - 1] ? toInputDateString(allDays[allDays.length - 1]!) : undefined;

  const title = isEdit ? "ATAMA DÜZENLE" : "YENİ ATAMA";

  return (
    <div style={overlayStyle} onPointerDown={onClose}>
      <div style={modalStyle} onPointerDown={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={headerStyle}>
          <div style={kickerStyle}>{title}</div>
          <div style={{ display: "flex", gap: 8 }}>
            {isEdit && (
              <button style={deleteBtnStyle}
                onClick={() => { (props as EditProps).onDelete(); onClose(); }}
                title="Atamayı sil">🗑</button>
            )}
            <button style={closeBtnStyle} onClick={onClose}>×</button>
          </div>
        </div>

        {/* Employee selector — only in toolbar mode */}
        {isToolbar && (
          <>
            <label style={fieldLabel}>Denetçi</label>
            <select
              value={employeeId}
              onChange={(e) => { setEmployeeId(e.target.value); setHasError(false); }}
              style={inputStyle}
            >
              <option value="">— Seçiniz —</option>
              {EMPLOYEES.map((e) => (
                <option key={e.id} value={e.id}>{e.name} · {e.title}</option>
              ))}
            </select>
          </>
        )}

        {/* Date range */}
        <div style={dateRow}>
          <div style={datePicker}>
            <label style={fieldLabel}>Başlangıç</label>
            <div style={dateInputRow}>
              <input type="date" value={startDateStr} min={minDate} max={maxDate}
                onChange={(e) => { setStartDateStr(e.target.value); setHasError(false); }}
                style={dateInputStyle} />
              <select value={startHalf} onChange={(e) => setStartHalf(e.target.value as "am" | "pm")} style={halfSel}>
                <option value="am">ÖÖ</option>
                <option value="pm">ÖS</option>
              </select>
            </div>
          </div>
          <div style={{ fontSize: 18, color: "#94A3B8", paddingTop: 22 }}>→</div>
          <div style={datePicker}>
            <label style={fieldLabel}>Bitiş</label>
            <div style={dateInputRow}>
              <input type="date" value={endDateStr} min={startDateStr || minDate} max={maxDate}
                onChange={(e) => { setEndDateStr(e.target.value); setHasError(false); }}
                style={dateInputStyle} />
              <select value={endHalf} onChange={(e) => setEndHalf(e.target.value as "am" | "pm")} style={halfSel}>
                <option value="am">ÖÖ</option>
                <option value="pm">ÖS</option>
              </select>
            </div>
          </div>
        </div>

        {slots === null && startDateStr && endDateStr && (
          <div style={errorNote}>Bitiş başlangıçtan önce olamaz.</div>
        )}

        {/* Activity type */}
        <label style={fieldLabel}>Aktivite türü</label>
        <div style={typeGrid}>
          {ACTIVITY_TYPE_LIST.map((type) => {
            const sel = typeId === type.id;
            return (
              <button key={type.id}
                onClick={() => { setTypeId(type.id); setHasError(false); }}
                style={{ ...typeBtn, borderColor: sel ? type.color : "#E2E8F0",
                  background: sel ? type.softColor : "#fff", color: sel ? type.color : "#475569" }}>
                <span style={{ ...swatch, background: type.color }} />
                {type.label}{type.pinned && " 🔒"}
              </button>
            );
          })}
        </div>

        {typeId === "sube" ? (
          <>
            <label style={fieldLabel}>Şube</label>
            <select value={branch} onChange={(e) => setBranch(e.target.value)} style={inputStyle}>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </>
        ) : typeId === "diger" ? (
          <>
            <label style={fieldLabel}>
              Açıklama <span style={{ color: "#E11D48", marginLeft: 2 }}>*</span>
            </label>
            <input
              value={label}
              onChange={(e) => { setLabel(e.target.value); setHasError(false); }}
              placeholder="Ne yapılıyor? (zorunlu)"
              style={{ ...inputStyle, borderColor: hasError && !label.trim() ? "#E11D48" : "#E2E8F0" }}
            />
          </>
        ) : (
          <>
            <label style={fieldLabel}>Açıklama (opsiyonel)</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder={activeType.short} style={inputStyle} />
          </>
        )}

        {activeType.pinned && (
          <div style={pinNote}>
            Bu tür sabit çapadır — eklendikten sonra kaydırılamaz, diğer planlar etrafından akar.
          </div>
        )}
        {hasError && (
          <div style={errorNote}>
            {isToolbar && !employeeId
              ? "Lütfen bir denetçi seçin."
              : typeId === "diger" && !label.trim()
              ? "Diğer türü için açıklama zorunludur."
              : "Sabit bir plana çakışıyor veya tarih aralığı geçersiz."}
          </div>
        )}

        <div style={footer}>
          <button style={ghostBtn} onClick={onClose}>Vazgeç</button>
          <button style={{ ...primaryBtn, background: activeType.color,
            opacity: (!isToolbar || employeeId) && slots !== null ? 1 : 0.45 }}
            onClick={handleSave}
            disabled={(!isToolbar || !!employeeId) && slots === null}>
            {isEdit ? "Değişiklikleri kaydet" : "Atamayı kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── styles ──────────────────────────────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20,
};
const modalStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 16, width: 470, maxWidth: "100%",
  padding: 22, boxShadow: "0 24px 60px rgba(15,23,42,0.3)", boxSizing: "border-box",
};
const headerStyle: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
};
const kickerStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: "0.12em", fontWeight: 700, color: "#64748B",
};
const closeBtnStyle: React.CSSProperties = {
  border: "none", background: "#F1F5F9", width: 30, height: 30,
  borderRadius: 8, fontSize: 18, cursor: "pointer", color: "#475569",
};
const deleteBtnStyle: React.CSSProperties = {
  border: "none", background: "#FEE2E2", width: 30, height: 30,
  borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#B91C1C",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const dateRow: React.CSSProperties = {
  display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 4,
};
const datePicker: React.CSSProperties = { flex: 1, minWidth: 0 };
const dateInputRow: React.CSSProperties = { display: "flex", gap: 4 };
const dateInputStyle: React.CSSProperties = {
  flex: 1, padding: "8px 8px", border: "1.5px solid #E2E8F0", borderRadius: 8,
  fontSize: 12.5, boxSizing: "border-box", minWidth: 0,
  fontFamily: "Inter,-apple-system,sans-serif", color: "#0F172A",
};
const halfSel: React.CSSProperties = {
  padding: "8px 5px", border: "1.5px solid #E2E8F0", borderRadius: 8,
  fontSize: 12, cursor: "pointer", background: "#F8FAFC", color: "#475569", fontWeight: 600,
};
const fieldLabel: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600, color: "#475569", margin: "12px 0 6px",
};
const typeGrid: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
};
const typeBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "9px 11px",
  border: "1.5px solid", borderRadius: 10, fontSize: 12, fontWeight: 600,
  cursor: "pointer", textAlign: "left", background: "#fff",
};
const swatch: React.CSSProperties = {
  width: 11, height: 11, borderRadius: 3, display: "inline-block", flexShrink: 0,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 11px", border: "1.5px solid #E2E8F0", borderRadius: 10,
  fontSize: 13, boxSizing: "border-box", fontFamily: "Inter,-apple-system,sans-serif",
};
const pinNote: React.CSSProperties = {
  marginTop: 10, fontSize: 12, color: "#B45309", background: "#FEF3E2",
  padding: "8px 12px", borderRadius: 9, lineHeight: 1.45,
};
const errorNote: React.CSSProperties = {
  marginTop: 8, fontSize: 12, color: "#BE123C", background: "#FCE5EA",
  padding: "8px 12px", borderRadius: 9, lineHeight: 1.45,
};
const footer: React.CSSProperties = {
  display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18,
};
const ghostBtn: React.CSSProperties = {
  padding: "9px 15px", border: "1.5px solid #E2E8F0", background: "#fff",
  borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#475569",
};
const primaryBtn: React.CSSProperties = {
  padding: "9px 17px", border: "none", borderRadius: 10,
  fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#fff",
};
