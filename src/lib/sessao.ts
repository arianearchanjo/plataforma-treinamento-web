import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

/**
 * Sessão do usuário logado, deduplicada por request via React cache().
 * Usada em Server Components e Route Handlers.
 */
export const getSessao = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
