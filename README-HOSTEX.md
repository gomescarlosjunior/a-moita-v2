# Integração Hostex - A Moita

Esta documentação descreve a integração completa do Hostex ao sistema A Moita para centralização da gestão de reservas, mensagens automáticas e sincronização de canais.

## 🎯 Visão Geral

A integração Hostex oferece:

- **Gestão Centralizada**: Todas as reservas e canais em um único dashboard
- **Sincronização Bidirecional**: Atualizações em tempo real entre canais
- **Prevenção de Overbooking**: Detecção e resolução automática de conflitos
- **Mensagens Automáticas**: Templates personalizados com triggers inteligentes
- **Auditoria Completa**: Logs detalhados de todas as operações

## 🚀 Configuração Inicial

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e configure:

```bash
# Credenciais Hostex
HOSTEX_API_KEY=sua_chave_api_hostex
HOSTEX_API_SECRET=seu_secret_hostex
HOSTEX_BASE_URL=https://api.hostex.com/v1
HOSTEX_WEBHOOK_SECRET=seu_webhook_secret

# Configurações NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu_nextauth_secret

# Banco de Dados (opcional para logs)
DATABASE_URL=sua_connection_string

# Real-time Updates
SOCKET_IO_URL=ws://localhost:3001
```

### 2. Instalação de Dependências

```bash
pnpm install
```

### 3. Configuração do Webhook

No painel Hostex, configure o webhook endpoint:

- **URL**: `https://seu-dominio.com/api/hostex/webhooks`
- **Secret**: Use o mesmo valor de `HOSTEX_WEBHOOK_SECRET`
- **Eventos**: Marque todos os eventos de reserva e disponibilidade

## 📊 Dashboard

Acesse o dashboard em `/dashboard` para visualizar:

### Métricas Principais

- **Receita Total**: Soma de todas as reservas confirmadas
- **Taxa de Ocupação**: Percentual médio de ocupação das propriedades
- **Reservas Totais**: Número total de reservas ativas
- **Canais Conectados**: Quantidade de canais sincronizados

### Gráficos

- **Receita e Ocupação**: Evolução mensal dos indicadores
- **Distribuição por Canal**: Percentual de reservas por canal

### Alertas

- **Conflitos Detectados**: Overbookings e inconsistências de preço
- **Status de Sincronização**: Estado atual de cada propriedade

## 🏠 Gestão de Propriedades

### Conectar Canal Externo

```typescript
// Via API
POST /api/hostex/properties
{
  "action": "connectChannel",
  "propertyId": "prop_123",
  "channelId": "airbnb",
  "credentials": {
    "username": "seu_usuario",
    "password": "sua_senha",
    "listingId": "12345"
  }
}
```

### Sincronizar Propriedade

```typescript
// Sincronização individual
POST /api/hostex/properties
{
  "action": "sync",
  "propertyId": "prop_123"
}

// Sincronização geral
POST /api/hostex/properties
{
  "action": "syncAll"
}
```

## 📅 Sincronização de Calendário

### Funcionalidades

1. **Sincronização Automática**: A cada 5 minutos por padrão
2. **Detecção de Conflitos**: Identifica overbookings automaticamente
3. **Resolução Automática**: Bloqueia datas com conflito
4. **Atualização Manual**: Permite ajustes de disponibilidade

### Tipos de Conflito

- **Overbooking**: Múltiplas reservas na mesma data
- **Inconsistência de Disponibilidade**: Propriedade disponível com reserva
- **Conflito de Preços**: Preços diferentes entre canais

## 💬 Sistema de Mensagens

### Templates Padrão

1. **Confirmação de Reserva**: Enviado imediatamente após confirmação
2. **Lembrete Check-in**: 1 dia antes do check-in
3. **Lembrete Check-out**: 2 horas antes do check-out
4. **Agradecimento**: 1 dia após check-out

### Variáveis Disponíveis

- `{{guestName}}`: Nome do hóspede
- `{{checkInDate}}`: Data de check-in (dd/MM/yyyy)
- `{{checkOutDate}}`: Data de check-out (dd/MM/yyyy)
- `{{checkInTime}}`: Horário de check-in (15:00)
- `{{checkOutTime}}`: Horário de check-out (11:00)
- `{{totalAmount}}`: Valor total formatado
- `{{guests}}`: Número de hóspedes
- `{{reservationId}}`: ID da reserva

### Criando Templates Personalizados

