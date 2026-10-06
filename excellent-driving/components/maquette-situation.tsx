import { useId } from "react";
import {
  layoutSituation,
  MAQUETTE_COLORS,
  ROTATE,
  VIEWBOX,
  WIDE_BOX,
  WIDE_LANE_DIVIDER,
  WIDE_VIEWBOX,
  type Approach,
  type RoadUser,
  type Situation,
} from "@/lib/maquette";

const CURB = { stroke: "#8b8b83", strokeWidth: 0.5 };
const CENTER = { stroke: "#b8b6ad", strokeWidth: 0.5, strokeDasharray: "6 5" };
const LANE = { stroke: "#d6d3cb", strokeWidth: 0.5, strokeDasharray: "3 6" };
const LABEL = { fontSize: 12, textAnchor: "middle" as const };

const CURBS: [number, number, number, number][] = [
  [150, 30, 150, 90], [270, 30, 270, 90],
  [150, 210, 150, 270], [270, 210, 270, 270],
  [20, 90, 150, 90], [270, 90, 360, 90],
  [20, 210, 150, 210], [270, 210, 360, 210],
];
const CENTER_LINES: [number, number, number, number][] = [
  [210, 30, 210, 90], [210, 210, 210, 270],
  [20, 150, 150, 150], [270, 150, 360, 150],
];
const BIKE_BANDS: [number, number, number, number][] = [
  [270, 90, 90, 20], [270, 190, 90, 20],
  [20, 90, 130, 20], [20, 190, 130, 20],
];
// Zandweg markers sit in the empty half of the north and south roads.
const SAND_DOTS: [number, number][] = [[170, 48], [250, 252]];

// Brede wegen (les 3 and 4): road arms meeting the square WIDE_BOX.min..max,
// each with a centre line and, on a brede weg, a lighter divider between
// the two lanes. Every arm is drawn as the north arm and rotated into place.
const { min: LO, max: HI, center: MID } = WIDE_BOX;
type Line = [number, number, number, number];
const ARMS: Approach[] = ["noord", "oost", "zuid", "west"];
const rotateLine = (arm: Approach, [x1, y1, x2, y2]: Line): Line => {
  const a = ROTATE[arm](x1, y1);
  const b = ROTATE[arm](x2, y2);
  return [a.x, a.y, b.x, b.y];
};
const armCurbs = (arm: Approach): Line[] => [rotateLine(arm, [LO, 0, LO, LO]), rotateLine(arm, [HI, 0, HI, LO])];
const armLine = (arm: Approach, offset: number): Line => rotateLine(arm, [MID + offset, 0, MID + offset, LO]);
// A T-kruising closes the missing arm's mouth with a straight curb.
const closedMouth = (arm: Approach): Line => rotateLine(arm, [LO, LO, HI, LO]);
// Bike-lane bands sit just inside the curbs; [x, y, width, height].
const WIDE_BANDS_WEST_OOST: [number, number, number, number][] = [
  [0, LO, LO, 20], [0, HI - 20, LO, 20], [HI, LO, 400 - HI, 20], [HI, HI - 20, 400 - HI, 20],
];
const WIDE_BANDS_NOORD_ZUID: [number, number, number, number][] = WIDE_BANDS_WEST_OOST.map(([x, y, w, h]) => [y, x, h, w]);
// Where a T-kruising has no arm, the band runs on across the mouth.
const WIDE_BAND_ACROSS: Record<Approach, [number, number, number, number]> = {
  noord: [LO, LO, HI - LO, 20], zuid: [LO, HI - 20, HI - LO, 20],
  west: [LO, LO, 20, HI - LO], oost: [HI - 20, LO, 20, HI - LO],
};
// Zandweg markers sit near the road ends, on the side no arrow reaches.
const WIDE_SAND_DOTS_NOORD_ZUID: [number, number][] = [[130, 30], [270, 370]];
const WIDE_SAND_DOTS_WEST_OOST: [number, number][] = [[30, 270], [370, 130]];
// A T-kruising leaves out the empty strip where the missing arm would be.
const WIDE_T_VIEWBOX: Record<Approach, string> = {
  noord: "0 80 400 320", zuid: "0 0 400 320", west: "80 0 320 400", oost: "0 0 320 400",
};

/**
 * One maquette intersection. With `colored` off every road user is drawn in
 * a single neutral colour, so an exercise doesn't give away its answer; turn
 * it on to show the answer key (green = may go, orange = must wait,
 * purple = verkeersfatsoen). A brede weg (`situation.wide`) is drawn on its
 * own, larger template.
 */
