// Real course content, sourced from materiaalrijonderricht/Maquette les 2.pdf
// (smalle wegen, situations 21–31). The PDF leaves every "Opl:" blank; the
// answer key is materiaalrijonderricht/ANTWOORDEN MAQUETTES.docx and is
// followed as written.
import type { RoadUser, Situation } from "../../lib/maquette";

// "go" = may ride (green), "wait" = must wait (orange), "vf" = verkeersfatsoen:
// no fixed order, whoever is waved through goes first (purple).
type Status = "go" | "wait" | "vf";
const roadUser = (kind: RoadUser["kind"]) =>
  (label: string, from: RoadUser["from"], to: RoadUser["to"], status: Status): RoadUser => ({
    label, kind, from, to, hasPriority: status === "go", ...(status === "vf" && { courtesy: true }),
  });
const auto = roadUser("auto");
const fiets = roadUser("fiets");

// Directions are from the diagram, as in les 1a: from noord, rechtsaf = west
// and linksaf = oost; from zuid it's the other way round. In 30 and 31 the
// noord–zuid road is a zandweg and the west–oost road has a rijwielpad.
const S: Record<string, Situation> = {
  "21": { number: 21, bikeLanes: false, narrow: true, users: [auto("1", "noord", "west", "vf"), auto("2", "zuid", "oost", "vf")] },
  "22": { number: 22, bikeLanes: true, narrow: true, users: [auto("1", "noord", "west", "vf"), auto("2", "zuid", "oost", "vf")] },
  "23a": {
    number: "23a",
    bikeLanes: false,
    narrow: true,
    users: [auto("1", "noord", "west", "go"), fiets("f1", "noord", "zuid", "go"), auto("2", "zuid", "oost", "wait")],
  },
  "23b": {
    number: "23b",
    bikeLanes: false,
    narrow: true,
    users: [auto("1", "noord", "west", "go"), fiets("f1", "noord", "oost", "go"), auto("2", "zuid", "oost", "wait")],
  },
  "24": {
    number: 24,
    bikeLanes: true,
    narrow: true,
    users: [auto("1", "noord", "west", "vf"), fiets("f2", "noord", "west", "go"), auto("2", "zuid", "oost", "vf")],
  },
  "25": {
    number: 25,
    bikeLanes: false,
    narrow: true,
    users: [auto("1", "noord", "west", "vf"), fiets("f1", "noord", "west", "wait"), auto("2", "zuid", "oost", "vf")],
  },
  "26": { number: 26, bikeLanes: false, narrow: true, users: [fiets("f", "noord", "west", "go"), auto("1", "zuid", "oost", "go")] },
  "27": {
    number: 27,
    bikeLanes: false,
    narrow: true,
    noEntry: true,
    users: [auto("1", "noord", "west", "vf"), auto("2", "zuid", "oost", "vf")],
  },
  "28": {
    number: 28,
    bikeLanes: true,
    narrow: true,
    users: [auto("1", "noord", "west", "vf"), fiets("f2", "noord", "west", "go"), fiets("f3", "zuid", "oost", "go"), auto("4", "zuid", "oost", "vf")],
  },
  "29": {
    number: 29,
    bikeLanes: false,
    narrow: true,
    users: [auto("1", "noord", "west", "vf"), fiets("f2", "noord", "west", "wait"), fiets("f3", "zuid", "oost", "wait"), auto("4", "zuid", "oost", "vf")],
  },
  "30": {
    number: 30,
    bikeLanes: true,
    narrow: true,
    sandRoad: true,
    fourWay: true,
    users: [
      auto("1", "noord", "west", "wait"), fiets("f2", "noord", "zuid", "wait"),
      fiets("f3", "west", "zuid", "vf"), auto("4", "west", "noord", "vf"),
      auto("5", "oost", "noord", "go"), fiets("f8", "oost", "noord", "go"),
      fiets("f6", "zuid", "oost", "wait"), auto("7", "zuid", "oost", "wait"),
    ],
  },
  "31": {
    number: 31,
    bikeLanes: true,
    narrow: true,
    sandRoad: true,
    fourWay: true,
    users: [
      auto("1", "noord", "oost", "wait"), fiets("f2", "noord", "zuid", "wait"),
      fiets("f3", "west", "zuid", "go"), auto("4", "west", "noord", "go"),
      auto("5", "oost", "zuid", "go"), fiets("f6", "oost", "noord", "go"),
      fiets("f7", "zuid", "oost", "wait"), auto("8", "zuid", "oost", "wait"),
    ],
  },
};

