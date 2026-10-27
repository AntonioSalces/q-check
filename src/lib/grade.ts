import type { AnswerValue } from "./answers";
import type { Question } from "../data/types";

export interface PartFeedback {
  label: string;
  ok: boolean;
  user: string;
  correct: string;
}

export interface GradeResult {
  status: "unanswered" | "correct" | "incorrect";
  correctLines: string[];
  userLines: string[];
  parts?: PartFeedback[];
  found?: number;
  needed?: number;
}

export function norm(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[µμ]/g, "u")
    .replace(/[º°]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ces")) return `${word.slice(0, -3)}z`;
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

/** Compara una respuesta libre con una frase aceptada, sin trocear palabras. */
export function hit(value: string, phrase: string): boolean {
  const h = norm(value);
  const p = norm(phrase);
  if (!h || !p) return false;
  const hWords = h.split(" ");
  const pWords = p.split(" ");
  if (hWords.length < pWords.length) return false;
  const stemmed = pWords.map(stem);
  for (let i = 0; i <= hWords.length - stemmed.length; i += 1) {
    let ok = true;
    for (let j = 0; j < stemmed.length; j += 1) {
      const word = hWords[i + j] ?? "";
      const target = stemmed[j] ?? "";
      if (stem(word) !== target && word !== target) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

export function hitsAny(value: string, phrases: string[]): boolean {
  return phrases.some((phrase) => hit(value, phrase));
}

function letter(index: number): string {
  return String.fromCharCode(97 + index);
}

function optionLine(options: { id: string; text: string }[], id: string): string {
  const index = options.findIndex((option) => option.id === id);
  const option = options[index];
  if (!option || index < 0) return "Respuesta no válida";
  return `${letter(index)}) ${option.text}`;
}

export function grade(q: Question, answer: AnswerValue | undefined): GradeResult {
  switch (q.kind) {
    case "single": {
      const correctLines = [optionLine(q.options, q.correct)];
      if (!answer || answer.t !== "single" || !answer.v) {
        return { status: "unanswered", correctLines, userLines: [] };
      }
      return {
        status: answer.v === q.correct ? "correct" : "incorrect",
        correctLines,
        userLines: [optionLine(q.options, answer.v)],
      };
    }
    case "multi": {
      const correctLines = q.correct.map((id) => optionLine(q.options, id));
      if (!answer || answer.t !== "multi" || answer.v.length === 0) {
        return { status: "unanswered", correctLines, userLines: [] };
      }
      const chosen = new Set(answer.v);
      const needed = new Set(q.correct);
      const same =
        chosen.size === needed.size && [...needed].every((id) => chosen.has(id));
      return {
        status: same ? "correct" : "incorrect",
        correctLines,
        userLines: answer.v.map((id) => optionLine(q.options, id)),
      };
    }
    case "text": {
      const correctLines = [q.display];
      if (!answer || answer.t !== "text" || !answer.v.trim()) {
        return { status: "unanswered", correctLines, userLines: [] };
      }
      const anyOk = q.accept.length === 0 || hitsAny(answer.v, q.accept);
      const allOk = !q.allOf?.length || q.allOf.every((phrase) => hit(answer.v, phrase));
      return {
        status: anyOk && allOk ? "correct" : "incorrect",
        correctLines,
        userLines: [answer.v.trim()],
      };
    }
    case "parts": {
      const values = answer?.t === "parts" ? answer.v : {};
      const parts: PartFeedback[] = q.parts.map((part) => {
        const user = values[part.id]?.trim() ?? "";
        return {
          label: part.label,
          user,
          correct: part.display,
          ok: user.length > 0 && hitsAny(user, part.accept),
        };
      });
      const any = parts.some((part) => part.user.length > 0);
      return {
        status: !any ? "unanswered" : parts.every((part) => part.ok) ? "correct" : "incorrect",
        correctLines: parts.map((part) => `${part.label}: ${part.correct}`),
        userLines: parts.map((part) => `${part.label}: ${part.user || "en blanco"}`),
        parts,
      };
    }
    case "match": {
      const values = answer?.t === "match" ? answer.v : {};
      const parts: PartFeedback[] = q.left.map((left) => {
        const chosenId = values[left.id] ?? "";
        const chosen = q.right.find((right) => right.id === chosenId);
        const accepted = q.correct[left.id];
        const acceptedIds = Array.isArray(accepted) ? accepted : [accepted ?? ""];
        const correct = acceptedIds
          .map((id) => q.right.find((right) => right.id === id)?.text ?? "")
          .filter(Boolean)
          .join(" o ");
        return {
          label: left.text,
          user: chosen?.text ?? "",
          correct,
          ok: chosenId.length > 0 && acceptedIds.includes(chosenId),
        };
      });
      const any = parts.some((part) => part.user.length > 0);
      return {
        status: !any ? "unanswered" : parts.every((part) => part.ok) ? "correct" : "incorrect",
        correctLines: parts.map((part) => `${part.label} → ${part.correct}`),
        userLines: parts.map((part) => `${part.label} → ${part.user || "sin elegir"}`),
        parts,
      };
    }
    case "order": {
      const label = (id: string) => q.items.find((item) => item.id === id)?.text ?? id;
      const correctLines = q.correct.map((id, index) => `${index + 1}. ${label(id)}`);
      if (!answer || answer.t !== "order") {
        return { status: "unanswered", correctLines, userLines: [] };
      }
      const same =
        answer.v.length === q.correct.length &&
        answer.v.every((id, index) => id === q.correct[index]);
      return {
        status: same ? "correct" : "incorrect",
        correctLines,
        userLines: answer.v.map((id, index) => `${index + 1}. ${label(id)}`),
      };
    }
    case "keywords": {
      const correctLines = [q.display];
      if (!answer || answer.t !== "keywords" || !answer.v.trim()) {
        return { status: "unanswered", correctLines, userLines: [], found: 0, needed: q.min };
      }
      const parts: PartFeedback[] = q.keywords.map((keyword) => ({
        label: keyword.label,
        user: "",
        correct: keyword.label,
        ok: hitsAny(answer.v, keyword.accept),
      }));
      const found = parts.filter((part) => part.ok).length;
      return {
        status: found >= q.min ? "correct" : "incorrect",
        correctLines,
        userLines: [answer.v.trim()],
        parts,
        found,
        needed: q.min,
      };
    }
    default: {
      const unreachable: never = q;
      return unreachable;
    }
  }
}
