/**
 * Geometry for maquette intersection diagrams (Maquette les 1a and les 2).
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
};

export type Situation = {
  /** Number as printed in the course material; les 2 has "23a" and "23b". */
  number: number | string;
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

export function layoutSituation(situation: Situation): UserShape[] {
  return situation.users.map((user) => ({
    user,
    ...vehicleFor(user),
    path: situation.fourWay ? fourWayPathFor(user) : pathFor(user, sharedLaneOffset(user, situation.users)),
  }));
}
