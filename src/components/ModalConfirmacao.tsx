"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

type ModalConfirmacaoProps = {
  rotuloGatilho: string;
  titulo: string;
  descricao: string;
  textoConfirmar: string;
  perigoso?: boolean;
  onConfirmar: () => Promise<void> | void;
};

/** Dialog de confirmação reutilizável (Radix UI). */
export function ModalConfirmacao({
  rotuloGatilho,
  titulo,
  descricao,
  textoConfirmar,
  perigoso = false,
  onConfirmar,
}: ModalConfirmacaoProps) {
  const [aberto, setAberto] = useState(false);
  const [executando, setExecutando] = useState(false);

  async function confirmar() {
    setExecutando(true);
    try {
      await onConfirmar();
      setAberto(false);
    } finally {
      setExecutando(false);
    }
  }

  return (
    <Dialog.Root open={aberto} onOpenChange={setAberto}>
      <Dialog.Trigger
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          perigoso
            ? "border border-red-200 text-red-600 hover:bg-red-50"
            : "border border-slate-300 text-slate-700 hover:bg-slate-100"
        }`}
      >
        {rotuloGatilho}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none">
          <Dialog.Title className="text-lg font-semibold">{titulo}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-slate-600">
            {descricao}
          </Dialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close
              disabled={executando}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </Dialog.Close>
            <button
              type="button"
              onClick={() => void confirmar()}
              disabled={executando}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60 ${
                perigoso ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {executando ? "Executando…" : textoConfirmar}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
