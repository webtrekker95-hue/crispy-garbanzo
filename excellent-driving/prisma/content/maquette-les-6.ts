// Real course content, sourced from materiaalrijonderricht/Maquette les 6.pdf
// (bevoorrechte weggebruikers). As in les 4 and 5, its 2 diagrams are
// examples that go with rule 1, so they have no number; the student still
// solves each one ("Opl:"). PS, BS and AS are police, fire brigade and
// ambulance with sirens, drawn as cars with their label.
// Every "Opl:" in the PDF is blank, so the answer key is still to come from
// the instructor. Until then every road user is drawn as "must wait".
import type { RoadUser, Situation } from "../../lib/maquette";

type Extra = Pick<RoadUser, "lane" | "behind">;
const roadUser = (kind: RoadUser["kind"]) =>
  (label: string, from: RoadUser["from"], to: RoadUser["to"], extra: Extra = {}): RoadUser => ({
    label, kind, from, to, hasPriority: false, ...extra,
  });
const auto = roadUser("auto");
const fiets = roadUser("fiets");

export const S: Record<string, Situation> = {
  // The PDF labels this one "S/B" and the cyclist "F2". Car 3 turns linksaf
  // (confirmed by the owner; the PDF's drawing of it is unclear).
  "regel-1-vb-1": {
    wide: true,
    roadWidth: "B/S",
    bikeLanes: false,
    users: [
      auto("PS", "noord", "oost"), fiets("f1", "noord", "zuid"),
      auto("AS", "west", "oost"), auto("BS", "oost", "west"),
      fiets("f2", "zuid", "noord"), auto("3", "zuid", "west"),
    ],
  },
  // From the left, 3 passes 2, which waits for the inrit. From the right, BS
  // stands behind 5; from the bottom, PS stands behind 4.
  "regel-1-vb-2": {
    wide: true,
    inrit: "noord",
    inritWidth: "S",
    roadWidth: "S",
    bikeLanes: false,
    users: [
      auto("1", "noord", "zuid"),
      auto("2", "west", "noord"), auto("3", "west", "oost", { lane: "inner", behind: true }),
      auto("5", "oost", "zuid"), auto("BS", "oost", "noord", { behind: true }),
      auto("4", "zuid", "noord"), auto("PS", "zuid", "noord", { lane: "inner", behind: true }),
    ],
  },
};
