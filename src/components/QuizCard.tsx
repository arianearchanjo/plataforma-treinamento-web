"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  enviandoAtom,
  limparRespostasAtom,
  respostasAtom,
  selecionarAlternativaAtom,
} from "@/atoms/quiz";

export type AlternativaView = { id: number; texto: string };
export type PerguntaView = {
  id: number;
  enunciado: string;
  alternativas: AlternativaView[];
};
export type QuizView = { id: number; perguntas: PerguntaView[] };

type RetornoPergunta = {
  perguntaId: number;
  correta: boolean;
  alternativaEscolhidaId: number | null;
  alternativaCorretaId: number | null;
  explicacao: string | null;
};

type RetornoQuiz = {
  acertos: number;
  total: number;
  notaPercentual: number;
  aprovado: boolean;
  porPergunta: RetornoPergunta[];
};

/**
 * Quiz da lição: alternativas via Radix RadioGroup, estado de seleção via
 * Jotai e correção via Route Handler (`POST /api/quiz/[id]/responder`).
 */
export function QuizCard({ quiz }: { quiz: QuizView }) {
  const router = useRouter();
  const respostas = useAtomValue(respostasAtom);
  const [enviando, setEnviando] = useAtom(enviandoAtom);
  const selecionar = useSetAtom(selecionarAlternativaAtom);
  const limpar = useSetAtom(limparRespostasAtom);
  const [resultado, setResultado] = useState<RetornoQuiz | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const todasRespondidas =
    quiz.perguntas.length > 0 && quiz.perguntas.every((p) => respostas[p.id] != null);

  async function corrigir() {
    setEnviando(true);
    setErro(null);
    try {
      const respostaHttp = await fetch(`/api/quiz/${quiz.id}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respostas: Object.fromEntries(
            Object.entries(respostas).map(([perguntaId, alternativaId]) => [
              perguntaId,
              alternativaId,
            ]),
          ),
        }),
      });
      if (!respostaHttp.ok) {
        throw new Error("Não foi possível corrigir o quiz.");
      }
      const dados = (await respostaHttp.json()) as RetornoQuiz;
      setResultado(dados);
      limpar();
      router.refresh();
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Erro inesperado ao enviar respostas.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section
      aria-label="Quiz da lição"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-bold">Quiz</h2>
      <p className="mt-1 text-sm text-slate-600">
        Responda todas as perguntas e clique em <strong>Corrigir</strong>. Nota mínima: 70%.
      </p>

      <ol className="mt-6 space-y-8">
        {quiz.perguntas.map((pergunta, indice) => {
          const feedback = resultado?.porPergunta.find((r) => r.perguntaId === pergunta.id) ?? null;
          return (
            <li key={pergunta.id}>
              <p className="font-medium">
                {indice + 1}. {pergunta.enunciado}
              </p>
              <RadioGroup.Root
                value={respostas[pergunta.id] != null ? String(respostas[pergunta.id]) : ""}
                onValueChange={(valor) =>
                  selecionar({
                    perguntaId: pergunta.id,
                    alternativaId: Number(valor),
                  })
                }
                disabled={resultado !== null}
                className={`mt-3 space-y-2 rounded-lg p-1 ${
                  feedback ? (feedback.correta ? "bg-green-50" : "bg-red-50") : ""
                }`}
                aria-label={`Alternativas da pergunta ${indice + 1}`}
              >
                {pergunta.alternativas.map((alternativa) => {
                  const marcadaComoCorreta =
                    feedback?.correta === false &&
                    alternativa.id === feedback.alternativaEscolhidaId;
                  const eraGabarito = feedback && alternativa.id === feedback.alternativaCorretaId;
                  return (
                    <RadioGroup.Item
                      key={alternativa.id}
                      value={String(alternativa.id)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors data-disabled:cursor-default data-disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                        marcadaComoCorreta
                          ? "border-red-400"
                          : eraGabarito
                            ? "border-green-500"
                            : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                      }`}
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white">
                        <RadioGroup.Indicator className="size-2.5 rounded-full bg-indigo-600" />
                      </span>
                      <span>{alternativa.texto}</span>
                      {eraGabarito && (
                        <span className="ml-auto text-xs font-semibold text-green-700">
                          ✓ gabarito
                        </span>
                      )}
                      {marcadaComoCorreta && (
                        <span className="ml-auto text-xs font-semibold text-red-600">
                          ✗ sua resposta
                        </span>
                      )}
                    </RadioGroup.Item>
                  );
                })}
              </RadioGroup.Root>
              {feedback?.explicacao && (
                <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <strong>Explicação:</strong> {feedback.explicacao}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {erro && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      {resultado ? (
        <div
          className={`mt-6 rounded-lg px-4 py-3 text-sm ${
            resultado.aprovado ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"
          }`}
        >
          <p className="font-semibold">
            {resultado.aprovado ? "🎉 Parabéns!" : "Quase lá!"} Você acertou {resultado.acertos} de{" "}
            {resultado.total} ({resultado.notaPercentual}%).
          </p>
          {!resultado.aprovado && <p>Revise as explicações acima e tente de novo.</p>}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void corrigir()}
          disabled={!todasRespondidas || enviando}
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? "Corrigindo…" : "Corrigir respostas"}
        </button>
      )}
      {!resultado && !todasRespondidas && (
        <p className="mt-2 text-xs text-slate-500">
          Responda todas as perguntas para liberar a correção.
        </p>
      )}
    </section>
  );
}
