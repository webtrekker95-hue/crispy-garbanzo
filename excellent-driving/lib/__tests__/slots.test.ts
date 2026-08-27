import { dayOfWeekCode, formatSlotLabel, parseSlotLabel, generateSlotMinutes } from "@/lib/slots";

describe("dayOfWeekCode", () => {
  it("maps a known Sunday to SUN", () => {
    // 2026-08-30 is a Sunday (confirmed against a real calendar).
    expect(dayOfWeekCode(new Date("2026-08-30T00:00:00Z"))).toBe("SUN");
  });

  it("maps a known Saturday to SAT", () => {
    expect(dayOfWeekCode(new Date("2026-08-29T00:00:00Z"))).toBe("SAT");
  });

  it("maps a known Monday to MON", () => {
    expect(dayOfWeekCode(new Date("2026-08-31T00:00:00Z"))).toBe("MON");
  });
});

describe("formatSlotLabel / parseSlotLabel round-trip", () => {
  const cases: [number, string][] = [
    [0, "12:00 AM"],
    [30, "12:30 AM"],
    [60, "1:00 AM"],
    [540, "9:00 AM"],
    [720, "12:00 PM"],
    [750, "12:30 PM"],
    [780, "1:00 PM"],
    [1020, "5:00 PM"],
    [1439, "11:59 PM"],
  ];

  it.each(cases)("formats %i minutes as %s", (minutes, label) => {
    expect(formatSlotLabel(minutes)).toBe(label);
  });

  it.each(cases)("parses %s back into %i minutes", (minutes, label) => {
    expect(parseSlotLabel(label)).toBe(minutes);
  });

  it("throws on a label it doesn't recognize, instead of silently returning garbage", () => {
    expect(() => parseSlotLabel("not a time")).toThrow();
  });
});

describe("generateSlotMinutes", () => {
  it("generates hourly slots that fully fit a 50-minute lesson in a 9-hour window", () => {
    const slots = generateSlotMinutes("08:00", "17:00", 50);
    // 08:00 through 16:00 fit (16:00 + 50min = 16:50, within 17:00); 17:00 would end at 17:50, excluded.
    expect(slots.map(formatSlotLabel)).toEqual([
      "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
      "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
    ]);
  });

  it("generates fewer slots for a shorter Saturday window", () => {
    const slots = generateSlotMinutes("09:00", "13:00", 50);
    expect(slots.map(formatSlotLabel)).toEqual(["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"]);
  });

  it("returns no slots when the window is shorter than one lesson", () => {
    expect(generateSlotMinutes("09:00", "09:30", 50)).toEqual([]);
  });

  it("returns exactly one slot when the window exactly fits one lesson", () => {
    expect(generateSlotMinutes("09:00", "09:50", 50)).toEqual([9 * 60]);
  });
});
