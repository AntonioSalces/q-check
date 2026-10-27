import type { BlockId } from "../data/types";
import type { AnswerValue, ListFilter } from "./answers";

const KEY = "procesos-industriales-v1";

export interface Persisted {
  answers: Record<string, AnswerValue>;
  checked: Record<string, boolean>;
  revealAll: boolean;
  graded: boolean;
  block: BlockId | "all";
  filter: ListFilter;
}

export const defaultState: Persisted = {
  answers: {},
  checked: {},
  revealAll: false,
  graded: false,
  block: "b1",
  filter: "all",
};

export function loadState(): Persisted {
  if (typeof localStorage === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    if (!parsed || typeof parsed !== "object") return defaultState;
    return {
      ...defaultState,
      ...parsed,
      answers: parsed.answers && typeof parsed.answers === "object" ? parsed.answers : {},
      checked: parsed.checked && typeof parsed.checked === "object" ? parsed.checked : {},
    };
  } catch {
    return defaultState;
  }
}

export function saveState(state: Persisted) {
  localStorage.setItem(KEY, JSON.stringify(state));
}
