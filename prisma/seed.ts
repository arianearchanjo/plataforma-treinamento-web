import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config();

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/plataforma_treinamento?schema=public";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const RAIZ_CONTEUDO = path.join(process.cwd(), "content");

type LicaoSeed = { slug: string; titulo: string };
type ModuloSeed = {
  slug: string;
  numero: number;
  titulo: string;
  corHex: string;
  licoes: LicaoSeed[];
};

const MODULOS: ModuloSeed[] = [
  {
    slug: "html",
    numero: 1,
    titulo: "HTML5",
    corHex: "#e44d26",
    licoes: [
      { slug: "introducao-ao-html5", titulo: "Introdução ao HTML5" },
      { slug: "estrutura-semantica", titulo: "Estrutura semântica" },
      { slug: "formularios-e-validacao", titulo: "Formulários e validação" },
      { slug: "midia-e-acessibilidade", titulo: "Mídia e acessibilidade" },
      { slug: "seo-e-meta-tags", titulo: "SEO e meta tags" },
    ],
  },
  {
    slug: "css",
    numero: 2,
    titulo: "CSS3 + Bootstrap 4",
    corHex: "#2965f1",
    licoes: [
      { slug: "introducao-ao-css3", titulo: "Introdução ao CSS3" },
      { slug: "seletores-e-especificidade", titulo: "Seletores e especificidade" },
      { slug: "box-model", titulo: "Box model e unidades" },
      { slug: "flexbox", titulo: "Flexbox na prática" },
      { slug: "grid-layout", titulo: "CSS Grid Layout" },
      { slug: "bootstrap-4", titulo: "Bootstrap 4 essencial" },
    ],
  },
  {
    slug: "javascript",
    numero: 3,
    titulo: "JavaScript",
    corHex: "#d9a300",
    licoes: [
      { slug: "introducao-ao-javascript", titulo: "Introdução ao JavaScript" },
      { slug: "tipos-e-variaveis", titulo: "Tipos e variáveis" },
      { slug: "funcoes", titulo: "Funções e escopo" },
      { slug: "arrays-e-objetos", titulo: "Arrays e objetos" },
      { slug: "dom-e-manipulacao", titulo: "DOM e manipulação" },
      { slug: "eventos", titulo: "Eventos e interatividade" },
      { slug: "assincronismo", titulo: "Promises e async/await" },
    ],
  },
  {
    slug: "typescript",
    numero: 4,
    titulo: "TypeScript",
    corHex: "#3178c6",
    licoes: [
      { slug: "introducao-ao-typescript", titulo: "Introdução ao TypeScript" },
      { slug: "tipando-funcoes-e-objetos", titulo: "Tipando funções e objetos" },
      { slug: "generics-e-utility-types", titulo: "Generics e utility types" },
    ],
  },
  {
    slug: "react",
    numero: 5,
    titulo: "React 19",
    corHex: "#0891b2",
    licoes: [
      { slug: "introducao-ao-react", titulo: "Introdução ao React" },
      { slug: "componentes-e-props", titulo: "Componentes e props" },
      { slug: "estado-e-hooks", titulo: "Estado e hooks" },
      { slug: "listas-formularios-eventos", titulo: "Listas, formulários e eventos" },
      { slug: "novidades-react-19", titulo: "Novidades do React 19" },
    ],
  },
  {
    slug: "nextjs",
    numero: 6,
    titulo: "Next.js 16",
    corHex: "#6e56cf",
    licoes: [
      { slug: "introducao-ao-nextjs", titulo: "Introdução ao Next.js" },
      { slug: "app-router", titulo: "App Router e rotas" },
      { slug: "server-components", titulo: "Server Components" },
      { slug: "data-fetching", titulo: "Data fetching e cache" },
      { slug: "proxy-e-rotas-api", titulo: "proxy.ts e Route Handlers" },
    ],
  },
  {
    slug: "tailwind-radix",
    numero: 7,
    titulo: "Tailwind CSS 4 + Radix UI",
    corHex: "#ec4899",
    licoes: [
      { slug: "introducao-tailwind4", titulo: "Tailwind CSS 4 e @theme" },
      { slug: "radix-ui-acessibilidade", titulo: "Componentes acessíveis com Radix" },
    ],
  },
  {
    slug: "prisma",
    numero: 8,
    titulo: "Prisma 7 + PostgreSQL",
    corHex: "#0f9488",
    licoes: [
      { slug: "introducao-ao-prisma", titulo: "Introdução ao Prisma ORM" },
      { slug: "modelando-dados", titulo: "Modelando dados no schema" },
      { slug: "migrations", titulo: "Migrations e workflow" },
      { slug: "consultas-crud", titulo: "Consultas e CRUD" },
      { slug: "driver-adapters-postgres", titulo: "Driver adapters com PostgreSQL" },
    ],
  },
  {
    slug: "better-auth",
    numero: 9,
    titulo: "Better-Auth",
    corHex: "#a855f7",
    licoes: [
      { slug: "introducao-better-auth", titulo: "Introdução ao Better-Auth" },
      { slug: "email-e-senha", titulo: "Autenticação por e-mail e senha" },
      { slug: "protecao-de-rotas", titulo: "Sessões e proteção de rotas" },
    ],
  },
  {
    slug: "jotai",
    numero: 10,
    titulo: "Jotai",
    corHex: "#0284c7",
    licoes: [
      { slug: "introducao-jotai", titulo: "Introdução ao Jotai" },
      { slug: "atomos-e-derived-atoms", titulo: "Átomos e derived atoms" },
      { slug: "padroes-de-uso", titulo: "Padrões de uso (e quando evitar)" },
    ],
  },
  {
    slug: "biome",
    numero: 11,
    titulo: "Biome",
    corHex: "#16a34a",
    licoes: [
      { slug: "introducao-biome", titulo: "Introdução ao Biome" },
      { slug: "lint-format-ci", titulo: "Lint, format e CI" },
    ],
  },
  {
    slug: "vitest",
    numero: 12,
    titulo: "Vitest",
    corHex: "#84cc16",
    licoes: [
      { slug: "introducao-vitest", titulo: "Introdução ao Vitest" },
      { slug: "testes-de-componentes", titulo: "Testes de componentes React" },
      { slug: "testes-de-servidor", titulo: "Testando lógica de servidor" },
    ],
  },
];

