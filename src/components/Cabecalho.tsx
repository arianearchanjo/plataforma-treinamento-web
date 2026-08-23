import Link from "next/link";
import { getSessao } from "@/lib/sessao";
import { MenuUsuario } from "./MenuUsuario";

export async function Cabecalho() {
  const sessao = await getSessao();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          Dev<span className="text-indigo-600">Trilha</span>
        </Link>
        {sessao ? (
          <MenuUsuario nome={sessao.user.name} email={sessao.user.email} />
        ) : (
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link href="/login" className="rounded-lg px-3 py-1.5 hover:bg-slate-100">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700"
            >
              Criar conta
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
