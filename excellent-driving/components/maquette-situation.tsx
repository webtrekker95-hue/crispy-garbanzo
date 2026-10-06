import { useId } from "react";
import {
  layoutSituation,
  MAQUETTE_COLORS,
  VIEWBOX,
  WIDE_BOX,
  WIDE_LANE_DIVIDER,
  WIDE_VIEWBOX,
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

// Brede wegen (les 3): four road arms meeting the square WIDE_BOX.min..max,
// each with a centre line and a lighter divider between the two lanes.
const { min: LO, max: HI, center: MID } = WIDE_BOX;
const WIDE_CURBS: [number, number, number, number][] = [
  [LO, 0, LO, LO], [HI, 0, HI, LO], [LO, HI, LO, 400], [HI, HI, HI, 400],
  [0, LO, LO, LO], [0, HI, LO, HI], [HI, LO, 400, LO], [HI, HI, 400, HI],
];
const armLines = (offset: number): [number, number, number, number][] => [
  [MID + offset, 0, MID + offset, LO], [MID + offset, HI, MID + offset, 400],
  [0, MID + offset, LO, MID + offset], [HI, MID + offset, 400, MID + offset],
];
const WIDE_CENTER_LINES = armLines(0);
const WIDE_LANE_LINES = [...armLines(-WIDE_LANE_DIVIDER), ...armLines(WIDE_LANE_DIVIDER)];
// Bike-lane bands sit just inside the curbs; [x, y, width, height].
const WIDE_BANDS_WEST_OOST: [number, number, number, number][] = [
  [0, LO, LO, 20], [0, HI - 20, LO, 20], [HI, LO, 400 - HI, 20], [HI, HI - 20, 400 - HI, 20],
];
const WIDE_BANDS_NOORD_ZUID: [number, number, number, number][] = WIDE_BANDS_WEST_OOST.map(([x, y, w, h]) => [y, x, h, w]);
// Zandweg markers sit near the road ends, on the side no arrow reaches.
const WIDE_SAND_DOTS_NOORD_ZUID: [number, number][] = [[130, 30], [270, 370]];
const WIDE_SAND_DOTS_WEST_OOST: [number, number][] = [[30, 270], [370, 130]];

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
      viewBox={situation.wide ? WIDE_VIEWBOX : VIEWBOX}
      role="img"
      aria-label={`Situatie ${situation.number}`}
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
  const bands = [
    ...(situation.bikeLanes ? WIDE_BANDS_WEST_OOST : []),
    ...(situation.bikeLanesNorthSouth ? WIDE_BANDS_NOORD_ZUID : []),
  ];
  const dots = [
    ...(situation.sandRoad ? WIDE_SAND_DOTS_NOORD_ZUID : []),
    ...(situation.sandRoadWestOost ? WIDE_SAND_DOTS_WEST_OOST : []),
  ];
  return (
    <>
      {bands.map(([x, y, width, height]) => (
        <rect key={`b${x}-${y}`} x={x} y={y} width={width} height={height} fill="#3b82f6" opacity={0.12} />
      ))}
      {WIDE_CURBS.map(([x1, y1, x2, y2]) => (
        <line key={`c${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} {...CURB} />
      ))}
      {WIDE_CENTER_LINES.map(([x1, y1, x2, y2]) => (
        <line key={`m${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} {...CENTER} />
      ))}
      {WIDE_LANE_LINES.map(([x1, y1, x2, y2]) => (
        <line key={`l${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} {...LANE} />
      ))}
      <text x={MID} y={MID + 4} fill="#6b7280" {...LABEL}>B</text>
      {dots.map(([cx, cy]) => <circle key={`z${cx}-${cy}`} cx={cx} cy={cy} r={9} fill="#111827" />)}
    </>
  );
}