export function MaquetteSituation({ situation, colored }: { situation: Situation; colored: boolean }) {
  const markerPrefix = useId().replace(/:/g, "");
  const shapes = layoutSituation(situation);
  const colorOf = (user: RoadUser) => {
    if (!colored) return MAQUETTE_COLORS.neutral;
    if (user.courtesy) return MAQUETTE_COLORS.courtesy;
    return user.hasPriority ? MAQUETTE_COLORS.priority : MAQUETTE_COLORS.wait;
  };
  const usedColors = [...new Set(shapes.map((s) => colorOf(s.user)))];
  const markerId = (color: string) => `${markerPrefix}-arrow-${color.slice(1)}`;

  return (
    <svg
      viewBox={situation.wide ? (situation.missingArm ? WIDE_T_VIEWBOX[situation.missingArm] : WIDE_VIEWBOX) : VIEWBOX}
      role="img"
      aria-label={situation.number === undefined ? "Verkeerssituatie" : `Situatie ${situation.number}`}
      style={{ width: "100%", maxWidth: 460, height: "auto", display: "block", margin: "0 auto", background: "#faf9f7", borderRadius: 12 }}
    >
      <defs>
        {usedColors.map((color) => (
          <marker key={color} id={markerId(color)} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke={color} strokeWidth="1.5" />
          </marker>
        ))}
      </defs>

      {situation.wide ? (
        <WideTemplate situation={situation} />
      ) : (
        <>
          {situation.bikeLanes &&
            BIKE_BANDS.map(([x, y, width, height]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width={width} height={height} fill="#3b82f6" opacity={0.12} />
            ))}
          {CURBS.map(([x1, y1, x2, y2]) => (
            <line key={`c${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} {...CURB} />
          ))}
          {CENTER_LINES.map(([x1, y1, x2, y2]) => (
            <line key={`m${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} {...CENTER} />
          ))}
          <text x={210} y={150} fill="#6b7280" {...LABEL}>{situation.narrow ? "S" : "S/B"}</text>
          {situation.sandRoad &&
            SAND_DOTS.map(([cx, cy]) => <circle key={`z${cx}-${cy}`} cx={cx} cy={cy} r={9} fill="#111827" />)}
          {situation.noEntry && (
            <g>
              <circle cx={290} cy={230} r={10} fill="#dc2626" />
              <rect x={283} y={228} width={14} height={4} fill="#fff" />
            </g>
          )}
        </>
      )}

      {shapes.map(({ user, vehicle, labelPos, path }) => {
        const color = colorOf(user);
        return (
          <g key={user.label}>
            {vehicle.type === "rect" ? (
              <rect x={vehicle.x} y={vehicle.y} width={vehicle.width} height={vehicle.height} rx={3} fill={color} />
            ) : (
              <circle cx={vehicle.cx} cy={vehicle.cy} r={vehicle.r} fill={color} />
            )}
            <text x={labelPos.x} y={labelPos.y} fill="#1f2937" {...LABEL}>{user.label}</text>
            <path d={path} fill="none" stroke={color} strokeWidth={1.5} markerEnd={`url(#${markerId(color)})`} />
          </g>
        );
      })}
    </svg>
  );
}

function WideTemplate({ situation }: { situation: Situation }) {
  const arms = ARMS.filter((arm) => arm !== situation.missingArm);
  const widthOf = (arm: Approach) => (arm === situation.inrit ? situation.inritWidth : situation.roadWidth) ?? "B";
  const curbs = [...arms.flatMap(armCurbs), ...(situation.missingArm ? [closedMouth(situation.missingArm)] : [])];
  // The whole inrit arm is one driveway, so it has no centre line.
  const centerLines = arms.filter((arm) => arm !== situation.inrit).map((arm) => armLine(arm, 0));
  const laneLines = arms
    .filter((arm) => widthOf(arm) === "B")
    .flatMap((arm) => [armLine(arm, -WIDE_LANE_DIVIDER), armLine(arm, WIDE_LANE_DIVIDER)]);
  const missing = situation.missingArm;
  const bands = [
    ...(situation.bikeLanes ? WIDE_BANDS_WEST_OOST : []),
    ...(situation.bikeLanes && (missing === "noord" || missing === "zuid") ? [WIDE_BAND_ACROSS[missing]] : []),
    ...(situation.bikeLanesNorthSouth ? WIDE_BANDS_NOORD_ZUID : []),
    ...(situation.bikeLanesNorthSouth && (missing === "west" || missing === "oost") ? [WIDE_BAND_ACROSS[missing]] : []),
  ];
  const dots = [
    ...(situation.sandRoad ? WIDE_SAND_DOTS_NOORD_ZUID : []),
    ...(situation.sandRoadWestOost ? WIDE_SAND_DOTS_WEST_OOST : []),
  ];
  // The inrit label sits in the middle of the arm, beyond the road users.
  const inritLabel = situation.inrit && [ROTATE[situation.inrit](MID, 28), ROTATE[situation.inrit](MID, 46)];
  // The sign stands outside the curb on the side traffic would enter the arm,
  // its bar across the road it closes.
  const sign = situation.noEntryArm && ROTATE[situation.noEntryArm](LO - 16, LO - 18);
  const signBarAcross = situation.noEntryArm === "noord" || situation.noEntryArm === "zuid";
  return (
    <>
      {bands.map(([x, y, width, height]) => (
        <rect key={`b${x}-${y}`} x={x} y={y} width={width} height={height} fill="#3b82f6" opacity={0.12} />
      ))}
      {curbs.map(([x1, y1, x2, y2]) => (
        <line key={`c${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} {...CURB} />
      ))}
      {centerLines.map(([x1, y1, x2, y2]) => (
        <line key={`m${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} {...CENTER} />
      ))}
      {laneLines.map(([x1, y1, x2, y2]) => (
        <line key={`l${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} {...LANE} />
      ))}
      <text x={MID} y={MID + 4} fill="#6b7280" {...LABEL}>{situation.roadWidth ?? "B"}</text>
      {inritLabel && (
        <>
          <text x={inritLabel[0].x} y={inritLabel[0].y + 4} fill="#6b7280" {...LABEL}>inrit</text>
          <text x={inritLabel[1].x} y={inritLabel[1].y + 4} fill="#6b7280" {...LABEL}>{widthOf(situation.inrit!)}</text>
        </>
      )}
      {dots.map(([cx, cy]) => <circle key={`z${cx}-${cy}`} cx={cx} cy={cy} r={9} fill="#111827" />)}
      {sign && (
        <g>
          <circle cx={sign.x} cy={sign.y} r={10} fill="#dc2626" />
          {signBarAcross ? (
            <rect x={sign.x - 7} y={sign.y - 2} width={14} height={4} fill="#fff" />
          ) : (
            <rect x={sign.x - 2} y={sign.y - 7} width={4} height={14} fill="#fff" />
          )}
        </g>
      )}
    </>
  );
}
