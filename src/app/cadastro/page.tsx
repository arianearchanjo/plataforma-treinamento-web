import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { FormularioAutenticacao } from "@/components/FormularioAutenticacao";

export const metadata: Metadata = { title: "Criar conta" };

export default function PaginaCadastro() {
  return (
    <>
      <Cabecalho />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12">
        <h1 className="text-2xl font-extrabold">Criar sua conta</h1>
        <p className="mt-1 text-sm text-slate-600">
          Comece agora sua trilha de 12 módulos de desenvolvimento web.
        </p>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <FormularioAutenticacao modo="cadastro" />
          <p className="mt-4 text-center text-sm text-slate-600">
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
