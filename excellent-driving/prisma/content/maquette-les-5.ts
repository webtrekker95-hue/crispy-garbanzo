// Real course content, sourced from materiaalrijonderricht/Maquette les 5.pdf
// (wegen van gelijke rangorde). As in les 4, its 5 diagrams are examples that
// go with the text, so they have no number; the student still solves each one
// ("Opl:"). Keys follow the PDF in page order:
//   regel-1           page 1
//   regel-2           page 1, all corners occupied
//   regel-3-vb-1/2    page 1, one corner free (two examples)
//   oplossingsmodel   page 2, the example under "Oplossingsmodel"
// Every "Opl:" in the PDF is blank, so the answer key is still to come from
// the instructor. Until then every road user is drawn as "must wait".
import type { RoadUser, Situation } from "../../lib/maquette";

const roadUser = (kind: RoadUser["kind"]) =>
  (label: string, from: RoadUser["from"], to: RoadUser["to"]): RoadUser => ({
    label, kind, from, to, hasPriority: false,
  });
const auto = roadUser("auto");
const fiets = roadUser("fiets");

export const S: Record<string, Situation> = {
  // The PDF draws 1 and 2 as arrows only; they are drawn as cars here.
  "regel-1": {
    wide: true,
    roadWidth: "B/S",
    bikeLanes: false,
    users: [auto("1", "noord", "zuid"), auto("2", "west", "oost")],
  },
  // All corners occupied, by rechtsaffers and straight-through traffic only.
  "regel-2": {
    wide: true,
    roadWidth: "B/S",
    bikeLanes: false,
    users: [auto("1", "noord", "zuid"), auto("2", "west", "zuid"), auto("3", "oost", "west"), auto("4", "zuid", "oost")],
  },
  // The right-hand corner is free. Only 1 has a number in the PDF; the
  // linksaffer from the left (drawn as a line and an arrow, no car) is 2 and
  // the car from the bottom is 3 here.
  "regel-3-vb-1": {
    wide: true,
    roadWidth: "B/S",
    bikeLanes: false,
    users: [auto("1", "noord", "zuid"), auto("2", "west", "noord"), auto("3", "zuid", "noord")],
  },
  // The right-hand corner is free; the PDF labels this one "S/B".
  "regel-3-vb-2": {
    wide: true,
    roadWidth: "B/S",
    bikeLanes: false,
    users: [auto("1", "noord", "oost"), fiets("f2", "noord", "zuid"), auto("3", "west", "noord"), auto("4", "zuid", "noord")],
  },
  // The west–oost road has a rijwielpad on both sides. 1 waits behind 2 and
  // f8 behind f7.
  oplossingsmodel: {
    wide: true,
    roadWidth: "S",
    bikeLanes: true,
    users: [
      auto("2", "noord", "oost"), auto("1", "noord", "oost"), fiets("f3", "noord", "west"),
      fiets("f4", "west", "oost"), auto("5", "west", "zuid"),
      auto("6", "oost", "zuid"), fiets("f7", "oost", "west"), fiets("f8", "oost", "noord"),
    ],
  },
};
