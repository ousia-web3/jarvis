export function toDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function toSlotKey(date = new Date()) {
  const hour = String(date.getHours()).padStart(2, "0");
  return `${toDayKey(date)}T${hour}`;
}

export function toShortTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
