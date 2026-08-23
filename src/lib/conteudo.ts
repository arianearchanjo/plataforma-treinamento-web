import { readFile } from "node:fs/promises";
import path from "node:path";

const RAIZ_CONTEUDO = path.join(process.cwd(), "content");

/**
 * Lê um arquivo MDX da pasta `content/` a partir do caminho relativo
 * salvo no banco (`<modulo>/<licao>.mdx`). Protege contra path traversal
 * e devolve mensagem amigável se o arquivo ainda não existir.
 */
export async function lerConteudoMdx(caminhoRelativo: string): Promise<string> {
  const caminhoAbsoluto = path.join(RAIZ_CONTEUDO, caminhoRelativo);
  const relativo = path.relative(RAIZ_CONTEUDO, caminhoAbsoluto);
  if (relativo.startsWith("..")) {
    throw new Error(`Caminho de conteúdo inválido: ${caminhoRelativo}`);
  }
  try {
    return await readFile(caminhoAbsoluto, "utf8");
  } catch {
    return [
      "# Conteúdo em construção",
      "",
      `O arquivo \`${caminhoRelativo}\` ainda não foi criado no repositório.`,
      "Adicione-o em `content/` para publicar esta lição.",
    ].join("\n");
  }
}
