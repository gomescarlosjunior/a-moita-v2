# A Moita - Website

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
- `pnpm format` - Formata o código com Prettier

## Deploy

O deploy é feito automaticamente através do Vercel quando há push para a branch `main`.

### Deploy Manual

1. Faça login na sua conta Vercel
2. Selecione o projeto
3. Vá em "Deployments"
4. Clique em "Deploy"

## Licença

Este projeto está sob a licença MIT.
