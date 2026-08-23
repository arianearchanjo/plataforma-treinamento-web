import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { FormularioAutenticacao } from "@/components/FormularioAutenticacao";

export const metadata: Metadata = { title: "Entrar" };

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>;
}) {
  const { proximo } = await searchParams;

  return (
    <>
      <Cabecalho />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12">
        <h1 className="text-2xl font-extrabold">Entrar na plataforma</h1>
        <p className="mt-1 text-sm text-slate-600">
          Acesse com seu e-mail corporativo para continuar a trilha.
        </p>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <FormularioAutenticacao modo="login" proximo={proximo ?? "/"} />
          <p className="mt-4 text-center text-sm text-slate-600">
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-semibold text-indigo-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
