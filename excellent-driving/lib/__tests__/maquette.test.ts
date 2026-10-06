import { layoutSituation, type RoadUser, type Situation } from "../maquette";
import { S } from "../../prisma/content/maquette-les-3";
import { S as S4 } from "../../prisma/content/maquette-les-4";
import { S as S5 } from "../../prisma/content/maquette-les-5";

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

  // Les 2, situations 30 and 31: road users from all four sides.
  it("shifts every turning road user off the standard lane in a four-way situation", () => {
    expect(paths({
      number: 30,
      bikeLanes: true,
      fourWay: true,
      users: [
        user("1", "auto", "noord", "west"), user("f2", "fiets", "noord", "zuid"),
        user("f3", "fiets", "west", "zuid"), user("4", "auto", "west", "noord"),
        user("5", "auto", "oost", "noord"), user("f8", "fiets", "oost", "noord"),
        user("f6", "fiets", "zuid", "oost"), user("7", "auto", "zuid", "oost"),
      ],
    })).toEqual({
      "1": "M230,78 L230,164 L140,164", f2: "M258,67 L258,215",
      f3: "M117,100 L252,100 L252,215", "4": "M78,130 L184,130 L184,85",
      "5": "M302,170 L196,170 L196,85", f8: "M283,200 L168,200 L168,85",
      f6: "M162,233 L162,106 L280,106", "7": "M190,222 L190,136 L280,136",
    });
  });

  it("places cars and cyclists on the east road and cyclists on the west road", () => {
    const shapes = layoutSituation({
      number: 31,
      bikeLanes: true,
      fourWay: true,
      users: [user("5", "auto", "oost", "zuid"), user("f6", "fiets", "oost", "noord"), user("f3", "fiets", "west", "zuid")],
    });
    expect(shapes.map((s) => s.vehicle)).toEqual([
      { type: "rect", x: 306, y: 160, width: 34, height: 20 },
      { type: "circle", cx: 290, cy: 200, r: 7 },
      { type: "circle", cx: 110, cy: 100, r: 7 },
    ]);
  });

  it("rejects road users the template has no position for", () => {
    expect(() => layoutSituation({ number: 0, bikeLanes: false, users: [user("f", "fiets", "west", "oost")] })).toThrow();
    expect(() => layoutSituation({ number: 0, bikeLanes: false, users: [user("1", "auto", "noord", "noord")] })).toThrow();
    expect(() => layoutSituation({ number: 0, bikeLanes: false, users: [user("5", "auto", "oost", "west")] })).toThrow();
    expect(() => layoutSituation({ number: 0, bikeLanes: false, fourWay: true, users: [user("5", "auto", "oost", "oost")] })).toThrow();
  });
});

// Les 3, brede wegen: two car lanes each way, laid out for an approach from
// the north and rotated into place.
describe("layoutSituation on a wide road", () => {
  const wide = (...users: RoadUser[]): Situation => ({ number: 0, wide: true, bikeLanes: false, users });

  it("puts a rechtsaffer in the inner lane and a linksaffer in the kerb lane", () => {
    expect(paths(wide(user("1", "auto", "noord", "west"), user("2", "auto", "noord", "oost"))))
      .toEqual({ "1": "M222,104 L222,216 L104,216", "2": "M252,104 L252,154 L296,154" });
  });

  it("rotates the same geometry for the other approaches", () => {
    expect(paths(wide(user("3", "auto", "zuid", "west"), user("5", "auto", "west", "noord"), user("7", "auto", "oost", "noord"))))
      .toEqual({
        "3": "M148,296 L148,246 L104,246",
        "5": "M104,148 L154,148 L154,104",
        "7": "M296,222 L184,222 L184,104",
      });
  });

  it("queues a second car in the same lane and runs its arrow alongside", () => {
    const [front, queued] = layoutSituation(wide(user("11", "auto", "zuid", "west"), user("13", "auto", "zuid", "west")));
    expect(front.vehicle).toEqual({ type: "rect", x: 138, y: 300, width: 20, height: 34 });
    expect(queued.vehicle).toEqual({ type: "rect", x: 138, y: 356, width: 20, height: 34 });
    expect(queued.path).toBe("M134,352 L134,258 L104,258");
  });

  it("draws a road user in the lane and row the situation asks for", () => {
    const [kerb, inner, opposite] = layoutSituation(wide(
      { ...user("2", "auto", "oost", "noord"), lane: "kerb" },
      { ...user("3", "auto", "west", "oost"), lane: "inner", behind: true },
      { ...user("4", "auto", "west", "zuid"), lane: "opposite" },
    ));
    expect(kerb.path).toBe("M296,252 L184,252 L184,104");
    // Nobody waits in front of 3 in its lane, so its arrow is not shifted.
    expect(inner.path).toBe("M48,178 L296,178");
    // Just across the centre line, in the half westbound traffic would use.
    expect(opposite.vehicle).toEqual({ type: "rect", x: 66, y: 212, width: 34, height: 20 });
  });

  it("rejects a road user on the missing arm of a T-kruising", () => {
    expect(() => layoutSituation({ ...wide(user("1", "auto", "zuid", "noord")), missingArm: "noord" })).toThrow(/missing arm/);
  });

  it("never draws two road users' paths on top of each other in les 3, 4 and 5", () => {
    for (const [key, situation] of [...Object.entries(S), ...Object.entries(S4), ...Object.entries(S5)]) {
      const segments = layoutSituation(situation).flatMap(({ user, path }) => {
        const pts = path.split(" ").map((p) => p.slice(1).split(",").map(Number));
        return pts.slice(1).map((b, i) => ({ who: user.label, a: pts[i], b }));
      });
      for (const s of segments) {
        for (const t of segments) {
          if (s.who >= t.who) continue;
          for (const axis of [0, 1]) {
            const along = 1 - axis;
            if (s.a[axis] !== s.b[axis] || t.a[axis] !== t.b[axis] || s.a[axis] !== t.a[axis]) continue;
            const lo = Math.max(Math.min(s.a[along], s.b[along]), Math.min(t.a[along], t.b[along]));
            const hi = Math.min(Math.max(s.a[along], s.b[along]), Math.max(t.a[along], t.b[along]));
            expect({ situation: key, users: [s.who, t.who], overlap: hi - lo > 0 }).toMatchObject({ overlap: false });
          }
        }
      }
    }
  });
});
