/**
 * Geometry for maquette intersection diagrams (Maquette les 1a, les 2, les 3 and les 4).
 *
 * Every situation is drawn on the same fixed template (viewBox 0 0 380 300)
 * defined in materiaalrijonderricht/claude_code_build_spec.md. Suriname
 * drives on the left, so linksaf is the short turn and rechtsaf crosses
 * oncoming traffic. Situations are stored as data (who comes from where and
 * goes where) and turned into shapes here, so all diagrams share one set of
 * constants instead of 20 hand-drawn SVGs.
 */

export type Approach = "noord" | "zuid" | "west" | "oost";
export type Exit = "noord" | "zuid" | "oost" | "west";

export type RoadUser = {
  /** Label drawn next to the vehicle: "1", "2", "f", "f1", "f2". */
  label: string;
  kind: "auto" | "fiets";
  from: Approach;
  to: Exit;
  /** Answer key: true = has priority / may go (green), false = must wait (orange). */
  hasPriority: boolean;
  /**
   * Answer key: verkeersfatsoen (les 2). Nobody has priority; whoever is
   * waved through goes first. Drawn in its own colour, overriding hasPriority.
   */
  courtesy?: boolean;
  /**
   * Wide template only (les 4): the lane to draw this road user in, instead
   * of the one the layout would pick. "opposite" is just across the centre
   * line, on a stretch closed to oncoming traffic (model 14, les 4 regel 6).
   */
  lane?: WideLane;
  /** Wide template only: drawn in the second row, behind the front of the queue. */
  behind?: boolean;
};

export type RoadWidth = "B" | "S" | "B/S";
export type WideLane = "kerb" | "inner" | "opposite";

export type Situation = {
  /**
   * Number as printed in the course material; les 2 has "23a" and "23b".
   * Les 4's diagrams illustrate its rules and have no number.
   */
  number?: number | string;
  /** Draws bike-lane bands along both the east and west roads (M.R.P.). */
  bikeLanes: boolean;
  /** Labels the intersection "S" (smalle weg) instead of the generic "S/B". */
  narrow?: boolean;
  /** Marks the noord–zuid road as a zandweg (black dots, as in the course material). */
  sandRoad?: boolean;
  /** Draws a no-entry sign at the mouth of the east road (situation 27). */
  noEntry?: boolean;
  /**
   * For situations with road users from all four sides (les 2, 30–31): every
   * approach is supported, and each turning road user is shifted off the
   * standard lane so that no two paths run on top of each other.
   */
  fourWay?: boolean;
  /**
   * Brede weg (les 3): drawn on its own, larger template with two car lanes
   * in each direction and a "B" centre label. `bikeLanes` still means the
   * west–oost road; `sandRoad` still means the noord–zuid road.
   */
  wide?: boolean;
  /** Wide template only: bike-lane bands along the noord–zuid road. */
  bikeLanesNorthSouth?: boolean;
  /** Wide template only: marks the west–oost road as a zandweg. */
  sandRoadWestOost?: boolean;
  /** Wide template only (les 4): a T-kruising; this arm is not drawn. */
  missingArm?: Approach;
  /** Wide template only: this arm is an inrit, labelled "inrit" and its width. */
  inrit?: Approach;
  inritWidth?: RoadWidth;
  /**
   * Wide template only: the centre label, "B" by default. The dashed divider
   * between two lanes is only drawn on a "B" road.
   */
  roadWidth?: RoadWidth;
  /** Wide template only: a model 14 sign (no entry) at the mouth of this arm. */
  noEntryArm?: Approach;
  users: RoadUser[];
};

export const MAQUETTE_COLORS = {
  priority: "#16a34a",
  wait: "#d97706",
  courtesy: "#7c3aed",
  neutral: "#475569",
} as const;

export const VIEWBOX = "0 0 380 300";

// Turn depth into the destination road, and the row (y) the turn runs along.
const DEPTH = { oost: 280, west: 140 } as const;
const ROW = {
  auto: { oost: 130, west: 170 },
  fiets: { oost: 100, west: 200 },
} as const;
// Two cars turning into the same road get pushed apart so the lines run parallel.
const SHARED_LANE_OFFSET = 6;

type Start = { x: number; y: number };

