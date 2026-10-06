// Real course content, sourced from materiaalrijonderricht/VERKEERSBORDEN.pdf:
// 75 signs, each with its model number and meaning as printed there. `nr`
// numbers them in PDF order; their images are listed in verkeersborden-images.ts. The PDF's own row numbers skip
// and repeat (28/29, 62/63, 64–65 twice), so they are not used.
//
// The PDF gives no meaning for 6 signs; `suggested` marks the meaning filled
// in here. The owner kept them as they are until the instructor corrects them. Signs without a model number in the PDF
// have no `model`.
//
// The signs are grouped by kind into six lessons, each followed by a quiz:
// one question per sign, "what does this sign mean?", with two wrong answers
// taken from other signs in the same group.

import { SIGN_IMAGES } from "./verkeersborden-images";

type Sign = { nr: number; model?: string; meaning: string; suggested?: true };
type Group = { title: string; intro: string; signs: Sign[] };

const GROUPS: Group[] = [
  {
    title: "Voorrangsborden",
    intro: "Deze borden regelen wie er voorrang heeft: op een kruispunt, op een voorrangsweg of op een smalle doorgang.",
    signs: [
      { nr: 1, model: "11", meaning: "Nadering voorrangsweg, -kruising, -splitsing." },
      { nr: 2, model: "12", meaning: "Stop en verleen voorrang aan het verkeer op de andere weg (verplicht te stoppen)." },
      { nr: 3, model: "12d", meaning: "Stop en verleen voorrang aan het verkeer op de andere weg (verplicht te stoppen)." },
      { nr: 4, model: "12a", meaning: "Bord geplaatst bij voorrangskruising of splitsing op de weg waarop het verkeer ter plaatse voorrang heeft." },
      { nr: 5, model: "12b", meaning: "Voorrangskruispunt; zijweg rechts." },
      { nr: 6, model: "12c", meaning: "Voorrangskruispunt; zijweg links." },
      { nr: 31, model: "45", meaning: "Voorrangsweg." },
      { nr: 32, model: "46", meaning: "Einde voorrangsweg." },
      { nr: 23, model: "28", meaning: "Tegenligger heeft voorrang." },
      { nr: 24, model: "29", meaning: "Verkeer in de richting witte pijl heeft voorrang." },
    ],
  },
  {
    title: "Gesloten- en verbodsborden",
    intro: "Ronde borden met een rode rand sluiten een weg af of verbieden iets, voor iedereen of voor een bepaald soort verkeer.",
    signs: [
      { nr: 7, model: "13", meaning: "Verkeer gesloten voor rij- en voertuigen, rij- en trekdieren en vee in beide richtingen." },
      { nr: 8, model: "14", meaning: "Verkeer gesloten voor rij- en voertuigen, rij- en trekdieren en vee in één richting." },
      { nr: 9, model: "15", meaning: "Verboden voor alle motorrijtuigen op meer dan twee wielen." },
      { nr: 10, model: "16", meaning: "Verboden voor motorrijtuigen op twee wielen." },
      { nr: 11, model: "19", meaning: "Verboden voor rijwielen en bromfietsen." },
      { nr: 67, meaning: "Verboden voor voetgangers." },
      { nr: 12, model: "20", meaning: "Gesloten voor rij- of voertuigen die breder zijn dan aangegeven." },
      { nr: 13, model: "21", meaning: "Gesloten voor rij- of voertuigen die hoger zijn dan aangegeven." },
      { nr: 18, model: "25", meaning: "Linksaf verboden voor rij- en voertuigen, rij- of trekdieren." },
      { nr: 19, model: "26", meaning: "Rechtsaf verboden voor rij- en voertuigen, rij- of trekdieren." },
      { nr: 20, model: "26a", meaning: "Verbod om te keren." },
      { nr: 21, model: "27", meaning: "Inhaalverbod voor alle motorrijtuigen op meer dan twee wielen onderling." },
      { nr: 22, model: "27a", meaning: "Einde inhaalverbod voor alle motorrijtuigen op meer dan twee wielen." },
    ],
  },
  {
    title: "Stilstaan, parkeren en snelheid",
    intro: "Deze borden zeggen waar je wel of niet mag wachten of parkeren, en hoe hard je mag rijden.",
    signs: [
      { nr: 26, model: "33", meaning: "Wachtverbod voor beide zijden van de weg." },
      { nr: 73, meaning: "Verbod stil te staan (stopverbod).", suggested: true },
      { nr: 28, model: "43", meaning: "Parkeerplaats." },
      { nr: 33, model: "47", meaning: "Snelheidsbeperking tot de op het bord aangegeven snelheid." },
      { nr: 34, model: "48", meaning: "Einde snelheidsbeperking." },
      { nr: 35, meaning: "Maximumsnelheid voor bromfietsen." },
    ],
  },
  {
    title: "Gebodsborden",
    intro: "Ronde blauwe borden geven een gebod: een richting die je moet volgen of een weg die je moet gebruiken.",
    signs: [
      { nr: 14, model: "23", meaning: "Gesloten voor alle verkeer, rij- of trekdieren en vee in een andere richting dan de pijl aanwijst." },
      { nr: 15, model: "23a", meaning: "Verbod voor alle verkeer, behalve voetgangers, om aan de andere zijde van het bord te rijden of te gaan dan de pijl aangeeft." },
      { nr: 16, meaning: "Rechts of links aanhouden: je mag aan beide zijden langs het bord rijden.", suggested: true },
      { nr: 66, meaning: "Verplicht rechtsaf voor rij- en voertuigen, rij- of trekdieren." },
      { nr: 74, meaning: "Verplichte rijrichting: rechtdoor of rechtsaf.", suggested: true },
      { nr: 63, model: "23d", meaning: "Verplichte rijrichting op een verkeersplein of rotonde." },
      { nr: 27, model: "42", meaning: "Verplicht rijwielpad." },
      { nr: 65, meaning: "Verplicht voetpad." },
    ],
  },
  {
    title: "Waarschuwingsborden",
    intro: "Driehoekige borden met een rode rand waarschuwen voor gevaar verderop. Pas je snelheid aan en let goed op.",
    signs: [
      { nr: 36, model: "50", meaning: "Algemeen gevaarsteken." },
      { nr: 37, model: "51", meaning: "Gevaarlijke bocht(en)." },
      { nr: 38, model: "51a", meaning: "S-bocht of -bochten, eerst naar links." },
      { nr: 39, model: "51b", meaning: "S-bocht of -bochten, eerst naar rechts." },
      { nr: 69, model: "51c", meaning: "Bocht naar rechts." },
      { nr: 68, meaning: "Bocht naar rechts met een zijweg links.", suggested: true },
      { nr: 40, model: "52", meaning: "Gevaarlijk kruispunt." },
      { nr: 41, model: "52a", meaning: "Uitholling overdwars of slecht wegdek." },
      { nr: 42, model: "52b", meaning: "Werk in uitvoering." },
      { nr: 43, model: "52c", meaning: "Steile of gevaarlijke helling." },
      { nr: 44, model: "53", meaning: "Wegversmalling." },
      { nr: 45, model: "53a", meaning: "Wegversmalling aan de rechterzijde van de weg." },
      { nr: 46, model: "53b", meaning: "Wegversmalling aan de linkerzijde van de weg." },
      { nr: 47, model: "53c", meaning: "Slipgevaar." },
      { nr: 51, model: "54", meaning: "Oversteekplaats voor voetgangers." },
      { nr: 52, model: "55", meaning: "Kinderen, school of speelplaats." },
      { nr: 53, model: "56", meaning: "Onbewaakte spoorwegovergang." },
      { nr: 54, model: "56a", meaning: "Kade of rivieroever." },
      { nr: 55, model: "56b", meaning: "Nadering van een plaats waar fietsers en bromfietsers plegen over te steken." },
      { nr: 56, model: "56c", meaning: "Tegenliggers." },
      { nr: 57, model: "56d", meaning: "Laagvliegende vliegtuigen." },
      { nr: 58, model: "56e", meaning: "Nadering van verkeerslichten." },
      { nr: 25, meaning: "Ophaalbrug of beweegbare brug." },
      { nr: 62, meaning: "Nadering van een verkeersdrempel." },
      { nr: 64, model: "23e", meaning: "Nadering van een verkeersplein of rotonde." },
    ],
  },
  {
    title: "Aanwijzingsborden en overige",
    intro: "Deze borden en markeringen geven informatie over de weg, of worden gebruikt door de verkeersbrigadier.",
    signs: [
      { nr: 17, model: "24", meaning: "Eenrichtingsweg." },
      { nr: 29, model: "44", meaning: "Aanwijzing voor de te volgen richting bij een wegafsluiting." },
      { nr: 30, model: "44a", meaning: "Nadering van voorsorteervakken." },
      { nr: 48, model: "53d", meaning: "Doodlopende weg." },
      { nr: 49, model: "53e", meaning: "Vooraanduiding doodlopende weg." },
      { nr: 50, model: "53f", meaning: "Vooraanduiding doodlopende weg." },
      { nr: 59, model: "57", meaning: "Hospitaal of ziekenhuis, geen onnodig lawaai." },
      { nr: 60, model: "61", meaning: "Autoweg." },
      { nr: 61, model: "62", meaning: "Einde autoweg." },
      { nr: 72, meaning: "Voetgangersoversteekplaats.", suggested: true },
      { nr: 70, meaning: "Bord van de verkeersbrigadier om een stopteken te geven." },
      { nr: 71, meaning: "De verkeersbrigadier geeft met dit bord een stopteken: stoppen.", suggested: true },
      { nr: 75, meaning: "Markeringen bij een wegafsluiting (verticale markering) en waar de weg eindigt (bermplank)." },
    ],
  },
];

