import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getSessaoMock,
  upsertMock,
  deleteManyProgressoMock,
  deleteManyTentativasMock,
  findLicaoMock,
} = vi.hoisted(() => ({
  getSessaoMock: vi.fn(),
  upsertMock: vi.fn(),
  deleteManyProgressoMock: vi.fn(),
  deleteManyTentativasMock: vi.fn(),
  findLicaoMock: vi.fn(),
}));

vi.mock("@/lib/sessao", () => ({ getSessao: getSessaoMock }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    licao: { findUnique: findLicaoMock },
    progressoLicao: {
      upsert: upsertMock,
      deleteMany: deleteManyProgressoMock,
    },
    tentativaQuiz: { deleteMany: deleteManyTentativasMock },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  },
}));

import { DELETE, POST } from "@/app/api/progresso/route";

function requisicao(body: unknown) {
  return new Request("http://localhost/api/progresso", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("POST /api/progresso", () => {
  it("retorna 401 quando não há sessão", async () => {
    getSessaoMock.mockResolvedValueOnce(null);
    const resposta = await POST(requisicao({ licaoId: 1 }));
    expect(resposta.status).toBe(401);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("retorna 400 quando o corpo é inválido", async () => {
    getSessaoMock.mockResolvedValue({ user: { id: "u1" } });
    const respostaInvalida = await POST(requisicao({ licaoId: "abc" }));
    expect(respostaInvalida.status).toBe(400);

    const respostaSemCampo = await POST(requisicao({}));
    expect(respostaSemCampo.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("marca a lição como concluída quando a lição existe", async () => {
    getSessaoMock.mockResolvedValueOnce({ user: { id: "u1" } });
    findLicaoMock.mockResolvedValueOnce({ id: 7 });
    upsertMock.mockResolvedValueOnce({ id: 99, concluida: true });

    const resposta = await POST(requisicao({ licaoId: 7 }));
    expect(resposta.status).toBe(200);
    const dados = await resposta.json();
    expect(dados.ok).toBe(true);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { usuarioId_licaoId: { usuarioId: "u1", licaoId: 7 } },
        update: expect.objectContaining({ concluida: true }),
      }),
    );
  });

  it("retorna 404 quando a lição não existe", async () => {
    getSessaoMock.mockResolvedValueOnce({ user: { id: "u1" } });
    findLicaoMock.mockResolvedValueOnce(null);
    const resposta = await POST(requisicao({ licaoId: 12345 }));
    expect(resposta.status).toBe(404);
    expect(upsertMock).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/progresso", () => {
  it("reinicia progresso e tentativas do usuário autenticado", async () => {
    getSessaoMock.mockResolvedValueOnce({ user: { id: "u1" } });
    const resposta = await DELETE();
    expect(resposta.status).toBe(200);
    expect(deleteManyProgressoMock).toHaveBeenCalledWith({
      where: { usuarioId: "u1" },
    });
    expect(deleteManyTentativasMock).toHaveBeenCalledWith({
      where: { usuarioId: "u1" },
    });
  });

  it("exige sessão", async () => {
    getSessaoMock.mockResolvedValueOnce(null);
    const resposta = await DELETE();
    expect(resposta.status).toBe(401);
  });
});