const START: Record<Approach, Partial<Record<RoadUser["kind"], Start>>> = {
  noord: { auto: { x: 230, y: 78 }, fiets: { x: 258, y: 67 } },
  zuid: { auto: { x: 190, y: 222 }, fiets: { x: 162, y: 233 } },
  west: { auto: { x: 78, y: 130 } },
  oost: {},
};

// Four-way situations: start points for every approach, and the column (x)
// a turn into the north/south road runs along.
const FOUR_WAY_START: Record<Approach, Record<RoadUser["kind"], Start>> = {
  noord: { auto: { x: 230, y: 78 }, fiets: { x: 258, y: 67 } },
  zuid: { auto: { x: 190, y: 222 }, fiets: { x: 162, y: 233 } },
  west: { auto: { x: 78, y: 130 }, fiets: { x: 117, y: 100 } },
  oost: { auto: { x: 302, y: 170 }, fiets: { x: 283, y: 200 } },
};
const COLUMN = {
  auto: { noord: 190, zuid: 230 },
  fiets: { noord: 162, zuid: 258 },
} as const;

export type VehicleShape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; cx: number; cy: number; r: number };

export type UserShape = {
  user: RoadUser;
  vehicle: VehicleShape;
  labelPos: { x: number; y: number };
  path: string;
};

function vehicleFor(user: RoadUser): { vehicle: VehicleShape; labelPos: { x: number; y: number } } {
  if (user.kind === "fiets") {
    if (user.from === "noord") return { vehicle: { type: "circle", cx: 258, cy: 60, r: 7 }, labelPos: { x: 258, y: 44 } };
    if (user.from === "zuid") return { vehicle: { type: "circle", cx: 162, cy: 240, r: 7 }, labelPos: { x: 162, y: 256 } };
    if (user.from === "west") return { vehicle: { type: "circle", cx: 110, cy: 100, r: 7 }, labelPos: { x: 110, y: 84 } };
    if (user.from === "oost") return { vehicle: { type: "circle", cx: 290, cy: 200, r: 7 }, labelPos: { x: 290, y: 226 } };
  } else {
    if (user.from === "noord") return { vehicle: { type: "rect", x: 220, y: 40, width: 20, height: 34 }, labelPos: { x: 230, y: 34 } };
    if (user.from === "zuid") return { vehicle: { type: "rect", x: 180, y: 226, width: 20, height: 34 }, labelPos: { x: 190, y: 270 } };
    if (user.from === "west") return { vehicle: { type: "rect", x: 40, y: 120, width: 34, height: 20 }, labelPos: { x: 57, y: 115 } };
    if (user.from === "oost") return { vehicle: { type: "rect", x: 306, y: 160, width: 34, height: 20 }, labelPos: { x: 323, y: 154 } };
  }
  throw new Error(`Unsupported road user: ${user.kind} from ${user.from}`);
}

function pathFor(user: RoadUser, rowOffset: number): string {
  const start = START[user.from][user.kind];
  if (!start) throw new Error(`Unsupported road user: ${user.kind} from ${user.from}`);
  const m = `M${start.x},${start.y}`;

  if (user.from === "west") {
    // Heading east along row 130; turns into the north/south road's left-hand lane.
    if (user.to === "zuid") return `${m} L230,${start.y} L230,215`;
    if (user.to === "noord") return `${m} L190,${start.y} L190,85`;
    if (user.to === "oost") return `${m} L275,${start.y}`;
    throw new Error("A road user cannot exit the way it came in");
  }

  if (user.to === user.from) throw new Error("A road user cannot exit the way it came in");
  if (user.to === "noord" || user.to === "zuid") {
    return `${m} L${start.x},${user.to === "zuid" ? 215 : 85}`;
  }
  const row = ROW[user.kind][user.to] + rowOffset;
  return `${m} L${start.x},${row} L${DEPTH[user.to]},${row}`;
}