export const ALL_SIGNS: Sign[] = GROUPS.flatMap((g) => g.signs);

const src = (nr: number) => `/verkeersborden/${SIGN_IMAGES[nr].file}`;
const modelLabel = (s: Sign) => (s.model ? `Model ${s.model}` : "");

function lessonBody(group: Group): string {
  const rows = group.signs
    .map(
      (s) =>
        `<tr><td><img src="${src(s.nr)}" alt="" width="72" height="72" loading="lazy"></td>` +
        `<td>${modelLabel(s)}</td><td>${s.meaning}</td></tr>`,
    )
    .join("");
  return (
    `<p>${group.intro}</p>` +
    `<p>Bekijk elk bord goed en lees wat het betekent. Na deze pagina volgt een oefening.</p>` +
    `<table class="sign-table"><tbody>${rows}</tbody></table>`
  );
}

/** Two wrong answers from the same group, spread through it so neighbours aren't always picked. */
function distractors(group: Group, i: number): string[] {
  const n = group.signs.length;
  const picks: string[] = [];
  for (const step of [Math.ceil(n / 3), Math.ceil((2 * n) / 3), 1, 2, 3]) {
    const s = group.signs[(i + step) % n];
    if (s.meaning !== group.signs[i].meaning && !picks.includes(s.meaning)) picks.push(s.meaning);
    if (picks.length === 2) break;
  }
  return picks;
}

function quizQuestions(group: Group) {
  return group.signs.map((s, i) => {
    const wrong = distractors(group, i);
    const correct = i % 3;
    const options = [...wrong];
    options.splice(correct, 0, s.meaning);
    return {
      text: "Wat betekent dit bord?",
      image: { src: src(s.nr), alt: "Verkeersbord", ...(SIGN_IMAGES[s.nr].width ? { width: SIGN_IMAGES[s.nr].width } : {}) },
      options,
      correct,
      explanation: `${s.model ? `<strong>${modelLabel(s)}</strong>: ` : ""}${s.meaning}`,
    };
  });
}

export const verkeersbordenLessons = GROUPS.flatMap((group) => [
  { title: group.title, type: "TEXT" as const, content: { type: "TEXT", body: lessonBody(group) } },
  {
    title: `Oefenen: ${group.title.toLowerCase()}`,
    type: "QUIZ" as const,
    content: { type: "QUIZ", passingScore: 70, questions: quizQuestions(group) },
  },
]);
