import { describe, expect, it } from "vitest";
import { corrigirQuiz, NOTA_MINIMA_PERCENTUAL, type PerguntaCorrecao } from "./corrigir-quiz";

const perguntas: PerguntaCorrecao[] = [
  {
    id: 1,
    alternativas: [
      { id: 11, correta: false },
      { id: 12, correta: true },
      { id: 13, correta: false },
      { id: 14, correta: false },
    ],
  },
  {
    id: 2,
    alternativas: [
      { id: 21, correta: true },
      { id: 22, correta: false },
      { id: 23, correta: false },
    ],
  },
];

describe("corrigirQuiz", () => {
  it("acerta todas quando todas as respostas batem com o gabarito", () => {
    const resultado = corrigirQuiz(perguntas, { "1": 12, "2": 21 });
    expect(resultado).toMatchObject({
      total: 2,
      acertos: 2,
      notaPercentual: 100,
      aprovado: true,
    });
  });

  it("conta acerto parcial corretamente", () => {
    const resultado = corrigirQuiz(perguntas, { "1": 12, "2": 22 });
    expect(resultado.acertos).toBe(1);
    expect(resultado.notaPercentual).toBe(50);
    expect(resultado.aprovado).toBe(false);
  });

  it("trata alternativa inexistente como não respondida", () => {
    const resultado = corrigirQuiz(perguntas, { "1": 999, "2": 21 });
    expect(resultado.porPergunta[0]).toMatchObject({
      respondida: false,
      correta: false,
      alternativaEscolhidaId: null,
    });
    expect(resultado.acertos).toBe(1);
  });

  it("trata ausência de resposta como não respondida", () => {
    const resultado = corrigirQuiz(perguntas, {});
    expect(resultado.acertos).toBe(0);
    expect(resultado.porPergunta.every((p) => !p.respondida)).toBe(true);
  });

  it("não aprova quiz vazio mesmo com nota 0", () => {
    const resultado = corrigirQuiz([], {});
    expect(resultado.total).toBe(0);
    expect(resultado.notaPercentual).toBe(0);
    expect(resultado.aprovado).toBe(false);
  });

  it(`exige nota >= ${NOTA_MINIMA_PERCENTUAL}% para aprovar`, () => {
    const duasPerguntas = perguntas;
    // 50% (abaixo do mínimo)
    const abaixo = corrigirQuiz(duasPerguntas, { "1": 12, "2": 23 });
    expect(abaixo.notaPercentual).toBeLessThan(NOTA_MINIMA_PERCENTUAL);
    expect(abaixo.aprovado).toBe(false);

    // 100%
    const acima = corrigirQuiz(duasPerguntas, { "1": 12, "2": 21 });
    expect(acima.notaPercentual).toBeGreaterThanOrEqual(NOTA_MINIMA_PERCENTUAL);
    expect(acima.aprovado).toBe(true);
  });

  it("indica a alternativa correta do gabarito em cada pergunta", () => {
    const resultado = corrigirQuiz(perguntas, { "1": 13 });
    expect(resultado.porPergunta[0].alternativaCorretaId).toBe(12);
    expect(resultado.porPergunta[1].alternativaEscolhidaId).toBeNull();
  });
});
