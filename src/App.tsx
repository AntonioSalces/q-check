import { RotateCcw, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { BLOCKS, blockTitle, questions, questionsOf } from "@/data";
import type { AnswerValue, ListFilter } from "@/lib/answers";
import { grade, norm } from "@/lib/grade";
import { defaultState, loadState, saveState, type Persisted } from "@/lib/storage";
import { cn } from "@/lib/utils";

const filtersBefore: { id: ListFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "pending", label: "Sin responder" },
  { id: "answered", label: "Respondidas" },
];

const filtersAfter: { id: ListFilter; label: string }[] = [
  { id: "wrong", label: "Falladas" },
  { id: "all", label: "Todas" },
  { id: "correct", label: "Acertadas" },
  { id: "pending", label: "Sin responder" },
];

export default function App() {
  const [state, setState] = useState<Persisted>(() => loadState());
  const [query, setQuery] = useState("");
  const migratedChecked = useRef(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (migratedChecked.current) return;
    migratedChecked.current = true;
    setState((current) => {
      if (!current.graded || Object.keys(current.checked).length > 0) return current;
      const checked: Record<string, boolean> = {};
      for (const question of questions) checked[question.id] = true;
      return { ...current, checked };
    });
  }, []);

  const scope = useMemo(() => questionsOf(state.block), [state.block]);
  const needle = norm(query);

  const stats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    for (const question of scope) {
      const status = grade(question, state.answers[question.id]).status;
      if (status === "correct") correct += 1;
      else if (status === "incorrect") incorrect += 1;
      else unanswered += 1;
    }
    return { correct, incorrect, unanswered, total: scope.length, answered: correct + incorrect };
  }, [scope, state.answers]);

  const activeFilter: ListFilter =
    !state.graded && (state.filter === "wrong" || state.filter === "correct") ? "all" : state.filter;

  const visible = scope.filter((question) => {
    if (needle) {
      const blob = norm(`${question.n} ${question.prompt}`);
      if (!blob.includes(needle)) return false;
    }
    const status = grade(question, state.answers[question.id]).status;
    if (activeFilter === "pending") return status === "unanswered";
    if (activeFilter === "answered") return status !== "unanswered";
    if (activeFilter === "wrong") return status === "incorrect";
    if (activeFilter === "correct") return status === "correct";
    return true;
  });

  function patch(partial: Partial<Persisted>) {
    setState((current) => ({ ...current, ...partial }));
  }

  function setAnswer(id: string, value: AnswerValue | undefined) {
    setState((current) => {
      const answers = { ...current.answers };
      const checked = { ...current.checked };
      if (!value) {
        delete answers[id];
        delete checked[id];
      } else {
        answers[id] = value;
        delete checked[id];
      }
      return { ...current, answers, checked };
    });
  }

  function checkOne(id: string) {
    setState((current) => ({
      ...current,
      checked: { ...current.checked, [id]: true },
    }));
  }

  function clearOne(id: string) {
    setState((current) => {
      const answers = { ...current.answers };
      const checked = { ...current.checked };
      delete answers[id];
      delete checked[id];
      return { ...current, answers, checked };
    });
  }

  function corregir() {
    const wrong = scope.filter((question) => grade(question, state.answers[question.id]).status === "incorrect").length;
    setState((current) => {
      const checked = { ...current.checked };
      for (const question of scope) checked[question.id] = true;
      return {
        ...current,
        checked,
        graded: true,
        filter: wrong > 0 ? "wrong" : "all",
      };
    });
    requestAnimationFrame(() => {
      document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggleReveal() {
    patch({ revealAll: !state.revealAll, filter: state.revealAll ? state.filter : "all" });
  }

  function resetScope() {
    const label = state.block === "all" ? "todas las preguntas" : `el bloque ${blockTitle(state.block)}`;
    if (!window.confirm(`Se borrarán las respuestas de ${label}. Esta acción no se puede deshacer.`)) return;
    setState((current) => {
      const answers = { ...current.answers };
      const checked = { ...current.checked };
      for (const question of scope) {
        delete answers[question.id];
        delete checked[question.id];
      }
      return { ...current, answers, checked, graded: false, revealAll: false, filter: "all" };
    });
  }

  const scopeLabel = state.block === "all" ? "todos los bloques" : blockTitle(state.block);
  function cuenta(n: number, singular: string, plural: string) {
    return `${n} ${n === 1 ? singular : plural}`;
  }
  const progress = stats.total === 0 ? 0 : Math.round((stats.answered / stats.total) * 100);

  return (
    <div className="min-h-screen pb-32">
      <header className="border-b border-line bg-card/90">
        <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-brass uppercase">Ingeniería de Diseño</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight md:text-4xl">Procesos industriales</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            {questions.length} preguntas de fundición, conformado, mecanizado y organización de la producción.
            Responde el bloque y pulsa <strong className="font-semibold text-ink">Corregir</strong> para ver solo las
            que has fallado, con la opción correcta señalada.{" "}
            <strong className="font-semibold text-ink">Mostrar todas las correctas</strong> abre la clave del bloque en
            el que estás.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        <div className="flex max-w-full gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Bloques">
          <BlockButton
            pressed={state.block === "all"}
            title="Todos"
            detail={`${questions.length}`}
            onClick={() => patch({ block: "all" })}
          />
          {BLOCKS.map((block) => (
            <BlockButton
              key={block.id}
              pressed={state.block === block.id}
              title={block.title}
              detail={block.detail}
              onClick={() => patch({ block: block.id })}
            />
          ))}
        </div>

        <section className="mt-4 rounded-2xl border border-line bg-card px-4 py-4" id="resultado">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Progreso en {scopeLabel}</p>
              <p className="font-serif text-2xl font-semibold">
                {stats.answered}
                <span className="text-muted">/{stats.total}</span>
              </p>
            </div>
            {state.graded && (
              <div className="flex flex-wrap gap-2">
                <Badge tone="moss">{cuenta(stats.correct, "acertada", "acertadas")}</Badge>
                <Badge tone="clay">{cuenta(stats.incorrect, "fallada", "falladas")}</Badge>
                <Badge>{cuenta(stats.unanswered, "sin responder", "sin responder")}</Badge>
              </div>
            )}
          </div>
          <div className="mt-3">
            <Progress value={progress} label={`Has respondido el ${progress} por ciento de ${scopeLabel}`} />
          </div>
          {state.graded && (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {stats.incorrect === 0
                ? `No has fallado ninguna pregunta respondida en ${scopeLabel}.`
                : stats.incorrect === 1
                  ? `Esta es la pregunta que has fallado en ${scopeLabel}. En verde, la correcta; en rojo, la tuya.`
                  : `Estas son las ${stats.incorrect} que has fallado en ${scopeLabel}. En verde, la correcta; en rojo, la tuya.`}
              {stats.unanswered > 0 && ` Hay ${stats.unanswered} sin responder: no cuentan como fallo hasta que contestes.`}
            </p>
          )}
          {state.revealAll && (
            <p className="mt-3 text-sm leading-relaxed text-moss">
              Clave visible de {scopeLabel}. Cambia de bloque si quieres ver otra parte del examen.
            </p>
          )}
        </section>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              value={query}
              placeholder="Buscar por enunciado o número"
              aria-label="Buscar preguntas"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button variant="ghost" onClick={resetScope}>
            <RotateCcw className="size-4" />
            Borrar respuestas
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Filtro de preguntas">
          {(state.graded ? filtersAfter : filtersBefore).map((filter) => (
            <button
              key={filter.id}
              type="button"
              aria-pressed={activeFilter === filter.id}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-semibold",
                activeFilter === filter.id ? "border-moss bg-moss text-white" : "border-line bg-card text-ink",
              )}
              onClick={() => patch({ filter: filter.id })}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-card px-5 py-10 text-center">
              <p className="font-serif text-xl">No hay preguntas en esta vista.</p>
              <p className="mt-2 text-sm text-muted">
                {state.graded && activeFilter === "wrong"
                  ? "O no has fallado ninguna, o el buscador está dejando fuera el resto."
                  : "Prueba con otro bloque, otro filtro o un texto de búsqueda más corto."}
              </p>
              <Button className="mt-4" variant="outline" onClick={() => patch({ filter: "all" })}>
                Ver todas
              </Button>
            </div>
          ) : (
            visible.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                answer={state.answers[question.id]}
                checked={Boolean(state.checked[question.id])}
                reveal={state.revealAll}
                onChange={(value) => setAnswer(question.id, value)}
                onCheck={() => checkOne(question.id)}
                onClear={() => clearOne(question.id)}
              />
            ))
          )}
        </div>

        <footer className="mt-10 text-sm leading-relaxed text-muted">
          <p>
            La clave sigue la recopilación de Procesos industriales. Si el examen y el criterio técnico no coinciden, la
            nota de la pregunta lo explica. Las respuestas se guardan en este navegador.
          </p>
          {state.graded && (
            <button
              type="button"
              className="mt-3 font-semibold text-ink underline decoration-brass underline-offset-4"
              onClick={() => {
                if (!window.confirm("Se borrarán todas las respuestas de todos los bloques.")) return;
                setState({ ...defaultState, answers: {} });
                setQuery("");
              }}
            >
              Empezar de cero en todos los bloques
            </button>
          )}
        </footer>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-3 sm:flex-row">
          <Button className="flex-1" size="lg" onClick={corregir}>
            Corregir
          </Button>
          <Button className="flex-1" size="lg" variant="outline" onClick={resetScope}>
            <RotateCcw className="size-4" />
            Quitar respuestas
          </Button>
          <Button className="flex-1" size="lg" variant={state.revealAll ? "brass" : "outline"} onClick={toggleReveal}>
            {state.revealAll ? "Ocultar respuestas" : "Mostrar todas las correctas"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BlockButton({
  pressed,
  title,
  detail,
  onClick,
}: {
  pressed: boolean;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={pressed}
      onClick={onClick}
      className={cn(
        "min-w-40 shrink-0 rounded-xl border px-3 py-2 text-left",
        pressed ? "border-moss bg-moss text-white" : "border-line bg-card text-ink",
      )}
    >
      <span className="block text-sm font-semibold">{title}</span>
      <span className={cn("block text-xs", pressed ? "text-white/80" : "text-muted")}>{detail}</span>
    </button>
  );
}
