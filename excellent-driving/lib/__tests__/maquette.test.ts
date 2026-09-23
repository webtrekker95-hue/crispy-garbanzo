import { layoutSituation, type RoadUser, type Situation } from "../maquette";

const user = (label: string, kind: RoadUser["kind"], from: RoadUser["from"], to: RoadUser["to"]): RoadUser => ({
  label, kind, from, to, hasPriority: true,
});
const paths = (situation: Situation) =>
  Object.fromEntries(layoutSituation(situation).map((s) => [s.user.label, s.path]));

// Expected paths are the reference SVGs from
// materiaalrijonderricht/verkeerssituaties_diagrammen_1-20_v5.html.
describe("layoutSituation", () => {
  it("draws straight-through cars 5px past the intersection", () => {
    expect(paths({ number: 1, bikeLanes: false, users: [user("1", "auto", "noord", "zuid"), user("2", "auto", "zuid", "noord")] }))
      .toEqual({ "1": "M230,78 L230,215", "2": "M190,222 L190,85" });
  });

  it("turns cars on the standard rows and depths", () => {
    expect(paths({ number: 3, bikeLanes: false, users: [user("1", "auto", "noord", "oost"), user("2", "auto", "zuid", "west")] }))
      .toEqual({ "1": "M230,78 L230,130 L280,130", "2": "M190,222 L190,170 L140,170" });
  });

  it("offsets two cars turning into the same road by ±6", () => {
    expect(paths({ number: 5, bikeLanes: false, users: [user("1", "auto", "noord", "oost"), user("2", "auto", "zuid", "oost")] }))
      .toEqual({ "1": "M230,78 L230,124 L280,124", "2": "M190,222 L190,136 L280,136" });
    expect(paths({ number: 8, bikeLanes: false, users: [user("1", "auto", "noord", "west"), user("2", "auto", "zuid", "west")] }))
      .toEqual({ "1": "M230,78 L230,164 L140,164", "2": "M190,222 L190,176 L140,176" });
  });

  it("always sends cyclists to the outer row, with or without a bike lane", () => {
    for (const bikeLanes of [false, true]) {
      expect(paths({ number: 20, bikeLanes, users: [user("f1", "fiets", "noord", "oost"), user("f2", "fiets", "zuid", "west")] }))
        .toEqual({ f1: "M258,67 L258,100 L280,100", f2: "M162,233 L162,200 L140,200" });
    }
  });

  it("does not offset a car that shares its road with a cyclist only", () => {
    expect(paths({ number: 14, bikeLanes: false, users: [user("1", "auto", "noord", "west"), user("f", "fiets", "noord", "west")] }))
      .toEqual({ "1": "M230,78 L230,170 L140,170", f: "M258,67 L258,200 L140,200" });
  });

  it("supports a car approaching from the west (situation 16)", () => {
    const [shape] = layoutSituation({ number: 16, bikeLanes: false, users: [user("1", "auto", "west", "zuid")] });
    expect(shape.path).toBe("M78,130 L230,130 L230,215");
    expect(shape.vehicle).toEqual({ type: "rect", x: 40, y: 120, width: 34, height: 20 });
  });

  it("rejects road users the template has no position for", () => {
    expect(() => layoutSituation({ number: 0, bikeLanes: false, users: [user("f", "fiets", "west", "oost")] })).toThrow();
    expect(() => layoutSituation({ number: 0, bikeLanes: false, users: [user("1", "auto", "noord", "noord")] })).toThrow();
  });
});
