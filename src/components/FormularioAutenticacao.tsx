"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

type FormularioAutenticacaoProps = {
  modo: "login" | "cadastro";
  /** rota para onde ir depois do sucesso (ex.: vinda de ?proximo=) */
  proximo?: string;
};

export function FormularioAutenticacao({ modo, proximo = "/" }: FormularioAutenticacaoProps) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const ehCadastro = modo === "cadastro";

  async function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      if (ehCadastro) {
        const { error } = await authClient.signUp.email({
          name: nome,
          email,
          password: senha,
        });
        if (error) {
          setErro(error.message ?? "Não foi possível criar a conta.");
          return;
        }
      } else {
        const { error } = await authClient.signIn.email({ email, password: senha });
        if (error) {
          setErro(error.message ?? "E-mail ou senha inválidos.");
          return;
        }
      }
      router.push(proximo.startsWith("/") ? proximo : "/");
      router.refresh();
    } catch {
      setErro("Erro inesperado. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={aoEnviar} className="space-y-4" noValidate>
      {ehCadastro && (
        <div>
          <label htmlFor="nome" className="mb-1 block text-sm font-medium">
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Maria Dev"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@empresa.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="senha" className="mb-1 block text-sm font-medium">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete={ehCadastro ? "new-password" : "current-password"}
          required
          minLength={8}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Mínimo de 8 caracteres"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
        />
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
      >
        {enviando ? "Enviando…" : ehCadastro ? "Criar conta" : "Entrar"}
      </button>
    </form>
  );
}
