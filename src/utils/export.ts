import * as XLSX from "xlsx";
import { ACTIVITY_TYPES, EMPLOYEES, SLOTS_PER_DAY } from "@/constants";
import { formatSlotDateTime } from "@/utils/date";
import type { Assignment } from "@/types";

function slotDurationLabel(startSlot: number, endSlot: number): string {
  const total = endSlot - startSlot;
  const full = Math.floor(total / SLOTS_PER_DAY);
  const half = total % SLOTS_PER_DAY;
  const parts: string[] = [];
  if (full > 0) parts.push(`${full} tam gün`);
  if (half > 0) parts.push("½ gün");
  return parts.join(" + ");
}

export interface ExportParams {
  employeeIds: string[];
  startSlot: number;
  endSlot: number;
  assignments: Assignment[];
  allDays: Date[];
}

export function exportToXlsx(params: ExportParams, filename = "denetim-plani.xlsx") {
  const { employeeIds, startSlot, endSlot, assignments, allDays } = params;

  const empMap = Object.fromEntries(EMPLOYEES.map((e) => [e.id, e]));

  const rows = assignments
    .filter(
      (a) =>
        employeeIds.includes(a.employeeId) &&
        a.startSlot < endSlot &&
        a.endSlot > startSlot
    )
    .sort((a, b) => {
      const empA = empMap[a.employeeId]?.name ?? "";
      const empB = empMap[b.employeeId]?.name ?? "";
      if (empA !== empB) return empA.localeCompare(empB, "tr");
      return a.startSlot - b.startSlot;
    });

  const headers = [
    "Denetçi",
    "Ünvan",
    "Aktivite Türü",
    "Başlangıç",
    "Bitiş",
    "Süre",
    "Açıklama",
  ];

  const data = rows.map((a) => {
    const emp = empMap[a.employeeId];
    const type = ACTIVITY_TYPES[a.typeId];
    return [
      emp?.name ?? a.employeeId,
      emp?.title ?? "",
      type?.label ?? a.typeId,
      formatSlotDateTime(a.startSlot, allDays),
      formatSlotDateTime(a.endSlot - 1, allDays),
      slotDurationLabel(a.startSlot, a.endSlot),
      a.label,
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Column widths
  ws["!cols"] = [28, 22, 22, 28, 28, 16, 32].map((w) => ({ wch: w }));

  // Header row style (bold background)
  const headerRange = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
  for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c })];
    if (cell) {
      cell.s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "1E293B" }, patternType: "solid" },
        alignment: { horizontal: "center" },
      };
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Denetim Planı");
  XLSX.writeFile(wb, filename);
}
