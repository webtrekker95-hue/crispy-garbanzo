// Real course content, sourced from materiaalrijonderricht/Maquette les 1a.pdf
// (20 intersection situations), with diagram geometry per
// materiaalrijonderricht/claude_code_build_spec.md. Where the spec's answer key
// disagreed with the les 1 rules (rules 4/5 on Z.R.P., and the Goudenregel),
// the rules win — see SITREP 2026-09-22.
import type { RoadUser, Situation } from "../../lib/maquette";

const auto = (label: string, from: RoadUser["from"], to: RoadUser["to"], hasPriority: boolean): RoadUser => ({
  label, kind: "auto", from, to, hasPriority,
});
const fiets = (label: string, from: RoadUser["from"], to: RoadUser["to"], hasPriority: boolean): RoadUser => ({
  label, kind: "fiets", from, to, hasPriority,
});

// Directions are from the diagram: 1/f/f1 come from the top (noord) heading
// down, 2/f2 from the bottom (zuid) heading up. For a road user coming from
// noord, linksaf = oost and rechtsaf = west; from zuid it's the other way round.
const S: Record<number, Situation> = {
  1: { number: 1, bikeLanes: false, users: [auto("1", "noord", "zuid", true), auto("2", "zuid", "noord", true)] },
  2: { number: 2, bikeLanes: false, users: [auto("1", "noord", "oost", true), auto("2", "zuid", "noord", true)] },
  3: { number: 3, bikeLanes: false, users: [auto("1", "noord", "oost", true), auto("2", "zuid", "west", true)] },
  4: { number: 4, bikeLanes: false, users: [auto("1", "noord", "west", false), auto("2", "zuid", "noord", true)] },
  5: { number: 5, bikeLanes: false, users: [auto("1", "noord", "oost", true), auto("2", "zuid", "oost", false)] },
  6: { number: 6, bikeLanes: false, users: [fiets("f", "noord", "zuid", true), auto("1", "noord", "west", false), auto("2", "zuid", "noord", true)] },
  7: { number: 7, bikeLanes: false, users: [fiets("f", "noord", "oost", true), auto("1", "noord", "west", false), auto("2", "zuid", "noord", true)] },
  8: { number: 8, bikeLanes: false, users: [fiets("f", "noord", "zuid", true), auto("1", "noord", "west", false), auto("2", "zuid", "west", true)] },
  9: { number: 9, bikeLanes: false, users: [fiets("f", "noord", "oost", true), auto("1", "noord", "west", false), auto("2", "zuid", "west", true)] },
  10: { number: 10, bikeLanes: false, users: [fiets("f", "noord", "zuid", true), auto("1", "noord", "oost", false)] },
  11: { number: 11, bikeLanes: false, users: [fiets("f", "noord", "west", false), auto("1", "noord", "oost", true)] },
  12: { number: 12, bikeLanes: false, users: [auto("1", "noord", "oost", false), fiets("f", "noord", "oost", true)] },
  13: { number: 13, bikeLanes: true, users: [auto("1", "noord", "oost", true), fiets("f", "noord", "oost", true)] },
  14: { number: 14, bikeLanes: false, users: [auto("1", "noord", "west", true), fiets("f", "noord", "west", false)] },
  15: { number: 15, bikeLanes: true, users: [auto("1", "noord", "west", true), fiets("f", "noord", "west", true)] },
  16: { number: 16, bikeLanes: false, users: [auto("1", "west", "zuid", true), auto("2", "zuid", "west", true)] },
  17: { number: 17, bikeLanes: false, users: [auto("1", "noord", "west", false), fiets("f", "noord", "west", false), auto("2", "zuid", "noord", true)] },
  18: { number: 18, bikeLanes: true, users: [auto("1", "noord", "west", false), fiets("f", "noord", "west", false), auto("2", "zuid", "west", true)] },
  19: {
    number: 19,
    bikeLanes: false,
    users: [auto("1", "noord", "west", false), fiets("f1", "noord", "zuid", true), auto("2", "zuid", "noord", true), fiets("f2", "zuid", "west", true)],
  },
  20: {
    number: 20,
    bikeLanes: true,
    users: [auto("1", "noord", "zuid", true), fiets("f1", "noord", "oost", true), auto("2", "zuid", "oost", false), fiets("f2", "zuid", "west", true)],
  },
};

const worked = (number: number, solution: string, explanation: string) => ({ situation: S[number], solution, explanation });