function fourWayPathFor(user: RoadUser): string {
  if (user.to === user.from) throw new Error("A road user cannot exit the way it came in");
  const start = FOUR_WAY_START[user.from][user.kind];
  const m = `M${start.x},${start.y}`;
  const fromVertical = user.from === "noord" || user.from === "zuid";

  if (user.to === "noord" || user.to === "zuid") {
    const end = user.to === "zuid" ? 215 : 85;
    if (fromVertical) return `${m} L${start.x},${end}`;
    // The turn stays on the side the road user comes from, clear of the
    // straight-through lane and of a turn from the opposite side.
    const column = COLUMN[user.kind][user.to] + (user.from === "west" ? -SHARED_LANE_OFFSET : SHARED_LANE_OFFSET);
    return `${m} L${column},${start.y} L${column},${end}`;
  }
  if (!fromVertical) return `${m} L${user.to === "oost" ? 275 : 145},${start.y}`;
  const row = ROW[user.kind][user.to] + (user.from === "noord" ? -SHARED_LANE_OFFSET : SHARED_LANE_OFFSET);
  return `${m} L${start.x},${row} L${DEPTH[user.to]},${row}`;
}

/** Row offset for a car that shares its destination lane with another car. */
function sharedLaneOffset(user: RoadUser, users: RoadUser[]): number {
  if (user.kind !== "auto" || (user.to !== "oost" && user.to !== "west")) return 0;
  const sharing = users.filter((u) => u.kind === "auto" && u.to === user.to);
  if (sharing.length < 2) return 0;
  if (user.from === "noord") return -SHARED_LANE_OFFSET;
  if (user.from === "zuid") return SHARED_LANE_OFFSET;
  return 0;
}

// Brede wegen (les 3). Everything is laid out for a road user coming from
// the north and then rotated into place around the centre (200,200), so the
// four approaches share one geometry. The intersection square runs from 110
// to 290; traffic heading south keeps to the east half (driving on the left).
export const WIDE_VIEWBOX = "0 0 400 400";
export const WIDE_BOX = { min: 110, max: 290, center: 200 } as const;
/** Distance of the dashed lane divider from the centre line. */
export const WIDE_LANE_DIVIDER = 37;
// Column (x) of each lane for traffic coming from the north.
const WIDE_LANE = { opposite: 178, inner: 222, kerb: 252, fiets: 280 } as const;
// Row (y) a turn runs along: linksaf into the east road's eastbound lanes,
// rechtsaf (crossing) into the west road's westbound lanes.
const WIDE_ROW = {
  linksaf: { auto: 148, fiets: 120 },
  rechtsaf: { auto: 222, fiets: 280 },
} as const;
// A car queued behind another runs its arrow alongside the car in front.
const WIDE_QUEUE_SHIFT = 14;
// Distance a turning road user's last stretch is pushed off the lane line,
// towards the centre line first. Approach lines and straight-through paths
// run exactly on the lane lines, so a turn never lands on top of them.
const WIDE_TURN_OFFSETS = [6, -6, 12, -12];

const CLOCKWISE: Approach[] = ["noord", "oost", "zuid", "west"];
type Turn = "linksaf" | "rechtdoor" | "rechtsaf";
type Lane = keyof typeof WIDE_LANE;

/** Maps a point laid out for the north arm onto the given arm. */
export const ROTATE: Record<Approach, (x: number, y: number) => { x: number; y: number }> = {
  noord: (x, y) => ({ x, y }),
  oost: (x, y) => ({ x: 400 - y, y: x }),
  zuid: (x, y) => ({ x: 400 - x, y: 400 - y }),
  west: (x, y) => ({ x: y, y: 400 - x }),
};

function turnOf(user: RoadUser): Turn {
  const r = (CLOCKWISE.indexOf(user.to) - CLOCKWISE.indexOf(user.from) + 4) % 4;
  if (r === 0) throw new Error("A road user cannot exit the way it came in");
  return r === 1 ? "linksaf" : r === 2 ? "rechtdoor" : "rechtsaf";
}

