import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DevTrilha — Plataforma de Treinamento Web",
    template: "%s · DevTrilha",
  },
  description:
    "Plataforma de treinamento interna para desenvolvedores web: 12 módulos com aulas, quizzes e progresso.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
