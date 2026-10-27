import { b1 } from "./b1";
import { b2 } from "./b2";
import { b3 } from "./b3";
import { b4 } from "./b4";
import { b5 } from "./b5";
import type { BlockId, BlockMeta, Question } from "./types";

export const BLOCKS: BlockMeta[] = [
  { id: "b1", title: "Examen final A", detail: "Temas 1 al 38" },
  { id: "b2", title: "Conformado", detail: "Forja, laminación, extrusión y estirado" },
  { id: "b3", title: "Fundición", detail: "Diseño y defectos · 58 a 67" },
  { id: "b4", title: "Máquinas-herramienta", detail: "Mecanizado y acabado" },
  { id: "b5", title: "Test de repaso", detail: "Segundo cuestionario" },
];

export const questions: Question[] = [...b1, ...b2, ...b3, ...b4, ...b5];

const seen = new Set<string>();
for (const question of questions) {
  if (seen.has(question.id)) throw new Error(`Pregunta duplicada: ${question.id}`);
  seen.add(question.id);
}

export function questionsOf(block: BlockId | "all"): Question[] {
  if (block === "all") return questions;
  return questions.filter((question) => question.block === block);
}

export function blockTitle(block: BlockId): string {
  return BLOCKS.find((item) => item.id === block)?.title ?? block;
}