type AlternativaSeed = { texto: string; correta?: boolean; explicacao: string };
type PerguntaSeed = { enunciado: string; alternativas: AlternativaSeed[] };
type QuizSeed = Record<string, PerguntaSeed[]>; // chave: "<modulo>/<licao>"

const QUIZZES: QuizSeed = {
  "html/introducao-ao-html5": [
    {
      enunciado: "O que significa a sigla HTML?",
      alternativas: [
        {
          texto: "HyperText Markup Language",
          correta: true,
          explicacao:
            "HTML é a linguagem de marcação de hipertexto que estrutura o conteúdo das páginas web.",
        },
        {
          texto: "HighText Machine Language",
          explicacao: "Não existe essa sigla. HTML é HyperText Markup Language.",
        },
        {
          texto: "Hyperlink and Text Management Language",
          explicacao: "Invenção plausível, mas errada. O correto é HyperText Markup Language.",
        },
        {
          texto: "Home Tool Markup Language",
          explicacao: "Errado. A sigla vem de HyperText Markup Language.",
        },
      ],
    },
    {
      enunciado: "Qual é a função do DOCTYPE no início de um documento HTML?",
      alternativas: [
        {
          texto: "Indicar ao navegador que o documento usa o modo padrão (standards mode)",
          correta: true,
          explicacao:
            "Sem o <!DOCTYPE html>, o navegador entra em quirks mode e reproduz comportamentos antigos/inconsistentes.",
        },
        {
          texto: "Importar as folhas de estilo da página",
          explicacao:
            "Estilos são importados com <link> ou @import — o DOCTYPE não tem essa função.",
        },
        {
          texto: "Definir a codificação de caracteres do arquivo",
          explicacao: 'A codificação é definida por <meta charset="utf-8">, não pelo DOCTYPE.',
        },
        {
          texto: "Criar o elemento raiz do documento",
          explicacao: "O elemento raiz é o <html>; o DOCTYPE apenas declara a versão/modo.",
        },
      ],
    },
    {
      enunciado: "Qual atributo torna uma imagem acessível para leitores de tela?",
      alternativas: [
        {
          texto: "alt",
          correta: true,
          explicacao: "O atributo alt descreve a imagem para quem não a enxerga.",
        },
        {
          texto: "title",
          explicacao: "title aparece como tooltip, mas não substitui o alt em acessibilidade.",
        },
        {
          texto: "aria-img",
          explicacao: "Esse atributo não existe; usamos alt ou aria-label quando necessário.",
        },
        {
          texto: "caption",
          explicacao: "caption é elemento de tabela (<caption>), não atributo de imagem.",
        },
      ],
    },
  ],
  "html/estrutura-semantica": [
    {
      enunciado: "Qual elemento é o mais adequado para agrupar links de navegação principal?",
      alternativas: [
        {
          texto: "<nav>",
          correta: true,
          explicacao: "<nav> sinaliza blocos de navegação para usuários e tecnologias assistivas.",
        },
        {
          texto: '<div class="menu">',
          explicacao: "Funciona visualmente, mas não carrega nenhum significado semântico.",
        },
        {
          texto: "<aside>",
          explicacao: "<aside> indica conteúdo relacionado/tangencial, como barras laterais.",
        },
        {
          texto: "<section>",
          explicacao: "<section> agrupa conteúdo temático genérico, não navegação.",
        },
      ],
    },
    {
      enunciado: "Qual diferença principal entre <article> e <section>?",
      alternativas: [
        {
          texto:
            "<article> representa conteúdo independente que faz sentido sozinho; <section> agrupa conteúdo relacionado dentro da página",
          correta: true,
          explicacao:
            "Um post, notícia ou comentário são <article>. Um bloco temático da página é <section>.",
        },
        {
          texto: "<article> é antigo e foi substituído por <section>",
          explicacao: "Ambos fazem parte do HTML5 vigente e têm propósitos distintos.",
        },
        {
          texto: "<section> só pode aparecer dentro de <article>",
          explicacao: "Não há essa restrição; ambos podem se aninhar entre si conforme o contexto.",
        },
        {
          texto: "<article> serve apenas para blogs",
          explicacao: "Serve para qualquer conteúdo autônomo: produto, perfil, widget etc.",
        },
      ],
    },
    {
      enunciado: "Onde deve ficar o conteúdo principal único da página?",
      alternativas: [
        {
          texto: "<main>",
          correta: true,
          explicacao:
            "<main> delimita o conteúdo central; deve existir apenas um por página visível.",
        },
        { texto: "<header>", explicacao: "<header> contém introdução/logo do documento ou seção." },
        { texto: "<footer>", explicacao: "<footer> contém informações de rodapé." },
        { texto: "<wrapper>", explicacao: "Elemento inexistente em HTML." },
      ],
    },
  ],
  "html/formularios-e-validacao": [
    {
      enunciado: "Qual input type ativa teclado numérico e validação nativa de e-mail?",
      alternativas: [
        {
          texto: 'type="email"',
          correta: true,
          explicacao: 'type="email" valida formato e otimiza o teclado mobile para e-mails.',
        },
        {
          texto: 'type="text" pattern="@"',
          explicacao: "pattern até valida, mas não dá semântica nem teclado adequado.",
        },
        {
          texto: 'type="number"',
          explicacao: "number é para números; e-mail tem seu próprio tipo.",
        },
        { texto: 'type="mail"', explicacao: "Não existe o tipo mail." },
      ],
    },
    {
      enunciado: "Para que serve o atributo `required`?",
      alternativas: [
        {
          texto: "Impedir o envio do formulário enquanto o campo estiver vazio",
          correta: true,
          explicacao:
            "O navegador bloqueia o submit e exibe mensagem nativa quando um campo required está vazio.",
        },
        {
          texto: "Deixar o campo obrigatório apenas visualmente",
          explicacao: "A validação nativa realmente impede o envio.",
        },
        {
          texto: "Enviar o formulário automaticamente",
          explicacao: "Isso é papel do JS/atributos como autocomplete=on... e não do required.",
        },
        {
          texto: "Marcar o campo como somente leitura",
          explicacao: "Somente leitura é readonly/disabled.",
        },
      ],
    },
    {
      enunciado: "Qual elemento associa um rótulo acessível a um campo?",
      alternativas: [
        {
          texto: '<label for="id-do-campo">',
          correta: true,
          explicacao:
            "label com for apontando para o id do campo cria associação acessível e clicável.",
        },
        {
          texto: '<span class="rotulo">',
          explicacao: "Visualmente parece, mas não há associação semântica.",
        },
        { texto: '<p class="legenda">', explicacao: "Mesmo problema: sem vínculo com o input." },
        { texto: '<div title="...">', explicacao: "title é tooltip frágil e não substitui label." },
      ],
    },
  ],
  "html/midia-e-acessibilidade": [
    {
      enunciado: "Por que usar <video> em vez de iframes de players externos quando possível?",
      alternativas: [
        {
          texto:
            "Controle nativo, sem dependências extras, com atributos como controls, muted e preload",
          correta: true,
          explicacao:
            "<video> oferece API nativa, legendas via <track> e melhor performance sem scripts de terceiros.",
        },
        {
          texto: "Porque <video> não precisa de codec",
          explicacao: "Codec ainda importa: prefira MP4/H.264 + WebM como fallback.",
        },
        {
          texto: "Porque iframe é proibido",
          explicacao: "Iframe não é proibido, apenas mais pesado e menos controlável.",
        },
        {
          texto: "Porque <video> funciona sem internet",
          explicacao: "Streaming continua precisando de rede.",
        },
      ],
    },
    {
      enunciado: "Qual atributo descreve imagens decorativas corretamente?",
      alternativas: [
        {
          texto: 'alt="" (vazio)',
          correta: true,
          explicacao:
            "Imagens puramente decorativas devem ter alt vazio para serem ignoradas por leitores de tela.",
        },
        {
          texto: 'alt="imagem"',
          explicacao: "Descrições genéricas poluem a experiência de quem usa leitor de tela.",
        },
        {
          texto: 'role="presentation" sozinho resolve sempre',
          explicacao: 'alt="" já cobre o caso; role extra é redundante aqui.',
        },
        {
          texto: 'title="decorativa"',
          explicacao: "title não remove a imagem da árvore de acessibilidade.",
        },
      ],
    },
    {
      enunciado: 'O que o atributo `loading="lazy"` faz em <img>?',
      alternativas: [
        {
          texto: "Adia o carregamento da imagem até ela estar próxima da viewport",
          correta: true,
          explicacao:
            "Lazy loading nativo economiza banda e melhora o tempo de carregamento inicial.",
        },
        {
          texto: "Comprime a imagem automaticamente",
          explicacao: "Compressão é responsabilidade do build/serviço de imagem.",
        },
        {
          texto: "Torna a imagem desfocada até carregar",
          explicacao: "Efeito visual LQIP exige CSS/JS próprio.",
        },
        {
          texto: "Carrega a imagem antes de tudo",
          explicacao: 'Isso seria loading="eager" ou fetchpriority alta.',
        },
      ],
    },
  ],
  "html/seo-e-meta-tags": [
    {
      enunciado: "Qual tag define o título exibido na aba e nos resultados de busca?",
      alternativas: [
        {
          texto: "<title> no <head>",
          correta: true,
          explicacao: "<title> é o título canônico usado por navegadores e buscadores.",
        },
        {
          texto: "<h1> no corpo",
          explicacao: "h1 ajuda na hierarquia, mas não define o título da aba/SERP.",
        },
        { texto: '<meta name="titulo">', explicacao: "Meta título não existe; use <title>." },
        {
          texto: "<header><p>título</p></header>",
          explicacao: "Nada disso afeta a aba do navegador.",
        },
      ],
    },
    {
      enunciado: "Qual meta tag controla a responsividade em dispositivos móveis?",
      alternativas: [
        {
          texto: '<meta name="viewport" content="width=device-width, initial-scale=1">',
          correta: true,
          explicacao:
            "Essa meta faz a largura acompanhar o dispositivo e evita zoom inicial indesejado.",
        },
        {
          texto: '<meta charset="utf-8">',
          explicacao: "charset trata codificação, não layout responsivo.",
        },
        { texto: '<meta name="mobile">', explicacao: "Meta inexistente." },
        { texto: '<meta http-equiv="resize">', explicacao: "Inexistente também." },
      ],
    },
    {
      enunciado: "Boa prática para hierarquia de headings?",
      alternativas: [
        {
          texto: "Um único h1 por página, seguido de h2/h3 sem pular níveis",
          correta: true,
          explicacao:
            "Hierarquia consistente facilita navegação por leitores de tela e entendimento pelos buscadores.",
        },
        { texto: "Usar h1 várias vezes para dar destaque", explicacao: "Dilui a semântica do h1." },
        {
          texto: "Escolher heading pelo tamanho visual",
          explicacao: "Tamanho se ajusta com CSS, não pela escolha da tag.",
        },
        {
          texto: "Pular do h1 direto para o h4",
          explicacao: "Pular níveis confunde a estrutura documental.",
        },
      ],
    },
  ],
};

