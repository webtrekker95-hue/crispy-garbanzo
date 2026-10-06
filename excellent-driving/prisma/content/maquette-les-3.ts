// Real course content, sourced from materiaalrijonderricht/Maquette les 3.pdf
// (brede wegen). The PDF numbers its 11 diagrams 32–38 with repeats; at the
// owner's request they are numbered in order here, 32–42:
//   PDF page 1: 32, 33, 34, 35, 32 (second one)  →  32–36
//   PDF page 2: 33, 34, 35, 36                   →  37–40
//   PDF page 3: 37, 38                           →  41–42
// Every "Opl:" in the PDF is blank and ANTWOORDEN MAQUETTES.docx stops at 31,
// so the answer key is still to come from the instructor. Until then every
// road user is drawn as "must wait"; the diagrams only show them uncoloured.
import type { RoadUser, Situation } from "../../lib/maquette";

const roadUser = (kind: RoadUser["kind"]) =>
  (label: string, from: RoadUser["from"], to: RoadUser["to"]): RoadUser => ({
    label, kind, from, to, hasPriority: false,
  });
const auto = roadUser("auto");
const fiets = roadUser("fiets");

// Directions are from the diagram, as in les 1a and les 2: from noord,
// rechtsaf = west and linksaf = oost; from zuid it's the other way round.
// M.R.P. in the PDF draws a rijwielpad along the west–oost road (bikeLanes).
const northTrio = (cyclist: string, cyclistTo: RoadUser["to"]) => [
  auto("1", "noord", "west"), auto("2", "noord", "oost"), fiets(cyclist, "noord", cyclistTo),
];

export const S: Record<string, Situation> = {
  // The car at the top has no number in the PDF; it is labelled 1 here.
  "32": { number: 32, wide: true, bikeLanes: false, users: [auto("1", "noord", "west"), auto("2", "zuid", "oost")] },
  "33": { number: 33, wide: true, bikeLanes: false, users: northTrio("f", "west") },
  "34": { number: 34, wide: true, bikeLanes: true, users: northTrio("f", "west") },
  "35": {
    number: 35,
    wide: true,
    bikeLanes: false,
    users: [...northTrio("f", "west"), auto("3", "zuid", "west"), auto("4", "zuid", "oost")],
  },
  "36": {
    number: 36,
    wide: true,
    bikeLanes: true,
    users: [...northTrio("f", "west"), auto("3", "zuid", "west"), auto("4", "zuid", "oost")],
  },
  "37": {
    number: 37,
    wide: true,
    bikeLanes: false,
    users: [...northTrio("f1", "west"), fiets("f3", "zuid", "oost"), auto("4", "zuid", "oost")],
  },
  "38": {
    number: 38,
    wide: true,
    bikeLanes: true,
    users: [...northTrio("f1", "west"), fiets("f3", "zuid", "oost"), auto("4", "zuid", "oost")],
  },
  "39": {
    number: 39,
    wide: true,
    bikeLanes: false,
    users: [...northTrio("f1", "oost"), auto("3", "zuid", "noord"), auto("4", "zuid", "oost")],
  },
  "40": {
    number: 40,
    wide: true,
    bikeLanes: true,
    users: [...northTrio("f1", "oost"), auto("3", "zuid", "noord"), auto("4", "zuid", "oost")],
  },
  // The noord–zuid road is a zandweg (black circles), the west–oost road has
  // a rijwielpad. 13 waits behind 11.
  "41": {
    number: 41,
    wide: true,
    bikeLanes: true,
    sandRoad: true,
    users: [
      ...northTrio("f3", "west"),
      fiets("f4", "west", "zuid"), auto("5", "west", "noord"), auto("6", "west", "zuid"),
      auto("7", "oost", "noord"), auto("8", "oost", "zuid"), fiets("f9", "oost", "west"),
      fiets("f10", "zuid", "oost"), auto("11", "zuid", "west"), auto("12", "zuid", "oost"), auto("13", "zuid", "west"),
    ],
  },
  // The other way round: the west–oost road is a zandweg, the noord–zuid
  // road has a rijwielpad.
  "42": {
    number: 42,
    wide: true,
    bikeLanes: false,
    bikeLanesNorthSouth: true,
    sandRoadWestOost: true,
    users: [
      ...northTrio("f3", "west"),
      fiets("f4", "west", "zuid"), auto("5", "west", "oost"), auto("6", "west", "zuid"),
      auto("7", "oost", "noord"), fiets("f8", "oost", "noord"),
      fiets("f9", "zuid", "noord"), auto("10", "zuid", "west"), auto("11", "zuid", "oost"),
    ],
  },
};
