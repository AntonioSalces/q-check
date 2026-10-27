import type { AnswerValue } from "../src/lib/answers.ts";
import type { Question } from "../src/data/types.ts";
import { questions } from "../src/data/index.ts";
import { grade, hit } from "../src/lib/grade.ts";

function canonical(question: Question): AnswerValue {
  switch (question.kind) {
    case "single":
      return { t: "single", v: question.correct };
    case "multi":
      return { t: "multi", v: [...question.correct] };
    case "text":
      return { t: "text", v: question.display };
    case "parts":
      return {
        t: "parts",
        v: Object.fromEntries(question.parts.map((part) => [part.id, part.display])),
      };
    case "match":
      return {
        t: "match",
        v: Object.fromEntries(
          question.left.map((left) => {
            const choice = question.correct[left.id];
            const id = Array.isArray(choice) ? choice[0] : choice;
            return [left.id, id ?? ""];
          }),
        ),
      };
    case "order":
      return { t: "order", v: [...question.correct] };
    case "keywords":
      return {
        t: "keywords",
        v: question.keywords.map((keyword) => keyword.accept[0] ?? keyword.label).join(". "),
      };
  }
}

const expected: Record<string, { start: number; count: number }> = {
  b1: { start: 1, count: 102 },
  b2: { start: 1, count: 93 },
  b3: { start: 58, count: 10 },
  b4: { start: 1, count: 85 },
  b5: { start: 1, count: 67 },
};

const ids = new Set<string>();
const counts: Record<string, number> = {};
let failed = 0;

for (const question of questions) {
  if (ids.has(question.id)) {
    console.error(`Id duplicado: ${question.id}`);
    failed += 1;
  }
  ids.add(question.id);
  counts[question.block] = (counts[question.block] ?? 0) + 1;

  const result = grade(question, canonical(question));
  if (result.status !== "correct") {
    console.error(`La clave no se autocorrige: ${question.id}`, result.correctLines, result.userLines);
    failed += 1;
  }
  if (grade(question, undefined).status !== "unanswered") {
    console.error(`Una pregunta vacía no queda en blanco: ${question.id}`);
    failed += 1;
  }
  if (question.kind === "single") {
    const other = question.options.find((option) => option.id !== question.correct);
    if (other && grade(question, { t: "single", v: other.id }).status !== "incorrect") {
      console.error(`Una opción distinta no se marca mal: ${question.id}`);
      failed += 1;
    }
  }
}

for (const [block, spec] of Object.entries(expected)) {
  const group = questions.filter((question) => question.block === block);
  if (group.length !== spec.count) {
    console.error(`${block}: hay ${group.length}, se esperaban ${spec.count}`);
    failed += 1;
  }
  group.forEach((question, index) => {
    const n = spec.start + index;
    if (question.n !== n) {
      console.error(`${question.id}: número ${question.n}, se esperaba ${n}`);
      failed += 1;
    }
  });
}

const probes: [string, string, boolean][] = [
  ["extrusion indirecta", "directa", false],
  ["extrusion directa", "directa", true],
  ["portadas", "portada", true],
  ["ceramicos", "ceramico", true],
  ["se forma rebaba", "no se forma rebaba", false],
  ["no se forma rebaba", "no se forma rebaba", true],
  ["materiales tenaces y grandes velocidades", "tenaz", true],
  ["grandes velocidades", "velocidad", true],
];

for (const [value, phrase, should] of probes) {
  const got = hit(value, phrase);
  if (got !== should) {
    console.error(`hit("${value}", "${phrase}") = ${got}, se esperaba ${should}`);
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`${failed} comprobaciones fallidas`);
  process.exit(1);
}

console.log(`OK ${questions.length} preguntas`, counts);