function conteudoStub(modulo: ModuloSeed, licao: LicaoSeed): string {
  return [
    `# ${licao.titulo}`,
    "",
    `> Módulo ${modulo.numero} · ${modulo.titulo}`,
    "",
    "Conteúdo desta lição em construção. Este arquivo vive em",
    `\`content/${modulo.slug}/${licao.slug}.mdx\` — edite-o para publicar`,
    "a aula completa. Enquanto isso, aproveite para revisar os conceitos do módulo!",
    "",
    "## Resumo",
    "",
    "- Objetivos de aprendizagem desta lição",
    "- Exemplos práticos",
    "- Quiz ao final (quando disponível)",
    "",
  ].join("\n");
}

async function garantirArquivoConteudo(modulo: ModuloSeed, licao: LicaoSeed): Promise<void> {
  const pastaModulo = path.join(RAIZ_CONTEUDO, modulo.slug);
  await mkdir(pastaModulo, { recursive: true });
  const arquivo = path.join(pastaModulo, `${licao.slug}.mdx`);
  try {
    await readFile(arquivo, "utf8");
  } catch {
    await writeFile(arquivo, conteudoStub(modulo, licao), "utf8");
    console.log(`  + conteúdo criado: ${modulo.slug}/${licao.slug}.mdx`);
  }
}

