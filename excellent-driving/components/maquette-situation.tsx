import { useId } from "react";
import { layoutSituation, MAQUETTE_COLORS, VIEWBOX, type Situation } from "@/lib/maquette";

const CURB = { stroke: "#8b8b83", strokeWidth: 0.5 };
const CENTER = { stroke: "#b8b6ad", strokeWidth: 0.5, strokeDasharray: "6 5" };
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

/**
 * One maquette intersection. With `colored` off every road user is drawn in
 * a single neutral colour, so an exercise doesn't give away its answer; turn
 * it on to show the answer key (green = may go, orange = must wait).
 */
export function MaquetteSituation({ situation, colored }: { situation: Situation; colored: boolean }) {
  const markerPrefix = useId().replace(/:/g, "");
  const shapes = layoutSituation(situation);
  const colorOf = (hasPriority: boolean) =>
    !colored ? MAQUETTE_COLORS.neutral : hasPriority ? MAQUETTE_COLORS.priority : MAQUETTE_COLORS.wait;
  const usedColors = [...new Set(shapes.map((s) => colorOf(s.user.hasPriority)))];
  const markerId = (color: string) => `${markerPrefix}-arrow-${color.slice(1)}`;

  return (
    <svg
      viewBox={VIEWBOX}
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
      <text x={210} y={150} fill="#6b7280" {...LABEL}>S/B</text>

      {shapes.map(({ user, vehicle, labelPos, path }) => {
        const color = colorOf(user.hasPriority);
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