function wideLayout(situation: Situation): UserShape[] {
  for (const user of situation.users) {
    if (user.from === situation.missingArm || user.to === situation.missingArm) {
      throw new Error(`Road user ${user.label} uses the missing arm of a T-kruising`);
    }
  }
  // Lanes: cyclists keep to the kerb, a car turning rechtsaf takes the inner
  // lane, any other car the kerb lane, unless the situation says otherwise.
  // A second road user in the same lane queues behind the first.
  const lanes = situation.users.map((user) => {
    const turn = turnOf(user);
    const lane: Lane = user.lane ?? (user.kind === "fiets" ? "fiets" : turn === "rechtsaf" ? "inner" : "kerb");
    return { user, turn, lane };
  });
  const sameLane = (a: (typeof lanes)[number], b: (typeof lanes)[number]) => a.user.from === b.user.from && a.lane === b.lane;
  const queuedFlags = lanes.map((l, i) => l.user.behind === true || lanes.slice(0, i).some((m) => sameLane(l, m) && !m.user.behind));
  const placed = lanes.map(({ user, turn, lane }, i) => {
    const group = lanes.map((l, j) => ({ l, queued: queuedFlags[j] })).filter(({ l }) => sameLane(l, lanes[i]));
    if (group.filter((g) => g.queued).length > 1 || group.filter((g) => !g.queued).length > 1) {
      throw new Error(`Only two road users can queue in one lane (${user.label})`);
    }
    const queued = queuedFlags[i];
    // The arrow of a queued road user runs alongside the one in front of it.
    const shifted = queued && group.some((g) => !g.queued);
    // A car keeps its kind of lane through a turn: linksaf from the kerb lane
    // into the kerb lane, rechtsaf from the inner lane into the inner lane.
    return { user, turn, lane, queued, shifted, dest: `${user.to}:${lane}` };
  });

  // Turning road users are pushed off the lane line they turn into, and
  // apart from each other when several turn into the same lane.
  const turnIndex = new Map<RoadUser, number>();
  for (const dest of new Set(placed.map((p) => p.dest))) {
    placed.filter((p) => p.dest === dest && p.turn !== "rechtdoor").forEach((p, k) => turnIndex.set(p.user, k));
  }

  return placed.map(({ user, turn, lane, queued, shifted }) => {
    const rotate = ROTATE[user.from];
    const x = WIDE_LANE[lane] + (shifted ? WIDE_QUEUE_SHIFT : 0);
    const startY = queued ? 48 : 104;
    const points =
      turn === "rechtdoor"
        ? [{ x, y: startY }, { x, y: 296 }]
        : (() => {
            const base = WIDE_ROW[turn][user.kind];
            const row = base + WIDE_TURN_OFFSETS[turnIndex.get(user)!] * (base < WIDE_BOX.center ? 1 : -1);
            return [{ x, y: startY }, { x, y: row }, { x: turn === "linksaf" ? 296 : 104, y: row }];
          })();
    const path = points.map((p, i) => {
      const r = rotate(p.x, p.y);
      return `${i === 0 ? "M" : "L"}${r.x},${r.y}`;
    }).join(" ");

    let vehicle: VehicleShape;
    let label: { x: number; y: number };
    if (user.kind === "fiets") {
      const c = rotate(WIDE_LANE[lane], queued ? 40 : 93);
      vehicle = { type: "circle", cx: c.x, cy: c.y, r: 7 };
      label = rotate(WIDE_LANE[lane], queued ? 25 : 77);
    } else {
      const top = queued ? 10 : 66;
      const a = rotate(WIDE_LANE[lane] - 10, top);
      const b = rotate(WIDE_LANE[lane] + 10, top + 34);
      vehicle = {
        type: "rect",
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(a.x - b.x),
        height: Math.abs(a.y - b.y),
      };
      // A queued car's label sits beside it, over the lane towards the centre,
      // or on the kerb side when another road user waits there.
      const insideTaken = placed.some(
        (p) => p.user !== user && p.user.from === user.from && p.queued && WIDE_LANE[p.lane] < WIDE_LANE[lane] && WIDE_LANE[lane] - WIDE_LANE[p.lane] <= 30,
      );
      label = queued ? rotate(WIDE_LANE[lane] + (insideTaken ? 20 : -20), top + 17) : rotate(WIDE_LANE[lane], 55);
    }
    // Labels are positioned by their centre; text is drawn from its baseline.
    return { user, vehicle, labelPos: { x: label.x, y: label.y + 4 }, path };
  });
}

export function layoutSituation(situation: Situation): UserShape[] {
  if (situation.wide) return wideLayout(situation);
  return situation.users.map((user) => ({
    user,
    ...vehicleFor(user),
    path: situation.fourWay ? fourWayPathFor(user) : pathFor(user, sharedLaneOffset(user, situation.users)),
  }));
}
