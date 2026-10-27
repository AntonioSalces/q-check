import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo } from "react";
import type { Question } from "@/data/types";
import type { AnswerValue } from "@/lib/answers";
import { grade, type GradeResult } from "@/lib/grade";
import { shuffledDifferent } from "@/lib/shuffle";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

function letter(index: number): string {
  return String.fromCharCode(97 + index);
}

const hints: Record<Question["kind"], string> = {
  single: "Selecciona una respuesta.",
  multi: "Selecciona todas las que correspondan.",
  text: "Escribe la respuesta con tus palabras. Se aceptan variantes claras.",
  parts: "Completa cada apartado.",
  match: "Relaciona cada elemento con su pareja.",
  order: "Ordénalos y confirma. El orden inicial está desordenado a propósito.",
  keywords: "Menciona los términos que se piden. No hace falta una frase larga.",
};

export function QuestionCard({
  question,
  answer,
  graded,
  reveal,
  onChange,
}: {
  question: Question;
  answer: AnswerValue | undefined;
  graded: boolean;
  reveal: boolean;
  onChange: (value: AnswerValue | undefined) => void;
}) {
  const result = grade(question, answer);
  const paint = reveal || (graded && result.status !== "unanswered");
  const showKey = reveal || (graded && result.status === "incorrect");
  const showNote = Boolean(question.note) && (reveal || (graded && result.status !== "unanswered"));

  const orderSeed = useMemo(() => {
    if (question.kind !== "order") return [];
    return shuffledDifferent(
      question.items.map((item) => item.id),
      question.correct,
      question.id,
    );
  }, [question]);

  const rightSeed = useMemo(() => {
    if (question.kind !== "match") return [];
    const ids = question.right.map((item) => item.id);
    return shuffledDifferent(ids, ids, `${question.id}-r`);
  }, [question]);

  const order = answer?.t === "order" ? answer.v : orderSeed;

  function commitOrder(next: string[]) {
    onChange({ t: "order", v: next });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    const current = next[index];
    next[index] = next[target] ?? current;
    next[target] = current;
    commitOrder(next);
  }

  return (
    <article
      id={`pregunta-${question.id}`}
      className={cn(
        "rounded-2xl border bg-card px-4 py-4 shadow-[0_1px_0_rgba(28,25,21,0.04)] md:px-5",
        paint && result.status === "correct" && "border-moss/40",
        paint && result.status === "incorrect" && "border-clay/50",
        !paint && "border-line",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-brass-soft px-2 font-semibold text-brass">
          {question.n}
        </span>
        {paint && result.status === "correct" && <Badge tone="moss">Correcta</Badge>}
        {paint && result.status === "incorrect" && <Badge tone="clay">Fallada</Badge>}
        {question.figure && <Badge tone="brass">Con figura</Badge>}
      </div>

      <h2 className="mt-3 font-serif text-lg leading-snug font-semibold text-ink md:text-xl">{question.prompt}</h2>
      <p className="mt-1 text-sm text-muted">{hints[question.kind]}</p>

      {question.figure && (
        <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-sm leading-relaxed text-muted">
          En el examen esta pregunta iba con una figura. La lámina no está en el banco; se corrige con el enunciado y la clave.
        </p>
      )}

      <div className="mt-4">
        {(question.kind === "single" || question.kind === "multi") && (
          <ul className="space-y-2">
            {question.options.map((option, index) => {
              const chosen =
                question.kind === "single"
                  ? answer?.t === "single" && answer.v === option.id
                  : answer?.t === "multi" && answer.v.includes(option.id);
              const isCorrect =
                question.kind === "single"
                  ? option.id === question.correct
                  : question.correct.includes(option.id);
              return (
                <li key={option.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm leading-relaxed transition-colors",
                      !paint && chosen && "border-moss bg-moss-soft",
                      !paint && !chosen && "border-line bg-white hover:border-moss/40",
                      paint && isCorrect && "border-moss bg-moss-soft",
                      paint && chosen && !isCorrect && "border-clay bg-clay-soft",
                      paint && !chosen && !isCorrect && "border-line bg-white",
                    )}
                  >
                    <input
                      className="mt-1 accent-moss"
                      type={question.kind === "single" ? "radio" : "checkbox"}
                      name={question.id}
                      checked={Boolean(chosen)}
                      onChange={() => {
                        if (question.kind === "single") {
                          onChange({ t: "single", v: option.id });
                          return;
                        }
                        const current = answer?.t === "multi" ? answer.v : [];
                        const next = current.includes(option.id)
                          ? current.filter((id) => id !== option.id)
                          : [...current, option.id];
                        onChange(next.length ? { t: "multi", v: next } : undefined);
                      }}
                    />
                    <span>
                      <span className="font-semibold">{letter(index)})</span> {option.text}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {question.kind === "text" && (
          <Textarea
            value={answer?.t === "text" ? answer.v : ""}
            placeholder="Escribe aquí la respuesta"
            aria-label={`Respuesta de la pregunta ${question.n}`}
            onChange={(event) => {
              const value = event.target.value;
              onChange(value ? { t: "text", v: value } : undefined);
            }}
          />
        )}

        {question.kind === "keywords" && (
          <Textarea
            value={answer?.t === "keywords" ? answer.v : ""}
            placeholder="Escribe los términos separados por comas"
            aria-label={`Respuesta de la pregunta ${question.n}`}
            onChange={(event) => {
              const value = event.target.value;
              onChange(value ? { t: "keywords", v: value } : undefined);
            }}
          />
        )}

        {question.kind === "parts" && (
          <div className="space-y-3">
            {question.parts.map((part) => (
              <label key={part.id} className="block text-sm">
                <span className="mb-1 block font-medium">{part.label}</span>
                <Input
                  value={answer?.t === "parts" ? (answer.v[part.id] ?? "") : ""}
                  onChange={(event) => {
                    const current = answer?.t === "parts" ? { ...answer.v } : {};
                    current[part.id] = event.target.value;
                    const any = Object.values(current).some((value) => value.trim());
                    onChange(any ? { t: "parts", v: current } : undefined);
                  }}
                />
              </label>
            ))}
          </div>
        )}

        {question.kind === "match" && (
          <div className="space-y-3">
            {question.left.map((left) => (
              <label key={left.id} className="grid gap-1 text-sm md:grid-cols-[1fr_1fr] md:items-center md:gap-3">
                <span className="font-medium leading-snug">{left.text}</span>
                <select
                  className="h-11 rounded-lg border border-line bg-white px-3 text-sm outline-none focus-visible:border-moss focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                  value={answer?.t === "match" ? (answer.v[left.id] ?? "") : ""}
                  onChange={(event) => {
                    const current = answer?.t === "match" ? { ...answer.v } : {};
                    current[left.id] = event.target.value;
                    const any = Object.values(current).some(Boolean);
                    onChange(any ? { t: "match", v: current } : undefined);
                  }}
                >
                  <option value="">Elige…</option>
                  {rightSeed.map((id) => {
                    const right = question.right.find((item) => item.id === id);
                    if (!right) return null;
                    return (
                      <option key={right.id} value={right.id}>
                        {right.text}
                      </option>
                    );
                  })}
                </select>
              </label>
            ))}
          </div>
        )}

        {question.kind === "order" && (
          <div>
            <ol className="space-y-2">
              {order.map((id, index) => {
                const item = question.items.find((entry) => entry.id === id);
                if (!item) return null;
                return (
                  <li key={item.id} className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2">
                    <span className="w-6 font-semibold text-brass">{index + 1}</span>
                    <span className="flex-1 text-sm leading-snug">{item.text}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Subir ${item.text}`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Bajar ${item.text}`}
                      disabled={index === order.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                  </li>
                );
              })}
            </ol>
            {answer?.t !== "order" && (
              <Button className="mt-3" size="sm" variant="outline" onClick={() => commitOrder(order)}>
                Confirmar este orden
              </Button>
            )}
          </div>
        )}
      </div>

      {showKey && <Key result={result} reveal={reveal} />}
      {showNote && question.note && (
        <p className="mt-3 rounded-lg bg-brass-soft px-3 py-2 text-sm leading-relaxed text-brass">{question.note}</p>
      )}
    </article>
  );
}

function Key({ result, reveal }: { result: GradeResult; reveal: boolean }) {
  const missing = result.parts?.filter((part) => !part.ok) ?? [];
  return (
    <div className="mt-4 space-y-2 rounded-xl bg-paper px-3 py-3 text-sm leading-relaxed">
      {result.status === "incorrect" && result.userLines.length > 0 && (
        <p>
          <span className="font-semibold text-clay">Tu respuesta: </span>
          {result.userLines.join(" · ")}
        </p>
      )}
      {result.parts && result.status === "incorrect" && (
        <ul className="space-y-1">
          {result.parts.map((part) => (
            <li key={part.label}>
              <span className="font-medium">{part.label}: </span>
              {part.ok ? (
                <span className="text-moss">correcta</span>
              ) : (
                <span>
                  <span className="text-clay">{part.user || "en blanco"}</span>
                  <span className="text-moss"> · correcta: {part.correct}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {typeof result.found === "number" && result.status === "incorrect" && (
        <p className="text-muted">
          Has reconocido {result.found} de {result.needed} términos necesarios.
          {missing.length > 0 && ` Faltan: ${missing.map((part) => part.label).join(", ")}.`}
        </p>
      )}
      <p>
        <span className="font-semibold text-moss">Respuesta correcta: </span>
        {result.correctLines.join(" · ")}
      </p>
    </div>
  );
}
