import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { BadgeModulo } from "@/components/BadgeModulo";
import { BotaoConcluirLicao } from "@/components/BotaoConcluirLicao";
import { Cabecalho } from "@/components/Cabecalho";
import { QuizCard, type QuizView } from "@/components/QuizCard";
import { lerConteudoMdx } from "@/lib/conteudo";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/sessao";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string; licao: string }>;
};

async function carregarDados(slugModulo: string, slugLicao: string) {
  const modulo = await prisma.modulo.findUnique({
    where: { slug: slugModulo },
    include: { licoes: { orderBy: { ordem: "asc" } } },
  });
  if (!modulo) return null;

  const indice = modulo.licoes.findIndex((l) => l.slug === slugLicao);
  if (indice === -1) return null;

  const licao = modulo.licoes[indice];
  const quizBruto = await prisma.quiz.findUnique({
    where: { licaoId: licao.id },
    include: {
      perguntas: { orderBy: { id: "asc" }, include: { alternativas: true } },
    },
  });

  // Gabarito NUNCA vai para o cliente antes da correção.
  const quizParaCliente: QuizView | null =
    quizBruto && quizBruto.perguntas.length > 0
      ? {
          id: quizBruto.id,
          perguntas: quizBruto.perguntas.map((pergunta) => ({
            id: pergunta.id,
            enunciado: pergunta.enunciado,
            alternativas: pergunta.alternativas.map((a) => ({
              id: a.id,
              texto: a.texto,
            })),
          })),
        }
      : null;

  return {
    modulo,
    licao,
    indice,
    anterior: indice > 0 ? modulo.licoes[indice - 1] : null,
    proxima: indice < modulo.licoes.length - 1 ? modulo.licoes[indice + 1] : null,
    quizParaCliente,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, licao: licaoSlug } = await params;
  const dados = await carregarDados(slug, licaoSlug);
  return { title: dados?.licao.titulo ?? "Lição não encontrada" };
}

export default async function PaginaLicao({ params }: Props) {
  const { slug, licao: licaoSlug } = await params;
  const sessao = await getSessao();
  if (!sessao) {
    redirect(`/login?proximo=%2Fmodulos%2F${slug}%2F${licaoSlug}`);
  }

  const dados = await carregarDados(slug, licaoSlug);
  if (!dados) notFound();

  const { modulo, licao, anterior, proxima, quizParaCliente } = dados;
  const conteudoMdx = await lerConteudoMdx(licao.conteudoPath);

  const progresso = await prisma.progressoLicao.findUnique({
    where: { usuarioId_licaoId: { usuarioId: sessao.user.id, licaoId: licao.id } },
  });

  const base = `/modulos/${modulo.slug}`;

  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-indigo-600">
            Trilha
          </Link>
          <span aria-hidden>/</span>
          <Link href={base} className="hover:text-indigo-600">
            {modulo.titulo}
          </Link>
        </div>

        <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <BadgeModulo titulo={modulo.titulo} corHex={modulo.corHex} />
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{licao.titulo}</h1>

          <div className="prose prose-slate mt-6 max-w-none prose-headings:scroll-mt-20 prose-a:text-indigo-600 prose-code:before:hidden prose-code:after:hidden prose-pre:bg-slate-900">
            <MDXRemote source={conteudoMdx} />
          </div>

          <footer className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
            {anterior ? (
              <Link
                href={`${base}/${anterior.slug}`}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600"
              >
                ← {anterior.titulo}
              </Link>
            ) : (
              <span />
            )}
            {proxima ? (
              <Link
                href={`${base}/${proxima.slug}`}
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                {proxima.titulo} →
              </Link>
            ) : (
              <span className="text-sm text-slate-500">Fim do módulo 🎉</span>
            )}
          </footer>
        </article>

        {quizParaCliente && (
          <div className="mt-6">
            <QuizCard quiz={quizParaCliente} />
          </div>
        )}

        <div className="mt-6 flex justify-center pb-12">
          <BotaoConcluirLicao licaoId={licao.id} concluidaInicial={progresso?.concluida ?? false} />
        </div>
      </main>
    </>
  );
}
