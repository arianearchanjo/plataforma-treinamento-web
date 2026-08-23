import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BadgeModulo } from "@/components/BadgeModulo";
import { BarraProgresso } from "@/components/BarraProgresso";
import { Cabecalho } from "@/components/Cabecalho";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/sessao";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const modulo = await prisma.modulo.findUnique({ where: { slug } });
  return { title: modulo?.titulo ?? "Módulo não encontrado" };
}

export default async function PaginaModulo({ params }: Props) {
  const { slug } = await params;
  const sessao = await getSessao();
  if (!sessao) redirect(`/login?proximo=%2Fmodulos%2F${slug}`);

  const modulo = await prisma.modulo.findUnique({
    where: { slug },
    include: {
      licoes: {
        orderBy: { ordem: "asc" },
        include: { progresso: { where: { usuarioId: sessao.user.id } }, quiz: true },
      },
    },
  });
  if (!modulo) notFound();

  const concluidas = modulo.licoes.filter((l) => l.progresso.some((p) => p.concluida)).length;
  const percentual =
    modulo.licoes.length === 0 ? 0 : Math.round((concluidas / modulo.licoes.length) * 100);

  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600">
          ← Voltar à trilha
        </Link>

        <header
          className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          style={{ borderTopColor: modulo.corHex, borderTopWidth: 5 }}
        >
          <BadgeModulo titulo={`Módulo ${modulo.numero}`} corHex={modulo.corHex} />
          <h1 className="mt-3 text-2xl font-extrabold">{modulo.titulo}</h1>
          <div className="mt-4 flex items-center gap-4">
            <div className="grow">
              <BarraProgresso valor={percentual} cor={modulo.corHex} />
            </div>
            <span className="shrink-0 text-sm font-semibold text-slate-600">
              {concluidas}/{modulo.licoes.length}
            </span>
          </div>
        </header>

        <ol className="mt-6 space-y-3">
          {modulo.licoes.map((licao) => {
            const concluida = licao.progresso.some((p) => p.concluida);
            return (
              <li key={licao.id}>
                <Link
                  href={`/modulos/${modulo.slug}/${licao.slug}`}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
                >
                  <span
                    aria-hidden
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      concluida ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {concluida ? "✓" : licao.ordem}
                  </span>
                  <span className="grow">
                    <span className="block font-semibold">{licao.titulo}</span>
                    <span className="block text-xs text-slate-500">
                      {licao.quiz ? "Com quiz" : "Leitura"}
                    </span>
                  </span>
                  <span aria-hidden className="text-slate-400">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </main>
    </>
  );
}
