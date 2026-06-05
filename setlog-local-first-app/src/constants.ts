import type { CaptureDuration, Mood } from "./types";

export const APP_DISPLAY_NAME = "DaySlot Local";
export const DAY_SLOT_ALBUM = "DaySlot";
export const EXPORT_ALBUM = "DaySlot Exports";
export const DEFAULT_ROOM_ID = "room-local-circle";

export const CAPTURE_DURATIONS: CaptureDuration[] = [2, 3, 4];

export const MOODS: { value: Mood; label: string }[] = [
  { value: "clear", label: "Clear" },
  { value: "busy", label: "Busy" },
  { value: "social", label: "Social" },
  { value: "focus", label: "Focus" },
];
