/**
 * Geometry for maquette intersection diagrams (Maquette les 1a).
 *
 * Every situation is drawn on the same fixed template (viewBox 0 0 380 300)
 * defined in materiaalrijonderricht/claude_code_build_spec.md. Suriname
 * drives on the left, so linksaf is the short turn and rechtsaf crosses
 * oncoming traffic. Situations are stored as data (who comes from where and
 * goes where) and turned into shapes here, so all diagrams share one set of
 * constants instead of 20 hand-drawn SVGs.
 */

export type Approach = "noord" | "zuid" | "west";
export type Exit = "noord" | "zuid" | "oost" | "west";

export type RoadUser = {
  /** Label drawn next to the vehicle: "1", "2", "f", "f1", "f2". */
  label: string;
  kind: "auto" | "fiets";
  from: Approach;
  to: Exit;
  /** Answer key: true = has priority / may go (green), false = must wait (orange). */
  hasPriority: boolean;
};

export type Situation = {
  number: number;
  /** Draws bike-lane bands along both the east and west roads (M.R.P.). */
  bikeLanes: boolean;
  users: RoadUser[];
};

export const MAQUETTE_COLORS = {
  priority: "#16a34a",
  wait: "#d97706",
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
};

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
  } else {
    if (user.from === "noord") return { vehicle: { type: "rect", x: 220, y: 40, width: 20, height: 34 }, labelPos: { x: 230, y: 34 } };
    if (user.from === "zuid") return { vehicle: { type: "rect", x: 180, y: 226, width: 20, height: 34 }, labelPos: { x: 190, y: 270 } };
    if (user.from === "west") return { vehicle: { type: "rect", x: 40, y: 120, width: 34, height: 20 }, labelPos: { x: 57, y: 115 } };
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
    path: pathFor(user, sharedLaneOffset(user, situation.users)),
  }));
}
