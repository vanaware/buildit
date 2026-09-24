# Guia Técnico: O Impacto do `baseDir` no BuildIt

Este documento explica detalhadamente como a opção `basedir` (configurável via CLI `-b` ou `--base-dir`) influencia o comportamento de leitura, escrita e resolução de caminhos em todos os utilitários do ecossistema BuildIt.

---

## 1. O que é o `baseDir`?

O `baseDir` é o **Diretório Raiz de Execução** (ou Workspace Root). Ele define o ponto de ancoragem para todos os caminhos relativos declarados nos arquivos de configuração (`.jsonc`).

- **Padrão:** Se não informado, o BuildIt assume `.` (o diretório atual onde o comando foi disparado).
- **Escopo:** O impacto é **global** em cada utilitário, afetando desde a localização do arquivo de configuração até a geração dos arquivos de saída.

---

## 2. Impacto por Utilitário

### ⚡ esbuild & 📦 denobuild (Build de Produção)

Neste contexto, o `baseDir` atua como o prefixo para a estrutura do monorepo ou projeto.

1.  **Resolução de Pastas Centrais**:
    - `srcdir`, `distdir` e `publicdir` são resolvidos usando `join(baseDir, path)`. Se você estiver na raiz do monorepo e rodar `--base-dir packages/ui`, o BuildIt procurará a origem em `packages/ui/src`.
2.  **EntryPoints**:
    - São resolvidos em relação ao `srcdir` já prefixado pelo `baseDir`.
3.  **Cópia de Arquivos (`copyFiles`)**:
    - Atua como o `generalBaseDir`. Cada entrada no array `copyFiles` que possuir um `basedir` próprio será resolvida em relação ao `baseDir` global da execução.
    - Exemplo: Se `baseDir` é `packages/ui` e o item tem `basedir: "public"`, a varredura real ocorre em `packages/ui/public`.
4.  **Limpeza (`clean`)**:
    - O diretório `distdir` (alvo da limpeza) é prefixado pelo `baseDir`. As regras de inclusão/exclusão de limpeza operam estritamente dentro desse caminho resultante.

### 👀 watch (Monitoramento de Desenvolvimento)

O `watch` herda todo o comportamento do `esbuild`, mas adiciona uma camada crítica de segurança:

1.  **Lock File (`.buildit-watch.lock`)**:
    - O arquivo de trava de PID é criado na raiz do `baseDir`.
    - **Por que isso importa?** Isso permite que você execute múltiplos processos `watch` no mesmo servidor, desde que apontem para `baseDir` diferentes, evitando colisões de processos que tentam monitorar o mesmo projeto.

### 📝 export (Snapshot para IA)

O `export` é o utilitário mais sensível ao `baseDir`, pois ele determina o que "entra na foto".

1.  **Raiz do Glob**:
    - O `baseDir` é passado como o parâmetro `root` para a função `expandGlob`. Padrões como `src/**/*.ts` só encontrarão arquivos dentro do `baseDir`.
2.  **Caminhos no Markdown**:
    - O utilitário calcula o caminho relativo de cada arquivo usando `relative(baseDir, arquivo.path)`. Isso garante que o snapshot gerado seja limpo e não exponha a estrutura absoluta de pastas do seu servidor/máquina.
3.  **Destino do Snapshot**:
    - O arquivo gerado (ex: `exports/ui.md`) é criado dentro do `baseDir`. Se você rodar com `--base-dir packages/utils`, o resultado irá para `packages/utils/exports/ui.md`.

### 🧼 sanitize-version & 🏷️ tag-version (Versionamento)

1.  **Localização do `deno.jsonc`**:
    - Se o caminho do arquivo não for absoluto, o utilitário tenta localizá-lo dentro do `baseDir`.

---

## 3. Resumo de Comportamento de Paths

| Tipo de Caminho | Comportamento com `baseDir` |
| :--- | :--- |
| **Caminho Absoluto** (`/etc/config`) | **Ignora** o `baseDir`. O sistema usa o caminho literal. |
| **Caminho Relativo** (`src/main.ts`) | **Prefixa** com `baseDir` → `join(baseDir, "src/main.ts")`. |
| **Padrão Glob** (`**/*.ts`) | **Restringe** a busca ao escopo do `baseDir`. |

---

## 4. Status da Implementação

A implementação do `baseDir` é **Sistêmica e Global**. 

Ela foi refatorada para ser propagada desde a camada de CLI (`packages/utils/src/*/cli.ts`) até o motor (`engine.ts`) e finalmente para as funções de baixo nível em `packages/utils/src/tools/paths.ts`. 

### Pontos de Verificação (Garantia de Integridade):
- [x] **Consistência**: Todos os utilitários usam a mesma função `resolveWithBase` para normalização.
- [x] **Segurança**: Funções de escrita e deleção (`cleanTarget`, `copyStaticFiles`) validam se o caminho final não "escapa" do diretório pretendido através de travas contra path traversal.
- [x] **Transparência**: Os logs de console exibem os caminhos resolvidos para que o usuário saiba exatamente onde o BuildIt está operando.