const exercise = (number: string, text: string, options: string[], correct: number, explanation: string) => ({
  situation: S[number],
  text: `Situatie ${number}: ${text}`,
  options,
  correct,
  explanation,
});

const ORDER_Q = "in welke volgorde mogen de weggebruikers rijden?";
const VF_1_2 = "VF 1+2 — (1W2) 2 – 1 of (2W1) 1 – 2";

const narrowRoadsGuide =
  "<p>Deze les gaat over kruisingen van <strong>smalle wegen (S)</strong>. Op een smalle weg kunnen twee auto's die allebei rechtsaf slaan elkaar niet tegelijk passeren, en geen van beiden heeft voorrang op de ander. Daarvoor geldt het <strong>2e verkeersfatsoen</strong>:</p>" +
  "<div class=\"callout\">Wanneer er <strong>twee rechtsaffers</strong> tegenover elkaar staan, waarbij de wegsituatie <strong>smal (S)</strong> is, wordt er <strong>altijd VF toegepast</strong>.</div>" +
  "<h3>Zo schrijf je de oplossing</h3>" +
  "<ul>" +
  "<li><strong>VF</strong> = verkeersfatsoen. <strong>W</strong> = wenkt: de ene bestuurder geeft de ander een teken dat hij voor mag gaan.</li>" +
  "<li>Je weet vooraf niet wie wenkt, dus je schrijft <strong>beide mogelijkheden</strong> op, met <strong>OF</strong> ertussen.</li>" +
  "<li><strong>VF 1+2 — (1W2) 2 – 1 of (2W1) 1 – 2</strong> lees je zo: VF tussen 1 en 2. Wenkt 1 naar 2, dan rijdt eerst 2 en daarna 1. Wenkt 2 naar 1, dan rijdt eerst 1 en daarna 2.</li>" +
  "<li>Net als in les 1a: <strong>1 + 2</strong> = samen rijden, <strong>2 – 1</strong> = eerst 2, daarna 1.</li>" +
  "</ul>" +
  "<h3>Zo lees je de tekeningen</h3>" +
  "<ul>" +
  "<li>Een <strong>rechthoek</strong> is een auto, een <strong>bolletje</strong> is een fietser (f). De pijl laat zien waar ze naartoe willen.</li>" +
  "<li>Een blauwe band langs de weg is een <strong>rijwielpad (M.R.P.)</strong>. Geen band betekent <strong>zonder rijwielpad (Z.R.P.)</strong>.</li>" +
  "<li>Twee <strong>zwarte cirkels</strong> op een weg betekenen: die weg is een <strong>zandweg</strong>.</li>" +
  "<li>Bij de laatste twee situaties komen er weggebruikers van alle vier de kanten.</li>" +
  "<li><span style=\"color:#16a34a;font-weight:700\">Groen</span> = mag rijden, <span style=\"color:#d97706;font-weight:700\">oranje</span> = moet wachten, <span style=\"color:#7c3aed;font-weight:700\">paars</span> = verkeersfatsoen (wie gewenkt wordt, rijdt eerst). Bij de oefeningen zie je de kleuren pas nadat je een antwoord hebt gekozen.</li>" +
  "</ul>";

