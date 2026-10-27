export type AnswerValue =
  | { t: "single"; v: string }
  | { t: "multi"; v: string[] }
  | { t: "text"; v: string }
  | { t: "parts"; v: Record<string, string> }
  | { t: "match"; v: Record<string, string> }
  | { t: "order"; v: string[] }
  | { t: "keywords"; v: string };

export type ListFilter = "all" | "pending" | "answered" | "wrong" | "correct";
