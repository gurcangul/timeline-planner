/**
 * API katmanı genel giriş noktası.
 *
 * Bileşenlerden kullanım:
 *   import { useEmployees, useAssignmentsQuery } from "@/api";
 *
 * Backend hazır olduğunda bileşenler local `useAssignments` hook'undan bu
 * sunucu hook'larına geçirilecek. Şimdilik yalnızca iskelet olarak duruyor.
 */

export * from "./types";
export { http, ApiError, downloadBlob } from "./http";
export { queryClient } from "./queryClient";
export { qk } from "./queryKeys";

export * from "./resources/employees";
export * from "./resources/activityTypes";
export * from "./resources/branches";
export * from "./resources/assignments";
export * from "./resources/statistics";
