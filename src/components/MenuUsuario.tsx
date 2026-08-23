"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function MenuUsuario({ nome, email }: { nome: string; email: string }) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);
  const iniciais =
    nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase() || "?";

  async function sair() {
    setSaindo(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label="Menu do usuário"
        className="flex size-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        {iniciais}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          <DropdownMenu.Label className="truncate px-3 py-2 text-xs font-medium text-slate-500">
            {email}
          </DropdownMenu.Label>
          <DropdownMenu.Item
            disabled={saindo}
            onSelect={() => void sair()}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-red-600 outline-none data-highlighted:bg-red-50"
          >
            {saindo ? "Saindo…" : "Sair"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
