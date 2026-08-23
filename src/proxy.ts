import { type NextRequest, NextResponse } from "next/server";

/**
 * proxy.ts (Next.js 16 — substitui o antigo middleware.ts).
 * Roda no runtime Node.js. Aqui fazemos apenas a verificação otimista de
 * presença do cookie de sessão (barato); a validação real da sessão acontece
 * nos Server Components/Route Handlers via auth.api.getSession().
 */

const ROTAS_PROTEGIDAS = ["/", "/modulos"];

const COOKIES_SESSAO = ["better-auth.session_token", "__Secure-better-auth.session_token"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protegida = ROTAS_PROTEGIDAS.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`),
  );
  if (!protegida) return NextResponse.next();

  const temCookieSessao = COOKIES_SESSAO.some((nome) => request.cookies.has(nome));
  if (!temCookieSessao) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("proximo", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/modulos/:path*"],
};
