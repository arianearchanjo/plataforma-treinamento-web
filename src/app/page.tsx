import { redirect } from "next/navigation";
import { BarraProgresso } from "@/components/BarraProgresso";
import { BotaoReiniciarProgresso } from "@/components/BotaoReiniciarProgresso";
import { Cabecalho } from "@/components/Cabecalho";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/sessao";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const sessao = await getSessao();
  if (!sessao) redirect("/login?proximo=%2F");

  const modulos = await prisma.modulo.findMany({
    orderBy: { numero: "asc" },
    include: {
      licoes: {
        orderBy: { ordem: "asc" },
        include: {
          _count: { select: { progresso: { where: { concluida: true } } } },
        },
      },
    },
  });

  const totalLicoes = modulos.reduce((soma, m) => soma + m.licoes.length, 0);
  const totalConcluidas = modulos.reduce(
    (soma, m) => soma + m.licoes.filter((l) => l._count.progresso > 0).length,
    0,
  );
  const percentualGeral = totalLicoes === 0 ? 0 : Math.round((totalConcluidas / totalLicoes) * 100);

  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-md sm:p-8">
          <p className="text-sm font-medium text-indigo-100">Olá, {sessao.user.name} 👋</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
            Sua trilha de treinamento web
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <span className="font-semibold">
              {modulos.length} módulos · {totalLicoes} lições
            </span>
            <span className="font-semibold">
              {totalConcluidas} concluídas ({percentualGeral}%)
            </span>
            <div className="min-w-48 grow">
              <BarraProgresso valor={percentualGeral} cor="#a5b4fc" />
            </div>
          </div>
        </section>

        <section aria-label="Módulos da trilha" className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Trilha de módulos</h2>
            <BotaoReiniciarProgresso />
          </div>

          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modulos.map((modulo) => {
              const concluidas = modulo.licoes.filter((l) => l._count.progresso > 0).length;
              const percentual =
                modulo.licoes.length === 0
                  ? 0
                  : Math.round((concluidas / modulo.licoes.length) * 100);
              return (
                <li key={modulo.id}>
                  <a
                    href={`/modulos/${modulo.slug}`}
                    className="group flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                    style={{ borderTopColor: modulo.corHex, borderTopWidth: 4 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">
                        MÓDULO {String(modulo.numero).padStart(2, "0")}
                      </span>
                      <BadgeCor cor={modulo.corHex} />
                    </div>
                    <h3 className="text-base font-bold group-hover:text-indigo-700">
                      {modulo.titulo}
                    </h3>
                    <BarraProgresso valor={percentual} cor={modulo.corHex} />
                    <p className="text-xs font-medium text-slate-500">
                      {concluidas}/{modulo.licoes.length} lições
                      {percentual === 100 && " · ✓ completo"}
                    </p>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </>
  );
}

function BadgeCor({ cor }: { cor: string }) {
  return <span aria-hidden className="size-3 rounded-full" style={{ backgroundColor: cor }} />;
}