async function main() {
  console.log("Semeando módulos e lições…");

  for (const modulo of MODULOS) {
    const moduloDb = await prisma.modulo.upsert({
      where: { slug: modulo.slug },
      create: {
        slug: modulo.slug,
        numero: modulo.numero,
        titulo: modulo.titulo,
        corHex: modulo.corHex,
      },
      update: {
        numero: modulo.numero,
        titulo: modulo.titulo,
        corHex: modulo.corHex,
      },
    });

    for (const [indice, licao] of modulo.licoes.entries()) {
      const conteudoPath = `${modulo.slug}/${licao.slug}.mdx`;
      await garantirArquivoConteudo(modulo, licao);
      await prisma.licao.upsert({
        where: { moduloId_slug: { moduloId: moduloDb.id, slug: licao.slug } },
        create: {
          moduloId: moduloDb.id,
          slug: licao.slug,
          titulo: licao.titulo,
          ordem: indice + 1,
          conteudoPath,
        },
        update: {
          titulo: licao.titulo,
          ordem: indice + 1,
          conteudoPath,
        },
      });
    }
    console.log(`✓ Módulo ${modulo.numero} — ${modulo.titulo} (${modulo.licoes.length} lições)`);
  }

  console.log("Semeando quizzes…");
  for (const [chave, perguntas] of Object.entries(QUIZZES)) {
    const [slugModulo, slugLicao] = chave.split("/");
    if (!slugModulo || !slugLicao) {
      throw new Error(`Chave de quiz inválida: '${chave}'`);
    }
    const moduloDoQuiz = await prisma.modulo.findUnique({ where: { slug: slugModulo } });
    if (!moduloDoQuiz) throw new Error(`Módulo não encontrado para quiz: ${chave}`);
    const licao = await prisma.licao.findUnique({
      where: { moduloId_slug: { moduloId: moduloDoQuiz.id, slug: slugLicao } },
    });
    if (!licao) throw new Error(`Lição não encontrada para quiz: ${chave}`);

    const jaExiste = await prisma.quiz.findUnique({ where: { licaoId: licao.id } });
    if (jaExiste) continue;

    await prisma.quiz.create({
      data: {
        licaoId: licao.id,
        perguntas: {
          create: perguntas.map((pergunta) => ({
            enunciado: pergunta.enunciado,
            alternativas: {
              create: pergunta.alternativas.map((alternativa) => ({
                texto: alternativa.texto,
                correta: alternativa.correta === true,
                explicacao: alternativa.explicacao,
              })),
            },
          })),
        },
      },
    });
    console.log(`✓ Quiz criado: ${chave} (${perguntas.length} perguntas)`);
  }

  const totalLicoes = MODULOS.reduce((soma, m) => soma + m.licoes.length, 0);
  console.log(
    `\nSeed concluído: ${MODULOS.length} módulos, ${totalLicoes} lições, ${Object.keys(QUIZZES).length} quizzes.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (erro) => {
    console.error("Falha no seed:", erro);
    await prisma.$disconnect();
    process.exit(1);
  });
