import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider as JotaiProvider } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuizCard, type QuizView } from "./QuizCard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const quizFake: QuizView = {
  id: 10,
  perguntas: [
    {
      id: 1,
      enunciado: "O que significa HTML?",
      alternativas: [
        { id: 11, texto: "HyperText Markup Language" },
        { id: 12, texto: "Home Tool Markup Language" },
      ],
    },
    {
      id: 2,
      enunciado: "Qual tag cria um link?",
      alternativas: [
        { id: 21, texto: "<link>" },
        { id: 22, texto: "<a>" },
      ],
    },
  ],
};

function respostaOk() {
  return {
    acertos: 2,
    total: 2,
    notaPercentual: 100,
    aprovado: true,
    licaoConcluida: true,
    porPergunta: [
      {
        perguntaId: 1,
        correta: true,
        alternativaEscolhidaId: 11,
        alternativaCorretaId: 11,
        explicacao: "HTML = HyperText Markup Language.",
      },
      {
        perguntaId: 2,
        correta: true,
        alternativaEscolhidaId: 22,
        alternativaCorretaId: 22,
        explicacao: "Links usam <a href>.",
      },
    ],
  };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("QuizCard", () => {
  it("mantém o botão de correção desabilitado até responder tudo", () => {
    render(
      <JotaiProvider>
        <QuizCard quiz={quizFake} />
      </JotaiProvider>,
    );
    const botao = screen.getByRole("button", { name: /corrigir respostas/i });
    expect(botao).toBeDisabled();

    fireEvent.click(screen.getByText("Home Tool Markup Language"));
    expect(botao).toBeDisabled(); // falta a pergunta 2

    fireEvent.click(screen.getByText("<a>"));
    expect(botao).toBeEnabled();
  });

  it("mostra feedback certo/errado e a nota após enviar", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(respostaOk()), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <JotaiProvider>
        <QuizCard quiz={quizFake} />
      </JotaiProvider>,
    );

    fireEvent.click(screen.getByText("HyperText Markup Language"));
    fireEvent.click(screen.getByText("<a>"));
    fireEvent.click(screen.getByRole("button", { name: /corrigir respostas/i }));

    await waitFor(() => {
      expect(screen.getByText(/Você acertou 2 de 2 \(100%\)/)).toBeInTheDocument();
    });
    expect(screen.getByText(/HTML = HyperText Markup Language\./)).toBeInTheDocument();
    // Botão some depois de corrigido (feedback exibido no lugar)
    expect(screen.queryByRole("button", { name: /corrigir respostas/i })).not.toBeInTheDocument();
  });

  it("exibe erro amigável quando a API falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("erro", { status: 500 })));

    render(
      <JotaiProvider>
        <QuizCard quiz={quizFake} />
      </JotaiProvider>,
    );

    fireEvent.click(screen.getByText("HyperText Markup Language"));
    fireEvent.click(screen.getByText("<a>"));
    fireEvent.click(screen.getByRole("button", { name: /corrigir respostas/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/Não foi possível corrigir o quiz/);
    });
  });
});