export const maquetteLes2Lessons = [
  {
    title: "Smalle wegen en verkeersfatsoen + uitwerking 21",
    type: "TEXT" as const,
    content: {
      type: "TEXT",
      body: narrowRoadsGuide,
      examples: [
        {
          situation: S["21"],
          solution: VF_1_2,
          explanation:
            "1 en 2 staan tegenover elkaar en slaan allebei <strong>rechtsaf</strong>. Ze moeten elkaars weg kruisen en de weg is <strong>smal</strong>, dus ze kunnen niet tegelijk rijden en geen van beiden heeft voorrang. Er wordt <strong>VF</strong> toegepast: wenkt 1 naar 2, dan rijdt eerst 2 en daarna 1 (<strong>2 – 1</strong>); wenkt 2 naar 1, dan is het <strong>1 – 2</strong>.",
        },
      ],
    },
  },
  {
    title: "Oefenen: situaties 22–27",
    type: "QUIZ" as const,
    content: {
      type: "QUIZ",
      passingScore: 70,
      questions: [
        exercise("22", `${ORDER_Q} (Met rijwielpad — M.R.P.)`, ["1 + 2 (tegelijk)", VF_1_2, "Eerst 2, dan 1"], 1,
          `Dezelfde bewegingen als situatie 21: twee rechtsaffers tegenover elkaar op een smalle weg. Het rijwielpad verandert niets voor twee auto's, dus er wordt VF toegepast. Oplossing: <strong>${VF_1_2}</strong>.`),
        exercise("23a", ORDER_Q, [`${VF_1_2}, f1 rijdt mee`, "f1 + 1 – 2", "2 – f1 + 1"], 1,
          "f1 gaat rechtdoor. <strong>Goudenregel:</strong> rechtsaffer 2 verleent voorrang aan rechtdoorgaand verkeer dat tegenover hem staat, dus 2 wacht. 1 slaat rechtsaf en rijdt samen met f1. Omdat 2 toch al wacht, is er geen VF nodig. Oplossing: <strong>f1 + 1 – 2</strong>."),
        exercise("23b", ORDER_Q, ["f1 + 1 – 2", "2 – 1 + f1", `${VF_1_2}, f1 rijdt mee`], 0,
          "f1 slaat linksaf. <strong>Goudenregel:</strong> rechtsaffer 2 verleent voorrang aan een linksaffer die tegenover hem staat, dus 2 wacht. 1 rijdt samen met f1. Oplossing: <strong>f1 + 1 – 2</strong>."),
        exercise("24", `${ORDER_Q} (Met rijwielpad — M.R.P.)`,
          ["VF 1+2 — (1W2) 2 – 1 – f2 of (2W1) 1 – f2 – 2", "VF 1+2 — (1W2) 2 + f2 – 1 of (2W1) 1 + f2 – 2", "f2 + 1 – 2"], 1,
          "1 en 2 zijn twee rechtsaffers tegenover elkaar op een smalle weg: <strong>VF</strong>. f2 slaat af over het <strong>rijwielpad</strong> en rijdt daarom mee met de auto die eerst gaat. Oplossing: <strong>VF 1+2 — (1W2) 2 + f2 – 1 of (2W1) 1 + f2 – 2</strong>."),
        exercise("25", `${ORDER_Q} (Zonder rijwielpad — Z.R.P.)`,
          ["VF 1+2 — (1W2) 2 + f1 – 1 of (2W1) 1 + f1 – 2", "1 + f1 – 2", "VF 1+2 — (1W2) 2 – f1 + 1 of (2W1) 1 – 2 + f1"], 2,
          "Dezelfde bewegingen als situatie 24, maar nu <strong>zonder rijwielpad</strong>. Tussen 1 en 2 wordt VF toegepast. f1 rijdt niet mee in de eerste beurt, maar pas daarna. Oplossing: <strong>VF 1+2 — (1W2) 2 – f1 + 1 of (2W1) 1 – 2 + f1</strong>. Vergelijk met situatie 24 — het rijwielpad maakt het verschil."),
        exercise("26", ORDER_Q, ["1 + f (tegelijk)", "VF 1+f — (1Wf) f – 1 of (fW1) 1 – f", "Eerst 1, dan f"], 0,
          "Hier staan geen twee auto's tegenover elkaar: tegenover auto 1 staat alleen een fietser. Ze slaan allebei rechtsaf en rijden samen. Oplossing: <strong>1 + f</strong>."),
        exercise("27", `${ORDER_Q} (Bij de zijweg rechtsonder staat het bord "verboden in te rijden".)`, ["Eerst 1, dan 2", VF_1_2, "1 + 2 (tegelijk)"], 1,
          `1 en 2 staan nog steeds als twee rechtsaffers tegenover elkaar op een smalle weg. Het bord verandert de volgorde niet: er wordt VF toegepast. Oplossing: <strong>${VF_1_2}</strong>.`),
      ],
    },
  },
  {
    title: "Oefenen: situaties 28–31 (vier en acht weggebruikers)",
    type: "QUIZ" as const,
    content: {
      type: "QUIZ",
      passingScore: 70,
      questions: [
        exercise("28", `${ORDER_Q} (Met rijwielpad — M.R.P.)`,
          ["VF 1+4 — (1W4) 4 – 1 + f3 – f2 of (4W1) 1 – 4 + f2 – f3", "f2 + f3 – 1 + 4", "VF 1+4 — (1W4) 4 + f3 + f2 – 1 of (4W1) 1 + f2 + f3 – 4"], 2,
          "Auto's 1 en 4 zijn twee rechtsaffers tegenover elkaar op een smalle weg: <strong>VF</strong>. De fietsers f2 en f3 slaan af over het <strong>rijwielpad</strong> en rijden allebei mee in de eerste beurt. Oplossing: <strong>VF 1+4 — (1W4) 4 + f3 + f2 – 1 of (4W1) 1 + f2 + f3 – 4</strong>."),
        exercise("29", `${ORDER_Q} (Zonder rijwielpad — Z.R.P.)`,
          ["VF 1+4 — (1W4) 4 – 1 + f3 – f2 of (4W1) 1 – 4 + f2 – f3", "VF 1+4 — (1W4) 4 + f3 + f2 – 1 of (4W1) 1 + f2 + f3 – 4", "1 + 4 – f2 + f3"], 0,
          "Dezelfde bewegingen als situatie 28, maar nu <strong>zonder rijwielpad</strong>. Volgens LET OP-regel 5 rijdt een fiets dan niet samen met de auto waarmee hij rechtsaf slaat. Wenkt 1 naar 4, dan rijdt eerst 4, daarna 1 samen met f3, en als laatste f2. Wenkt 4 naar 1, dan is het andersom. Oplossing: <strong>VF 1+4 — (1W4) 4 – 1 + f3 – f2 of (4W1) 1 – 4 + f2 – f3</strong>."),
        exercise("30", `${ORDER_Q} (De weg van boven naar beneden is een zandweg; de weg van links naar rechts heeft een rijwielpad.)`,
          [
            "1 + f2 – 7 + f6 – 4 + 5 – f3 + f8",
            "VF 4+f3 — (f3W4) 4 – 5 + f8 + f3 – f2 + 1 – 7 + f6 of (4Wf3) f3 + 5 – 4 – f8 – f2 + 1 – f6 + 7",
            "VF 4+f3 — (f3W4) 4 – f3 – f2 + 1 – 7 + f6 – 5 + f8 of (4Wf3) f3 – 4 – f2 + 1 – f6 + 7 – 5 + f8",
          ], 1,
          "Het verkeer op de <strong>verharde weg</strong> (4, 5, f3 en f8) gaat voor het verkeer op de <strong>zandweg</strong> (1, f2, f6 en 7): LET OP-regel 8. Tussen 4 en f3 wordt <strong>VF</strong> toegepast. Pas als de verharde weg vrij is, rijdt het verkeer van de zandweg. Oplossing: <strong>VF 4+f3 — (f3W4) 4 – 5 + f8 + f3 – f2 + 1 – 7 + f6 of (4Wf3) f3 + 5 – 4 – f8 – f2 + 1 – f6 + 7</strong>."),
        exercise("31", `${ORDER_Q} (De weg van boven naar beneden is een zandweg; de weg van links naar rechts heeft een rijwielpad.)`,
          ["f2 – 1 – f7 + 8 – 4 + 5 – f3 + f6", "4 + 5 + f3 + f6 – 1 + f2 – 8 + f7", "4 + 5 – f3 + f6 – f2 – 1 – f7 + 8"], 2,
          "Het verkeer op de <strong>verharde weg</strong> gaat voor het verkeer op de <strong>zandweg</strong> (LET OP-regel 8). 4 en 5 staan tegenover elkaar en slaan allebei linksaf, dus ze rijden samen (regel 2). Daarna de rechtsaffers f3 en f6. Dan pas de zandweg: eerst f2, die rechtdoor gaat, dan 1, en als laatste f7 en 8. Oplossing: <strong>4 + 5 – f3 + f6 – f2 – 1 – f7 + 8</strong>."),
      ],
    },
  },
];
