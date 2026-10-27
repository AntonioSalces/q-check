import type { BlockId, Question } from "./types";

type Extra = string | { note?: string; figure?: boolean } | undefined;

function extraOf(extra?: Extra): { note?: string; figure?: boolean } {
  if (typeof extra === "string") return { note: extra };
  if (!extra) return {};
  const out: { note?: string; figure?: boolean } = {};
  if (extra.note) out.note = extra.note;
  if (extra.figure) out.figure = true;
  return out;
}

function optionsOf(options: string[]) {
  return options.map((text, index) => ({
    id: String.fromCharCode(97 + index),
    text,
  }));
}

export function single(
  block: BlockId,
  n: number,
  prompt: string,
  options: string[],
  correctIndex: number,
  extra?: Extra,
): Question {
  const opts = optionsOf(options);
  const correct = opts[correctIndex];
  if (!correct) throw new Error(`Índice inválido en ${block}-${n}`);
  return {
    id: `${block}-${n}`,
    block,
    n,
    prompt,
    kind: "single",
    options: opts,
    correct: correct.id,
    ...extraOf(extra),
  };
}

export function tf(
  block: BlockId,
  n: number,
  prompt: string,
  verdad: boolean,
  extra?: Extra,
): Question {
  return single(block, n, prompt, ["Verdadero", "Falso"], verdad ? 0 : 1, extra);
}

export function multi(
  block: BlockId,
  n: number,
  prompt: string,
  options: string[],
  correctIndexes: number[],
  extra?: Extra,
): Question {
  const opts = optionsOf(options);
  const correct = correctIndexes.map((index) => {
    const option = opts[index];
    if (!option) throw new Error(`Índice inválido en ${block}-${n}`);
    return option.id;
  });
  return {
    id: `${block}-${n}`,
    block,
    n,
    prompt,
    kind: "multi",
    options: opts,
    correct,
    ...extraOf(extra),
  };
}

type TextExtra = string | { note?: string; figure?: boolean; allOf?: string[] } | undefined;

export function textq(
  block: BlockId,
  n: number,
  prompt: string,
  display: string,
  accept: string[],
  extra?: TextExtra,
): Question {
  const bag = typeof extra === "string" ? { note: extra } : extra;
  if (accept.length === 0 && !bag?.allOf?.length) {
    throw new Error(`Texto sin criterio en ${block}-${n}`);
  }
  return {
    id: `${block}-${n}`,
    block,
    n,
    prompt,
    kind: "text",
    display,
    accept,
    ...(bag && "allOf" in bag && bag.allOf ? { allOf: bag.allOf } : {}),
    ...extraOf(typeof extra === "string" ? extra : bag),
  };
}

export function partsq(
  block: BlockId,
  n: number,
  prompt: string,
  parts: { label: string; display: string; accept: string[] }[],
  extra?: Extra,
): Question {
  return {
    id: `${block}-${n}`,
    block,
    n,
    prompt,
    kind: "parts",
    parts: parts.map((part, index) => ({ ...part, id: `p${index}` })),
    ...extraOf(extra),
  };
}

export function matchq(
  block: BlockId,
  n: number,
  prompt: string,
  left: string[],
  right: string[],
  correct: Array<number | number[]>,
  extra?: Extra,
): Question {
  if (correct.length !== left.length) throw new Error(`Emparejado incompleto en ${block}-${n}`);
  const leftSides = left.map((text, index) => ({ id: `l${index}`, text }));
  const rightSides = right.map((text, index) => ({ id: `r${index}`, text }));
  const map: Record<string, string | string[]> = {};
  correct.forEach((choice, index) => {
    const toId = (rightIndex: number) => {
      const side = rightSides[rightIndex];
      if (!side) throw new Error(`Columna derecha inválida en ${block}-${n}`);
      return side.id;
    };
    const leftSide = leftSides[index];
    if (!leftSide) throw new Error(`Columna izquierda inválida en ${block}-${n}`);
    map[leftSide.id] = Array.isArray(choice) ? choice.map(toId) : toId(choice);
  });
  return {
    id: `${block}-${n}`,
    block,
    n,
    prompt,
    kind: "match",
    left: leftSides,
    right: rightSides,
    correct: map,
    ...extraOf(extra),
  };
}

export function orderq(
  block: BlockId,
  n: number,
  prompt: string,
  items: string[],
  extra?: Extra,
): Question {
  const sides = items.map((text, index) => ({ id: `i${index}`, text }));
  return {
    id: `${block}-${n}`,
    block,
    n,
    prompt,
    kind: "order",
    items: sides,
    correct: sides.map((item) => item.id),
    ...extraOf(extra),
  };
}

export function keywordsq(
  block: BlockId,
  n: number,
  prompt: string,
  display: string,
  keywords: { label: string; accept: string[] }[],
  min: number,
  extra?: Extra,
): Question {
  return {
    id: `${block}-${n}`,
    block,
    n,
    prompt,
    kind: "keywords",
    display,
    keywords,
    min,
    ...extraOf(extra),
  };
}
