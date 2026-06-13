export interface Employee {
  id: string;
  name: string;
  title: string;
}

export interface ActivityType {
  id: string;
  label: string;
  short: string;
  color: string;
  softColor: string;
  pinned: boolean;
}

export interface Assignment {
  id: string;
  employeeId: string;
  typeId: string;
  startSlot: number;
  endSlot: number;
  label: string;
}

export interface DragState {
  kind: "move" | "resize-l" | "resize-r";
  id: string;
  employeeId: string;
  startSlotF: number;
  origStart: number;
  origEnd: number;
}

export interface SelectState {
  kind: "select";
  employeeId: string;
  anchor: number;
}

export type ActiveDrag = DragState | SelectState;

export interface RowPreview {
  employeeId: string;
  segments: Assignment[];
}

export interface SelectionRange {
  employeeId: string;
  a: number;
  b: number;
}

export interface ModalContext {
  employeeId: string;
  startSlot: number;
  endSlot: number;
}

export type ResolveOutput = { ok: true; segments: Assignment[] } | { ok: false };