const exercise = (number: number, text: string, options: string[], correct: number, explanation: string) => ({
  situation: S[number],
  text: `Situatie ${number}: ${text}`,
  options,
  correct,
  explanation,
});

const ORDER_Q = "in welke volgorde mogen de weggebruikers rijden?";

const readingGuide =
  "<p>In deze les oefen je met 20 kruispuntsituaties. Elke situatie is een kruising van twee <strong>smalle/brede wegen (S/B)</strong> zonder borden, en onthoud: in Suriname hebben wij <strong>linksverkeer</strong>. Linksaf is dus de <em>korte</em> bocht; wie rechtsaf slaat, moet het tegemoetkomende verkeer kruisen.</p>" +
  "<ul>" +
  "<li>Een <strong>rechthoek</strong> is een auto (1, 2), een <strong>bolletje</strong> is een fietser (f, f1, f2).</li>" +
  "<li>Weggebruiker 1 komt van boven, weggebruiker 2 van onder. De pijl laat zien waar ze naartoe willen.</li>" +
  "<li>Een blauwe band langs de weg is een <strong>rijwielpad (M.R.P.)</strong>. Geen band betekent <strong>zonder rijwielpad (Z.R.P.)</strong>.</li>" +
  "<li>Bij de uitwerkingen is <span style=\"color:#16a34a;font-weight:700\">groen</span> = mag rijden en <span style=\"color:#d97706;font-weight:700\">oranje</span> = moet wachten. Bij de oefeningen zie je de kleuren pas nadat je een antwoord hebt gekozen.</li>" +
  "</ul>" +
  "<p>Notatie van de oplossing: <strong>1 + 2</strong> = 1 en 2 rijden samen; <strong>2 – 1</strong> = eerst 2, daarna 1.</p>";

