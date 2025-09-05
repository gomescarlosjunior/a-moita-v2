# A Moita - Website

[![CI/CD](https://github.com/gomescarlosjunior/a-moita-v2/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/gomescarlosjunior/a-moita-v2/actions/workflows/ci-cd.yml)

Site oficial da A Moita - Refúgio no Cerrado

## Tecnologias

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- React Icons

## Configuração do Ambiente

1. **Pré-requisitos**
   - Node.js 18+
   - pnpm 8+

2. **Instalação**
   ```bash
   # Instalar dependências
   pnpm install
   
   # Iniciar servidor de desenvolvimento
   pnpm dev
   ```

3. **Variáveis de Ambiente**
   Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
   ```
   NEXT_PUBLIC_SITE_URL=https://seu-site.vercel.app
   ```

## Scripts Disponíveis

- `pnpm dev` - Inicia o servidor de desenvolvimento
- `pnpm build` - Gera a versão de produção
- `pnpm start` - Inicia o servidor de produção
- `pnpm lint` - Executa o ESLint
- `pnpm lint:ci` - Lint estrito (falha com warnings)
- `pnpm type-check` - Checagem de tipos TypeScript (sem emitir)
- `pnpm format` - Formata o código com Prettier
- `pnpm format:check` - Verifica formatação
- `pnpm test` - Placeholder de testes (ajuste quando testes forem adicionados)

## Deploy

O deploy é feito automaticamente através do Vercel quando há push para a branch `main`.

### CI/CD no GitHub Actions

O pipeline executa as etapas abaixo para cada push/PR na `main`:

1. Check formatting (`pnpm format:check`)
2. Type check (`pnpm type-check`)
3. Lint estrito (`pnpm lint:ci`)
4. Testes (`pnpm test`) — placeholder até a suíte ser implementada
5. Build (`pnpm build`)
6. Deploy na Vercel (apenas quando `refs/heads/main`)

Em caso de falha, artefatos como `.next` e logs são carregados para análise no job.

### Segredos e Variáveis Requeridos

Configure no GitHub (Settings → Secrets and variables → Actions):

- Secrets
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
- Variables
  - `NEXT_PUBLIC_SITE_URL` (ex.: `https://a-moita.vercel.app`)

### Verificação Manual do Pipeline

1. Faça um commit na branch `main`.
2. Acesse GitHub → Actions → workflow "CI/CD".
3. Verifique as etapas: format, type-check, lint, test, build, deploy.
4. Em caso de erro, baixe o artifact "build-logs-and-artifacts" para depuração.
5. Confirme no Vercel que um novo deployment foi criado e promovido a produção.

## Higiene de Repositório

- Diretórios de backup e exemplos são ignorados via `.gitignore` (`src_backup/`, `src_broken_*/`, `with-turbopack-*`, `archive/`).
- Evite commitar assets locais temporários (`*.local.*.png/jpg`).

## Definition of Done (DoD)

- Projeto compila e roda localmente sem erros: `pnpm install && pnpm dev`.
- Deploy automático funcionando a cada commit na branch principal: verifique badge acima e o workflow em Actions.
- Logs de erro acessíveis e configurados: artifacts do job ("build-logs-and-artifacts") quando houver falha no pipeline.

## Licença

Este projeto está sob a licença MIT.
