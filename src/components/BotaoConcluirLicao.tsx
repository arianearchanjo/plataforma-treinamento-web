"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BotaoConcluirLicao({
  licaoId,
  concluidaInicial,
}: {
  licaoId: number;
  concluidaInicial: boolean;
}) {
  const router = useRouter();
  const [concluida, setConcluida] = useState(concluidaInicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function concluir() {
    setEnviando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/progresso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licaoId }),
      });
      if (!resposta.ok) throw new Error();
      setConcluida(true);
      router.refresh();
    } catch {
      setErro("Não foi possível salvar o progresso.");
    } finally {
      setEnviando(false);
    }
  }

  if (erro) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {erro}
      </p>
    );
  }

  if (concluida) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
        ✓ Lição concluída
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void concluir()}
      disabled={enviando}
      className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
    >
      {enviando ? "Salvando…" : "Marcar como concluída"}
    </button>
  );
}
