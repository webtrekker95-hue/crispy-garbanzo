const DAY_CODES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

export function dayOfWeekCode(date: Date) {
  return DAY_CODES[date.getUTCDay()];
}

export function formatSlotLabel(minutesSinceMidnight: number) {
  const hour24 = Math.floor(minutesSinceMidnight / 60);
  const minute = minutesSinceMidnight % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}

/** Parses a label like "9:00 AM" back into minutes since midnight. */
export function parseSlotLabel(label: string): number {
  const match = label.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error(`Unrecognized slot label: ${label}`);
  const [, hourStr, minuteStr, period] = match;
  let hour = Number(hourStr) % 12;
  if (period.toUpperCase() === "PM") hour += 12;
  return hour * 60 + Number(minuteStr);
}

function parseTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Hourly slot start times (minutes since midnight) that fit a full lesson within the schedule window. */
export function generateSlotMinutes(startTime: string, endTime: string, lessonDurationMinutes: number) {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const slots: number[] = [];
  for (let t = start; t + lessonDurationMinutes <= end; t += 60) {
    slots.push(t);
  }
  return slots;
}
