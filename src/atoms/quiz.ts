import { atom } from "jotai";

/**
 * Estado de UI do quiz (client-side apenas): as alternativas selecionadas
 * antes de corrigir. Dados do servidor (gabarito, progresso) NÃO passam
 * por aqui — eles vêm via Server Components / Route Handlers.
 */

export type RespostasSelecionadas = Record<number, number>;

export const respostasAtom = atom<RespostasSelecionadas>({});

export const enviandoAtom = atom(false);

export const selecionarAlternativaAtom = atom(
  null,
  (get, set, payload: { perguntaId: number; alternativaId: number }) => {
    set(respostasAtom, {
      ...get(respostasAtom),
      [payload.perguntaId]: payload.alternativaId,
    });
  },
);

export const limparRespostasAtom = atom(null, (_get, set) => {
  set(respostasAtom, {});
});
