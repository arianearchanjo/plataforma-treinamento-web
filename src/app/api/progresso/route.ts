import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/sessao";

/**
 * POST /api/progresso  → marca uma lição como concluída para o usuário logado.
 * Body: { licaoId: number }
 */
export async function POST(request: Request) {
  const sessao = await getSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const licaoId = (corpo as { licaoId?: unknown })?.licaoId;
  if (typeof licaoId !== "number" || !Number.isInteger(licaoId) || licaoId <= 0) {
    return NextResponse.json(
      { erro: "Campo 'licaoId' deve ser um inteiro positivo." },
      { status: 400 },
    );
  }

  const licao = await prisma.licao.findUnique({ where: { id: licaoId } });
  if (!licao) {
    return NextResponse.json({ erro: "Lição não encontrada." }, { status: 404 });
  }

  const concluidaEm = new Date();
  const progresso = await prisma.progressoLicao.upsert({
    where: {
      usuarioId_licaoId: { usuarioId: sessao.user.id, licaoId },
    },
    create: { usuarioId: sessao.user.id, licaoId, concluida: true, concluidaEm },
    update: { concluida: true, concluidaEm },
  });

  return NextResponse.json({ ok: true, progresso });
}

/**
 * DELETE /api/progresso → reinicia todo o progresso do usuário logado
 * (lições concluídas + tentativas de quiz).
 */
export async function DELETE() {
  const sessao = await getSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  await prisma.$transaction([
    prisma.progressoLicao.deleteMany({ where: { usuarioId: sessao.user.id } }),
    prisma.tentativaQuiz.deleteMany({ where: { usuarioId: sessao.user.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
