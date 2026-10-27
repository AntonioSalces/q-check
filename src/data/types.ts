export type BlockId = "b1" | "b2" | "b3" | "b4" | "b5";

export interface Option {
  id: string;
  text: string;
}

export interface Part {
  id: string;
  label: string;
  display: string;
  accept: string[];
}

export interface Side {
  id: string;
  text: string;
}

export interface Keyword {
  label: string;
  accept: string[];
}

interface Base {
  id: string;
  block: BlockId;
  n: number;
  prompt: string;
  note?: string;
  figure?: boolean;
}

export type Question =
  | (Base & { kind: "single"; options: Option[]; correct: string })
  | (Base & { kind: "multi"; options: Option[]; correct: string[] })
  | (Base & { kind: "text"; display: string; accept: string[]; allOf?: string[] })
  | (Base & { kind: "parts"; parts: Part[] })
  | (Base & {
      kind: "match";
      left: Side[];
      right: Side[];
      correct: Record<string, string | string[]>;
    })
  | (Base & { kind: "order"; items: Side[]; correct: string[] })
  | (Base & { kind: "keywords"; display: string; keywords: Keyword[]; min: number });

export interface BlockMeta {
  id: BlockId;
  title: string;
  detail: string;
}
