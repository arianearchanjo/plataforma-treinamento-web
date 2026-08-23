export type AlternativaCorrecao = { id: number; correta: boolean };
export type PerguntaCorrecao = {
  id: number;
  alternativas: AlternativaCorrecao[];
};

/** Mapa perguntaId (string, pois vem de JSON) -> alternativaId escolhida */
export type RespostasUsuario = Record<string, number>;

export type ResultadoPorPergunta = {
  perguntaId: number;
  respondida: boolean;
  correta: boolean;
  alternativaEscolhidaId: number | null;
  alternativaCorretaId: number | null;
};

export type ResultadoQuiz = {
  total: number;
  acertos: number;
  notaPercentual: number;
  aprovado: boolean;
  porPergunta: ResultadoPorPergunta[];
};

/** Nota mínima (em %) para o quiz ser considerado aprovado. */
export const NOTA_MINIMA_PERCENTUAL = 70;

/**
 * Lógica pura de correção: dadas as perguntas (com o gabarito) e as respostas
 * do usuário, calcula acertos/nota. Não depende de banco nem de framework.
 *
 * Regras:
 * - Alternativa inexistente ou ausência de resposta conta como "não respondida".
 * - Aprovado exige nota >= NOTA_MINIMA_PERCENTUAL e pelo menos 1 pergunta.
 */
export function corrigirQuiz(
  perguntas: PerguntaCorrecao[],
  respostas: RespostasUsuario,
): ResultadoQuiz {
  const porPergunta = perguntas.map((pergunta) => {
    const escolhidaBruta = respostas[String(pergunta.id)];
    const existeAlternativa =
      escolhidaBruta !== undefined && pergunta.alternativas.some((a) => a.id === escolhidaBruta);
    const alternativaEscolhidaId = existeAlternativa ? escolhidaBruta : null;
    const corretaDoGabarito = pergunta.alternativas.find((a) => a.correta) ?? null;

    return {
      perguntaId: pergunta.id,
      respondida: alternativaEscolhidaId !== null,
      correta:
        alternativaEscolhidaId !== null &&
        corretaDoGabarito !== null &&
        alternativaEscolhidaId === corretaDoGabarito.id,
      alternativaEscolhidaId,
      alternativaCorretaId: corretaDoGabarito?.id ?? null,
    } satisfies ResultadoPorPergunta;
  });

  const total = perguntas.length;
  const acertos = porPergunta.filter((p) => p.correta).length;
  const notaPercentual = total === 0 ? 0 : Math.round((acertos / total) * 100);

  return {
    total,
    acertos,
    notaPercentual,
    aprovado: total > 0 && notaPercentual >= NOTA_MINIMA_PERCENTUAL,
    porPergunta,
  };
}
