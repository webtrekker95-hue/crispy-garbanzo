// Real course content, sourced from materiaalrijonderricht/Maquette les 4.pdf
// (T-kruisingen and inritsituaties). Its 10 diagrams are examples that go
// with the text, so they have no number; the student still solves each one
// ("Opl:"). Keys follow the PDF in page order:
//   t-kruising*       T-kruising (PDF page 1)
//   regel-1           inrit (PDF pages 1–2: the diagram is split by the page break)
//   regel-2           smalle inrit bezet (page 3)
//   regel-3-opl-1/2   verkeersfatsoen, "Opl 1" and "Opl 2" (page 3)
//   regel-4           fietser rechtdoor naar de inrit (page 3)
//   regel-5           voertuig rechtdoor naar de inrit (page 4)
//   regel-6           model 14 (page 4)
// Every "Opl:" in the PDF is blank and ANTWOORDEN MAQUETTES.docx stops at 31,
// so the answer key is still to come from the instructor. Until then every
// road user is drawn as "must wait".
//
// All of them use the wide template: a T-kruising leaves out the north arm;
// with an inrit, the whole north arm is the inrit. Where the PDF draws a road user beside or
// behind another, `lane` and `behind` place it the same way.
import type { RoadUser, Situation } from "../../lib/maquette";

type Extra = Pick<RoadUser, "lane" | "behind">;
const roadUser = (kind: RoadUser["kind"]) =>
  (label: string, from: RoadUser["from"], to: RoadUser["to"], extra: Extra = {}): RoadUser => ({
    label, kind, from, to, hasPriority: false, ...extra,
  });
const auto = roadUser("auto");
const fiets = roadUser("fiets");

// The two brede T-kruisingen are the same situation, with and without a rijwielpad. The
// PDF writes the cyclist on the rijwielpad as "F1"; both are "f1" here.
const tKruisingBreed = (bikeLanes: boolean): Situation => ({
  wide: true,
  missingArm: "noord",
  bikeLanes,
  users: [
    fiets("f1", "west", "oost"), auto("1", "west", "oost"), auto("2", "west", "zuid"),
    auto("6", "oost", "west"), auto("7", "oost", "zuid"),
    fiets("f3", "zuid", "oost"), auto("4", "zuid", "west"), auto("5", "zuid", "oost"),
  ],
});

export const S: Record<string, Situation> = {
  "t-kruising": {
    wide: true,
    missingArm: "noord",
    roadWidth: "B/S",
    bikeLanes: false,
    users: [auto("1", "west", "zuid"), auto("2", "oost", "west"), auto("3", "zuid", "west")],
  },
  "t-kruising-breed-rijwielpad": tKruisingBreed(true),
  "t-kruising-breed": tKruisingBreed(false),
  // Rule 1: traffic to the inrit keeps to the far left, so 2 turns rechtsaf
  // from the kerb lane.
  "regel-1": {
    wide: true,
    inrit: "noord",
    inritWidth: "S",
    roadWidth: "B/S",
    bikeLanes: false,
    users: [
      auto("3", "west", "noord"), auto("4", "noord", "zuid"),
      auto("2", "oost", "noord", { lane: "kerb" }), auto("1", "zuid", "noord"),
    ],
  },
  // Rule 2: from every side one car waits at the kerb for the inrit and a
  // second one stands behind it, towards the centre.
  "regel-2": {
    wide: true,
    inrit: "noord",
    inritWidth: "S",
    roadWidth: "S",
    bikeLanes: false,
    users: [
      auto("7", "west", "noord"), auto("1", "west", "zuid", { lane: "inner", behind: true }),
      auto("4", "noord", "oost"),
      auto("6", "oost", "noord", { lane: "kerb" }), auto("2", "oost", "west", { lane: "inner", behind: true }),
      auto("5", "zuid", "noord"), auto("3", "zuid", "oost", { behind: true }),
    ],
  },
  // Rule 3, Opl 1: 3 and 4 both drive straight on and pass a car waiting
  // for the inrit (2 and 5).
  "regel-3-opl-1": {
    wide: true,
    inrit: "noord",
    inritWidth: "S",
    roadWidth: "S",
    bikeLanes: false,
    users: [
      auto("1", "noord", "zuid"),
      auto("2", "west", "noord"), auto("3", "west", "oost", { lane: "inner", behind: true }),
      auto("5", "oost", "noord", { lane: "kerb" }), auto("4", "oost", "west", { lane: "inner", behind: true }),
    ],
  },
  // Rule 3, Opl 2: f5 drives straight on and 3 turns linksaf, each passing a
  // car waiting for the inrit (2 and 6). f4 waits behind 3.
  "regel-3-opl-2": {
    wide: true,
    inrit: "noord",
    inritWidth: "S",
    roadWidth: "S",
    bikeLanes: false,
    users: [
      auto("1", "noord", "oost"),
      auto("2", "west", "noord"), fiets("f5", "west", "oost", { lane: "inner", behind: true }),
      auto("6", "oost", "noord", { lane: "kerb" }), auto("3", "oost", "zuid", { lane: "inner" }),
      fiets("f4", "oost", "west", { lane: "inner", behind: true }),
    ],
  },
  // Rule 4. The PDF labels the cyclist "F".
  "regel-4": {
    wide: true,
    inrit: "noord",
    inritWidth: "B/S",
    roadWidth: "B/S",
    bikeLanes: false,
    users: [fiets("f", "zuid", "noord"), auto("1", "zuid", "west")],
  },
  // Rule 5: 1 is at the front; 2 and 3 stand behind it.
  "regel-5": {
    wide: true,
    inrit: "noord",
    inritWidth: "B/S",
    roadWidth: "B/S",
    bikeLanes: false,
    users: [auto("1", "zuid", "noord"), auto("2", "zuid", "west"), auto("3", "zuid", "oost", { behind: true })],
  },
  // Rule 6: model 14 closes the west road to traffic heading west, so 4 can
  // wait beside 2 on the other half of the road and f3 cannot pass between.
  "regel-6": {
    wide: true,
    inrit: "noord",
    inritWidth: "S",
    roadWidth: "S",
    noEntryArm: "west",
    bikeLanes: false,
    users: [
      auto("1", "noord", "zuid"),
      auto("2", "west", "noord"), auto("4", "west", "zuid", { lane: "opposite" }),
      fiets("f3", "west", "oost", { lane: "inner", behind: true }),
    ],
  },
};