```typescript
import { hostexIntegration } from '@/lib/hostex'

const template = await hostexIntegration.createTemplate({
  name: 'Boas-vindas Personalizada',
  subject: 'Bem-vindo à A Moita, {{guestName}}!',
  content: `Olá {{guestName}},
  
  Estamos muito felizes em recebê-lo na A Moita!
  
  Sua reserva está confirmada para {{checkInDate}}.
  
  Atenciosamente,
  Equipe A Moita`,
  trigger: {
    type: 'booking_confirmed',
    timing: 'immediate',
  },
  language: 'pt',
  active: true,
  variables: ['guestName', 'checkInDate'],
})
```

## 🔧 API Endpoints

### Status da Integração

```
GET /api/hostex/status
```

### Métricas do Dashboard

```
GET /api/hostex/dashboard
```

### Propriedades

```
GET /api/hostex/properties
POST /api/hostex/properties
```

### Webhooks

```
POST /api/hostex/webhooks
```

## 🛠️ Desenvolvimento

### Estrutura do Código

```
src/lib/hostex/
├── client.ts              # Cliente API Hostex
├── config.ts              # Configuração e auditoria
├── property-manager.ts    # Gestão de propriedades
├── calendar-sync.ts       # Sincronização de calendário
├── messaging.ts           # Sistema de mensagens
└── index.ts              # Serviço principal
```

### Uso Programático

```typescript
import { hostexIntegration } from '@/lib/hostex'

// Verificar status
const status = await hostexIntegration.getStatus()

// Obter propriedades
const properties = await hostexIntegration.getProperties()

// Sincronizar propriedade
const result = await hostexIntegration.syncProperty('prop_123')

// Enviar mensagem manual
const message = await hostexIntegration.sendManualMessage(
  'res_456',
  'Mensagem personalizada',
  'email'
)
```

## 🔍 Monitoramento e Logs

### Auditoria

Todas as operações são registradas com:

- **Timestamp**: Data/hora da operação
- **Ação**: Tipo de operação realizada
- **Usuário**: ID do usuário (quando aplicável)
- **Detalhes**: Informações específicas da operação
- **IP/User-Agent**: Dados da requisição

### Logs de Sistema

```typescript
import { auditLogger } from '@/lib/hostex/config'

// Visualizar logs recentes
const logs = auditLogger.getLogs(50)

// Filtrar por ação
const syncLogs = auditLogger.getLogsByAction('SYNC_PROPERTY')

// Filtrar por usuário
const userLogs = auditLogger.getLogsByUser('user_123')
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de Autenticação

```
Error: Invalid API credentials
```

**Solução**: Verifique `HOSTEX_API_KEY` e `HOSTEX_API_SECRET` no `.env.local`

#### 2. Webhook não Funcionando

```
Error: Invalid signature
```

**Solução**: Confirme que `HOSTEX_WEBHOOK_SECRET` está correto

#### 3. Sincronização Falhando

```
Error: Property not found
```

**Solução**: Verifique se a propriedade existe no Hostex

#### 4. Conflitos não Resolvidos

```
Multiple reservations detected
```

**Solução**: Acesse o dashboard e resolva manualmente os conflitos

### Debug Mode

Para ativar logs detalhados:

```bash
DEBUG=hostex:* npm run dev
```

## 📈 Métricas de Performance

### Indicadores Monitorados

- **Tempo de Resposta API**: < 2 segundos
- **Taxa de Sucesso Sync**: > 95%
- **Conflitos Detectados**: Alertas em tempo real
- **Mensagens Enviadas**: Taxa de entrega > 98%

### Otimizações

1. **Cache Local**: Propriedades em cache por 5 minutos
2. **Sync Inteligente**: Apenas propriedades modificadas
3. **Rate Limiting**: Respeita limites da API Hostex
4. **Retry Logic**: 3 tentativas com backoff exponencial

## 🔐 Segurança

### Boas Práticas Implementadas

- **Validação de Webhook**: Verificação de assinatura HMAC
- **Sanitização de Logs**: Credenciais removidas automaticamente
- **Rate Limiting**: Proteção contra abuso
- **Auditoria Completa**: Rastreamento de todas as operações

## 📞 Suporte

Para suporte técnico:

1. Verifique os logs de auditoria
2. Consulte esta documentação
3. Entre em contato com a equipe de desenvolvimento

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Autor**: Equipe A Moita
