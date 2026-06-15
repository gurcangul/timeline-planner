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
import base from "@/styles/modalBase.module.css";
import styles from "./AssignModal.module.css";

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
    <div className={base.overlay} onPointerDown={onClose}>
      <div className={styles.card} onPointerDown={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div className={base.kicker}>{title}</div>
          <div className={styles.headerActions}>
            {isEdit && (
              <button className={styles.deleteBtn}
                onClick={() => { (props as EditProps).onDelete(); onClose(); }}
                title="Atamayı sil">🗑</button>
            )}
            <button className={base.closeBtn} onClick={onClose}>×</button>
          </div>
        </div>

        {/* Employee selector — only in toolbar mode */}
        {isToolbar && (
          <>
            <label className={base.fieldLabel}>Denetçi</label>
            <select
              value={employeeId}
              onChange={(e) => { setEmployeeId(e.target.value); setHasError(false); }}
              className={base.input}
            >
              <option value="">— Seçiniz —</option>
              {EMPLOYEES.map((e) => (
                <option key={e.id} value={e.id}>{e.name} · {e.title}</option>
              ))}
            </select>
          </>
        )}

        {/* Date range */}
        <div className={styles.dateRow}>
          <div className={styles.datePicker}>
            <label className={base.fieldLabel}>Başlangıç</label>
            <div className={styles.dateInputRow}>
              <input type="date" value={startDateStr} min={minDate} max={maxDate}
                onChange={(e) => { setStartDateStr(e.target.value); setHasError(false); }}
                className={styles.dateInput} />
              <select value={startHalf} onChange={(e) => setStartHalf(e.target.value as "am" | "pm")} className={styles.halfSel}>
                <option value="am">ÖÖ</option>
                <option value="pm">ÖS</option>
              </select>
            </div>
          </div>
          <div className={styles.arrow}>→</div>
          <div className={styles.datePicker}>
            <label className={base.fieldLabel}>Bitiş</label>
            <div className={styles.dateInputRow}>
              <input type="date" value={endDateStr} min={startDateStr || minDate} max={maxDate}
                onChange={(e) => { setEndDateStr(e.target.value); setHasError(false); }}
                className={styles.dateInput} />
              <select value={endHalf} onChange={(e) => setEndHalf(e.target.value as "am" | "pm")} className={styles.halfSel}>
                <option value="am">ÖÖ</option>
                <option value="pm">ÖS</option>
              </select>
            </div>
          </div>
        </div>

        {slots === null && startDateStr && endDateStr && (
          <div className={styles.errorNote}>Bitiş başlangıçtan önce olamaz.</div>
        )}

        {/* Activity type */}
        <label className={base.fieldLabel}>Aktivite türü</label>
        <div className={styles.typeGrid}>
          {ACTIVITY_TYPE_LIST.map((type) => {
            const sel = typeId === type.id;
            return (
              <button key={type.id}
                onClick={() => { setTypeId(type.id); setHasError(false); }}
                className={`${styles.typeBtn} ${sel ? styles.typeBtnSelected : ""}`}
                style={{
                  ["--type-color" as string]: type.color,
                  ["--type-soft" as string]: type.softColor,
                }}>
                <span className={styles.swatch} />
                {type.label}{type.pinned && " 🔒"}
              </button>
            );
          })}
        </div>

        {typeId === "sube" ? (
          <>
            <label className={base.fieldLabel}>Şube</label>
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className={base.input}>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </>
        ) : typeId === "diger" ? (
          <>
            <label className={base.fieldLabel}>
              Açıklama <span className={styles.req}>*</span>
            </label>
            <input
              value={label}
              onChange={(e) => { setLabel(e.target.value); setHasError(false); }}
              placeholder="Ne yapılıyor? (zorunlu)"
              className={`${base.input} ${hasError && !label.trim() ? styles.inputError : ""}`}
            />
          </>
        ) : (
          <>
            <label className={base.fieldLabel}>Açıklama (opsiyonel)</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder={activeType.short} className={base.input} />
          </>
        )}

        {activeType.pinned && (
          <div className={styles.pinNote}>
            Bu tür sabit çapadır — eklendikten sonra kaydırılamaz, diğer planlar etrafından akar.
          </div>
        )}
        {hasError && (
          <div className={styles.errorNote}>
            {isToolbar && !employeeId
              ? "Lütfen bir denetçi seçin."
              : typeId === "diger" && !label.trim()
              ? "Diğer türü için açıklama zorunludur."
              : "Sabit bir plana çakışıyor veya tarih aralığı geçersiz."}
          </div>
        )}

        <div className={base.footer}>
          <button className={base.ghostBtn} onClick={onClose}>Vazgeç</button>
          <button
            className={base.primaryBtn}
            style={{ ["--primary-bg" as string]: activeType.color }}
            onClick={handleSave}
            disabled={(!isToolbar || !!employeeId) && slots === null}>
            {isEdit ? "Değişiklikleri kaydet" : "Atamayı kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
