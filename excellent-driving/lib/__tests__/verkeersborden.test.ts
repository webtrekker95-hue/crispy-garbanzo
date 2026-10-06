import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { ALL_SIGNS, verkeersbordenLessons } from "../../prisma/content/verkeersborden";
import { SIGN_IMAGES } from "../../prisma/content/verkeersborden-images";

type Question = { options: string[]; correct: number; explanation: string; image: { src: string; alt: string; width?: number } };

describe("verkeersborden content", () => {
  it("uses each of the 75 signs from the PDF exactly once, and every image exists", () => {
    const nrs = ALL_SIGNS.map((s) => s.nr).sort((a, b) => a - b);
    expect(nrs).toEqual(Array.from({ length: 75 }, (_, i) => i + 1));
    for (const { nr } of ALL_SIGNS) {
      expect(existsSync(join(__dirname, "../../public/verkeersborden", SIGN_IMAGES[nr].file))).toBe(true);
    }
    // Nothing in the folder that no sign uses.
    expect(readdirSync(join(__dirname, "../../public/verkeersborden")).sort()).toEqual(Object.values(SIGN_IMAGES).map((i) => i.file).sort());
  });

  it("alternates a lesson page and a quiz that asks about every sign on that page", () => {
    expect(verkeersbordenLessons.map((l) => l.type)).toEqual(Array(6).fill(["TEXT", "QUIZ"]).flat());
    for (let i = 0; i < verkeersbordenLessons.length; i += 2) {
      const body = (verkeersbordenLessons[i].content as { body: string }).body;
      const questions = (verkeersbordenLessons[i + 1].content as { questions: Question[] }).questions;
      expect(questions.map((q) => q.image.src)).toEqual([...body.matchAll(/src="([^"]+)"/g)].map((m) => m[1]));
    }
  });

  it("gives every question three different options, with the sign's own meaning as the answer", () => {
    const quizzes = verkeersbordenLessons.filter((l) => l.type === "QUIZ");
    const questions = quizzes.flatMap((l) => (l.content as { questions: Question[] }).questions);
    expect(questions).toHaveLength(75);
    questions.forEach((q) => {
      expect(new Set(q.options).size).toBe(3);
      expect(q.explanation).toContain(q.options[q.correct]);
      // The alt text is read out by screen readers, so it must not give the answer away.
      expect(q.image.alt).toBe("Verkeersbord");
      expect(q.options[q.correct]).toBe(ALL_SIGNS.find((s) => q.image.src === `/verkeersborden/${SIGN_IMAGES[s.nr].file}`)!.meaning);
    });
    // The right answer is not always in the same place.
    expect(new Set(questions.map((q) => q.correct)).size).toBe(3);
  });
});
