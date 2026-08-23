"use client";

import { useRouter } from "next/navigation";
import { ModalConfirmacao } from "./ModalConfirmacao";

export function BotaoReiniciarProgresso() {
  const router = useRouter();

  return (
    <ModalConfirmacao
      rotuloGatilho="Reiniciar progresso"
      titulo="Reiniciar todo o progresso?"
      descricao="Isso apaga suas lições concluídas e o histórico de tentativas de quiz. Essa ação não pode ser desfeita."
      textoConfirmar="Sim, reiniciar"
      perigoso
      onConfirmar={async () => {
        await fetch("/api/progresso", { method: "DELETE" });
        router.refresh();
      }}
    />
  );
}