export const maquetteLes1aLessons = [
  {
    title: "Situaties lezen + uitwerkingen 1 en 4",
    type: "TEXT" as const,
    content: {
      type: "TEXT",
      body: readingGuide,
      examples: [
        worked(
          1,
          "1 + 2",
          "1 en 2 staan tegenover elkaar en rijden allebei rechtdoor. Ze behouden hun richting en hun wegen kruisen niet, dus ze mogen <strong>tegelijk</strong> rijden (LET OP-regel 1)."
        ),
        worked(
          4,
          "2 – 1",
          "1 slaat rechtsaf en moet daarbij de weg van 2 kruisen, die rechtdoor gaat. <strong>Goudenregel:</strong> een rechtsaffer verleent altijd voorrang aan een linksaffer en aan rechtdoorgaand verkeer dat tegenover hem staat. Dus eerst 2, daarna 1."
        ),
      ],
    },
  },
  {
    title: "Oefenen: situaties 2, 3 en 5–9",
    type: "QUIZ" as const,
    content: {
      type: "QUIZ",
      passingScore: 70,
      questions: [
        exercise(2, ORDER_Q, ["Eerst 2, dan 1", "1 + 2 (tegelijk)", "Eerst 1, dan 2"], 1,
          "1 slaat linksaf — in linksverkeer de korte bocht — en blijft aan zijn eigen kant, zonder de weg van 2 te kruisen. 2 gaat rechtdoor. Hun wegen kruisen niet, dus <strong>1 + 2</strong>."),
        exercise(3, ORDER_Q, ["1 + 2 (tegelijk)", "Eerst 1, dan 2", "Eerst 2, dan 1"], 0,
          "1 en 2 staan tegenover elkaar en slaan allebei linksaf. Volgens LET OP-regel 2 mogen ze <strong>tegelijk</strong> afslaan: <strong>1 + 2</strong>."),
        exercise(5, ORDER_Q, ["Eerst 2, dan 1", "1 + 2 (tegelijk)", "Eerst 1, dan 2"], 2,
          "1 slaat linksaf, 2 slaat rechtsaf en ze gaan dezelfde weg in. <strong>Goudenregel:</strong> de rechtsaffer (2) verleent voorrang aan de linksaffer die tegenover hem staat. Oplossing: <strong>1 – 2</strong>."),
        exercise(6, ORDER_Q, ["Eerst 1, dan f + 2", "f + 2 tegelijk, dan 1", "Eerst 2, dan 1 + f", "1 + 2 + f tegelijk"], 1,
          "f en 2 gaan allebei rechtdoor en behouden hun richting, dus ze rijden samen. 1 slaat rechtsaf en moet de weg van 2 kruisen; volgens de <strong>Goudenregel</strong> wacht hij. Oplossing: <strong>f + 2 – 1</strong>."),
        exercise(7, ORDER_Q, ["Eerst 1, dan 2 — f mag altijd rijden", "Eerst 2, dan 1 — f mag altijd rijden", "Eerst 2, dan 1 + f", "Eerst f, dan 1, dan 2"], 1,
          "f slaat linksaf (de korte bocht) langs de rand en kruist niemand, dus <strong>f mag altijd rijden</strong>. 1 slaat rechtsaf en wacht volgens de <strong>Goudenregel</strong> op 2, die rechtdoor gaat. Oplossing: <strong>2 – 1</strong>, f vrij."),
        exercise(8, ORDER_Q, ["Eerst 2, dan 1 — f mag altijd rijden", "Eerst 1, dan 2 — f mag altijd rijden", "1 + 2 tegelijk — f mag altijd rijden", "Eerst 2, dan 1 + f"], 0,
          "1 (rechtsaf) en 2 (linksaf) gaan dezelfde weg in. <strong>Goudenregel:</strong> de rechtsaffer wacht op de linksaffer tegenover hem, dus eerst 2, dan 1. f gaat rechtdoor langs de rand en kruist niemand: <strong>f mag altijd rijden</strong>."),
        exercise(9, ORDER_Q, ["Eerst 1, dan 2 — f mag altijd rijden", "Eerst 2, dan 1 + f", "Eerst 2, dan 1 — f mag altijd rijden", "1 + 2 tegelijk — f mag altijd rijden"], 2,
          "Net als bij situatie 8: 1 slaat rechtsaf en wacht volgens de <strong>Goudenregel</strong> op linksaffer 2. f slaat linksaf (de korte bocht) en kruist niemand: <strong>f mag altijd rijden</strong>. Oplossing: <strong>2 – 1</strong>, f vrij."),
      ],
    },
  },
  {
    title: "Oefenen: situaties 10–16 (fietsers en rijwielpaden)",
    type: "QUIZ" as const,
    content: {
      type: "QUIZ",
      passingScore: 70,
      questions: [
        exercise(10, ORDER_Q, ["Eerst 1, dan f", "1 + f (tegelijk)", "Eerst f, dan 1"], 2,
          "f rijdt links van 1 rechtdoor. Als 1 linksaf slaat, kruist hij de weg van f. Volgens LET OP-regel 3 verleent wie rechtdoorgaand verkeer kruist voorrang aan verkeer op dezelfde weg dat zijn richting behoudt. Oplossing: <strong>f – 1</strong>."),
        exercise(11, ORDER_Q, ["Eerst 1, dan f", "Eerst f, dan 1", "1 + f (tegelijk)"], 0,
          "f rijdt aan de linkerkant en slaat rechtsaf, dus hij moet de weg van 1 kruisen. 1 slaat linksaf (de korte bocht) en kruist niemand. Wie de weg van een ander kruist, wacht. Oplossing: <strong>1 – f</strong>."),
        exercise(12, `${ORDER_Q} (Zonder rijwielpad — Z.R.P.)`, ["1 + f (tegelijk)", "Eerst f, dan 1", "Eerst 1, dan f"], 1,
          "1 en f slaan allebei linksaf en er is <strong>geen rijwielpad</strong>. Volgens LET OP-regel 4 rijdt de auto dan niet samen met de fiets. f rijdt aan de linkerkant, dus 1 zou bij het afslaan de weg van f kruisen: 1 wacht. Oplossing: <strong>f – 1</strong>."),
        exercise(13, `${ORDER_Q} (Met rijwielpad — M.R.P.)`, ["Eerst f, dan 1", "Eerst 1, dan f", "1 + f (tegelijk)"], 2,
          "Dezelfde bewegingen als situatie 12, maar nu <strong>met rijwielpad</strong>. f blijft op het rijwielpad en 1 op de rijbaan, dus hun wegen kruisen niet. Oplossing: <strong>1 + f</strong>. Vergelijk met situatie 12 — het rijwielpad maakt het verschil."),
        exercise(14, `${ORDER_Q} (Zonder rijwielpad — Z.R.P.)`, ["Eerst 1, dan f", "1 + f (tegelijk)", "Eerst f, dan 1"], 0,
          "1 en f slaan allebei rechtsaf en er is <strong>geen rijwielpad</strong>. Volgens LET OP-regel 5 rijdt de fiets dan niet samen met de auto. f moet bij het rechtsaf slaan de weg van 1 kruisen: f wacht. Oplossing: <strong>1 – f</strong>."),
        exercise(15, `${ORDER_Q} (Met rijwielpad — M.R.P.)`, ["Eerst 1, dan f", "1 + f (tegelijk)", "Eerst f, dan 1"], 1,
          "Dezelfde bewegingen als situatie 14, maar nu <strong>met rijwielpad</strong>. f slaat af over het rijwielpad en 1 over de rijbaan, dus ze rijden samen. Oplossing: <strong>1 + f</strong>."),
        exercise(16, `${ORDER_Q} (1 komt nu van links.)`, ["Eerst 2, dan 1", "1 + 2 (tegelijk)", "Eerst 1, dan 2"], 1,
          "1 komt van links en slaat rechtsaf, de weg in waar 2 vandaan komt. 2 slaat linksaf (de korte bocht) en blijft aan zijn eigen kant. 1 rijdt de weg in aan de andere kant, dus hun wegen kruisen niet. Oplossing: <strong>1 + 2</strong>."),
      ],
    },
  },
  {
    title: "Uitwerkingen 17 en 18: met en zonder rijwielpad",
    type: "TEXT" as const,
    content: {
      type: "TEXT",
      body:
        "<p>Deze twee situaties combineren de <strong>Goudenregel</strong> met LET OP-regel 5 (auto en fiets slaan allebei rechtsaf). Het enige verschil tussen de twee is het rijwielpad. Kijk wat dat met de volgorde doet.</p>",
      examples: [
        worked(
          17,
          "2 – 1 – f",
          "1 en f slaan rechtsaf, 2 gaat rechtdoor. Volgens de <strong>Goudenregel</strong> wacht rechtsaffer 1 op 2. Er is <strong>geen rijwielpad</strong>, dus volgens regel 5 rijdt f niet samen met de auto. f moet de weg van 1 kruisen en gaat als laatste. Oplossing: <strong>2 – 1 – f</strong>."
        ),
        worked(
          18,
          "2 – 1 + f",
          "2 slaat linksaf, 1 en f slaan rechtsaf dezelfde weg in. Rechtsaffer 1 wacht op linksaffer 2 (<strong>Goudenregel</strong>). Nu is er <strong>wél een rijwielpad</strong>: f slaat af over het rijwielpad en rijdt samen met 1. Oplossing: <strong>2 – 1 + f</strong>."
        ),
      ],
    },
  },
  {
    title: "Oefenen: situaties 19 en 20 (vier weggebruikers)",
    type: "QUIZ" as const,
    content: {
      type: "QUIZ",
      passingScore: 70,
      questions: [
        exercise(19, ORDER_Q, ["Eerst 1, dan 2 — f1 en f2 mogen altijd rijden", "Eerst 2, dan 1 — f1 en f2 mogen altijd rijden", "1 + 2 tegelijk — f1 en f2 mogen altijd rijden", "Eerst f1 en f2, dan 2, dan 1"], 1,
          "1 slaat rechtsaf en 2 gaat rechtdoor. <strong>Goudenregel:</strong> de rechtsaffer wacht op rechtdoorgaand verkeer tegenover hem, dus eerst 2, dan 1. f1 gaat rechtdoor langs de rand en f2 slaat linksaf (de korte bocht). Ze kruisen niemand: <strong>f1 en f2 mogen altijd rijden</strong>."),
        exercise(20, `${ORDER_Q} (Met rijwielpad — M.R.P.)`, ["Eerst 2, dan 1 — f1 en f2 mogen altijd rijden", "1 + 2 tegelijk — f1 en f2 mogen altijd rijden", "Eerst 1, dan 2 — f1 en f2 mogen altijd rijden", "Eerst 1, dan 2, dan f1 en f2"], 2,
          "1 gaat rechtdoor en 2 slaat rechtsaf. <strong>Goudenregel:</strong> rechtsaffer 2 wacht op 1, dus eerst 1, dan 2. f1 en f2 slaan allebei linksaf (de korte bocht) over het rijwielpad en kruisen niemand: <strong>f1 en f2 mogen altijd rijden</strong>."),
      ],
    },
  },
];
