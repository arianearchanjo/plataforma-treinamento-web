import { NextResponse } from "next/server";
import { corrigirQuiz, type RespostasUsuario } from "@/lib/corrigir-quiz";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/sessao";

/**
 * POST /api/quiz/[id]/responder
 * Body: { respostas: Record<perguntaId, alternativaId> }
 *
 * Corrige a tentativa no servidor (o gabarito nunca vai para o cliente antes
 * da resposta), persiste TentativaQuiz e, se aprovado (>= 70%), marca a lição
 * como concluída.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await getSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const quizId = Number(id);
  if (!Number.isInteger(quizId) || quizId <= 0) {
    return NextResponse.json({ erro: "ID de quiz inválido." }, { status: 400 });
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const respostasBrutas = (corpo as { respostas?: unknown })?.respostas;
  if (
    typeof respostasBrutas !== "object" ||
    respostasBrutas === null ||
    Array.isArray(respostasBrutas)
  ) {
    return NextResponse.json(
      { erro: "Campo 'respostas' deve ser um objeto { perguntaId: alternativaId }." },
      { status: 400 },
    );
  }

  // Normaliza: chaves e valores devem virar inteiros válidos.
  const respostas: RespostasUsuario = {};
  for (const [chave, valor] of Object.entries(respostasBrutas)) {
    const perguntaId = Number(chave);
    const alternativaId = Number(valor);
    if (!Number.isInteger(perguntaId) || !Number.isInteger(alternativaId) || alternativaId <= 0) {
      return NextResponse.json(
        { erro: `Resposta inválida para a pergunta '${chave}'.` },
        { status: 400 },
      );
    }
    respostas[perguntaId] = alternativaId;
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { perguntas: { include: { alternativas: true } } },
  });
  if (!quiz) {
    return NextResponse.json({ erro: "Quiz não encontrado." }, { status: 404 });
  }

  const resultado = corrigirQuiz(quiz.perguntas, respostas);

  await prisma.tentativaQuiz.create({
    data: {
      usuarioId: sessao.user.id,
      quizId,
      acertos: resultado.acertos,
      total: resultado.total,
    },
  });

  let licaoConcluida = false;
  if (resultado.aprovado && quiz.licaoId != null) {
    const concluidaEm = new Date();
    await prisma.progressoLicao.upsert({
      where: {
        usuarioId_licaoId: { usuarioId: sessao.user.id, licaoId: quiz.licaoId },
      },
      create: {
        usuarioId: sessao.user.id,
        licaoId: quiz.licaoId,
        concluida: true,
        concluidaEm,
      },
      update: { concluida: true, concluidaEm },
    });
    licaoConcluida = true;
  }

  // Anexa a explicação da alternativa correta (agora pode ser revelada).
  const porPergunta = resultado.porPergunta.map((item) => {
    const pergunta = quiz.perguntas.find((p) => p.id === item.perguntaId);
    const gabarito = pergunta?.alternativas.find((a) => a.correta);
    return {
      ...item,
      explicacao: gabarito?.explicacao ?? null,
    };
  });

  return NextResponse.json({
    acertos: resultado.acertos,
    total: resultado.total,
    notaPercentual: resultado.notaPercentual,
    aprovado: resultado.aprovado,
    licaoConcluida,
    porPergunta,
  });
}
