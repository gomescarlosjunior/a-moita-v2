# Guia de Integração de Widgets Hostex

## Visão Geral
Este guia detalha como substituir os botões mock do dashboard atual pelos widgets reais da integração Hostex, criando uma interface funcional conectada à API.

## Estrutura Atual vs. Nova Estrutura

### Dashboard Atual (Mock)
```
src/app/dashboard/page.tsx - Dashboard com dados simulados
src/app/page.tsx - Homepage com botões estáticos
```

### Nova Estrutura Integrada
```
src/app/dashboard/page.tsx - Dashboard conectado à API Hostex
src/components/hostex/ - Widgets reutilizáveis
src/hooks/hostex/ - Hooks customizados para dados
```

## Plano de Substituição Passo a Passo

### Fase 1: Validação da Integração
**Status:** ✅ Concluído
- [x] Teste completo da integração (`/integration-test`)
- [x] Validação de autenticação e conectividade
- [x] Verificação de endpoints da API

### Fase 2: Criação de Hooks Customizados

#### 2.1 Hook para Propriedades
```typescript
// src/hooks/hostex/useProperties.ts
export function useProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Fetch properties from /api/hostex/properties
  // Handle loading states and errors
  // Provide refresh functionality
}
```

#### 2.2 Hook para Métricas do Dashboard
```typescript
// src/hooks/hostex/useDashboardMetrics.ts
export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Fetch from /api/hostex/dashboard
  // Auto-refresh every 5 minutes
  // Cache results
}
```

#### 2.3 Hook para Reservas
```typescript
// src/hooks/hostex/useReservations.ts
export function useReservations(propertyId?: string) {
  // Fetch reservations with optional property filter
  // Real-time updates via polling or WebSocket
}
```

### Fase 3: Componentes de Widget

#### 3.1 Widget de Métricas Principais
```typescript
// src/components/hostex/MetricsWidget.tsx
export function MetricsWidget() {
  const { metrics, loading, error } = useDashboardMetrics()
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard 
        title="Receita Total" 
        value={`R$ ${metrics?.totalRevenue?.toLocaleString('pt-BR')}`}
        icon={<CurrencyDollarIcon />}
      />
      <MetricCard 
        title="Taxa de Ocupação" 
        value={`${metrics?.averageOccupancy?.toFixed(1)}%`}
        icon={<ChartBarIcon />}
      />
      {/* Mais métricas... */}
    </div>
  )
}
```

#### 3.2 Widget de Lista de Propriedades
```typescript
// src/components/hostex/PropertiesWidget.tsx
export function PropertiesWidget() {
  const { properties, loading, syncProperty } = useProperties()
  
  return (
    <div className="space-y-4">
      {properties.map(property => (
        <PropertyCard 
          key={property.id}
          property={property}
          onSync={() => syncProperty(property.id)}
          onViewDetails={() => router.push(`/properties/${property.id}`)}
        />
      ))}
    </div>
  )
}
```

#### 3.3 Widget de Calendário de Reservas
```typescript
// src/components/hostex/ReservationCalendar.tsx
export function ReservationCalendar({ propertyId }: { propertyId?: string }) {
  const { reservations, availability } = useReservations(propertyId)
  
  return (
    <Calendar 
      events={reservations}
      availability={availability}
      onDateClick={handleDateClick}
      onEventClick={handleReservationClick}
    />
  )
}
```

#### 3.4 Widget de Mensagens Automáticas
```typescript
// src/components/hostex/MessagingWidget.tsx
export function MessagingWidget() {
  const { templates, messages, sendMessage } = useMessaging()
  
  return (
    <div className="space-y-4">
      <MessageTemplateList templates={templates} />
      <RecentMessages messages={messages} />
      <QuickMessageForm onSend={sendMessage} />
    </div>
  )
}
```

### Fase 4: Atualização do Dashboard Principal

#### 4.1 Substituir Dashboard Mock
```typescript
// src/app/dashboard/page.tsx - ANTES (Mock)
const mockData = {
  totalRevenue: 125000,
  occupancyRate: 78.5,
  // ...
}

// src/app/dashboard/page.tsx - DEPOIS (Real)
import { MetricsWidget } from '@/components/hostex/MetricsWidget'
import { PropertiesWidget } from '@/components/hostex/PropertiesWidget'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <MetricsWidget />
      <PropertiesWidget />
      <ReservationCalendar />
      <MessagingWidget />
    </div>
  )
}
```

#### 4.2 Navegação Dinâmica
```typescript
// Substituir links estáticos por navegação baseada em dados reais
const { properties } = useProperties()

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Propriedades', href: '/properties', count: properties.length },
  { name: 'Reservas', href: '/reservations' },
  { name: 'Mensagens', href: '/messages' },
]
```

### Fase 5: Páginas Específicas

#### 5.1 Página de Propriedade Individual
```typescript
// src/app/properties/[id]/page.tsx
export default function PropertyPage({ params }: { params: { id: string } }) {
  const { property, loading } = useProperty(params.id)
  const { reservations } = useReservations(params.id)
  
  return (
    <div>
      <PropertyHeader property={property} />
      <PropertyMetrics property={property} />
      <ReservationCalendar propertyId={params.id} />
      <ChannelConnections property={property} />
    </div>
  )
}
```

#### 5.2 Página de Reservas
```typescript
// src/app/reservations/page.tsx
export default function ReservationsPage() {
  const { reservations, filters, setFilters } = useReservations()
  
  return (
    <div>
      <ReservationFilters filters={filters} onChange={setFilters} />
      <ReservationList reservations={reservations} />
      <ReservationCalendar />
    </div>
  )
}
```

### Fase 6: Funcionalidades Avançadas

#### 6.1 Sincronização em Tempo Real
```typescript
// src/hooks/hostex/useRealTimeSync.ts
export function useRealTimeSync() {
  useEffect(() => {
    const interval = setInterval(() => {
      // Sync calendars
      // Check for new reservations
      // Update availability
    }, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [])
}
```

#### 6.2 Notificações e Alertas
```typescript
// src/components/hostex/NotificationCenter.tsx
export function NotificationCenter() {
  const { conflicts, newReservations, channelIssues } = useNotifications()
  
  return (
    <div className="fixed top-4 right-4 space-y-2">
      {conflicts.map(conflict => (
        <ConflictAlert key={conflict.id} conflict={conflict} />
      ))}
      {newReservations.map(reservation => (
        <NewReservationAlert key={reservation.id} reservation={reservation} />
      ))}
    </div>
  )
}
```

#### 6.3 Ações em Lote
```typescript
// src/components/hostex/BulkActions.tsx
export function BulkActions({ selectedProperties }: { selectedProperties: string[] }) {
  const { syncProperties, updatePricing, blockDates } = usePropertyActions()
  
  return (
    <div className="flex space-x-2">
      <button onClick={() => syncProperties(selectedProperties)}>
        Sincronizar Selecionadas
      </button>
      <button onClick={() => updatePricing(selectedProperties)}>
        Atualizar Preços
      </button>
      <button onClick={() => blockDates(selectedProperties)}>
        Bloquear Datas
      </button>
    </div>
  )
}
```

## Checklist de Implementação

### ✅ Pré-requisitos Concluídos
- [x] Integração Hostex configurada
- [x] API endpoints funcionando
- [x] Testes de integração passando
- [x] Autenticação validada

### 📋 Próximos Passos

#### Fase 1: Hooks e Utilitários (1-2 dias)
- [ ] Criar `useProperties()` hook
- [ ] Criar `useDashboardMetrics()` hook  
- [ ] Criar `useReservations()` hook
- [ ] Criar `useMessaging()` hook
- [ ] Implementar cache e error handling

#### Fase 2: Widgets Básicos (2-3 dias)
- [ ] `MetricsWidget` - métricas principais
- [ ] `PropertiesWidget` - lista de propriedades
- [ ] `ReservationCalendar` - calendário interativo
- [ ] `MessagingWidget` - templates e mensagens

#### Fase 3: Dashboard Integrado (1 dia)
- [ ] Substituir dashboard mock por widgets reais
- [ ] Implementar loading states e error boundaries
- [ ] Adicionar refresh automático

#### Fase 4: Páginas Específicas (2-3 dias)
- [ ] Página individual de propriedade
- [ ] Página de reservas com filtros
- [ ] Página de mensagens e templates
- [ ] Página de configurações de canais

#### Fase 5: Funcionalidades Avançadas (2-3 dias)
- [ ] Sincronização em tempo real
- [ ] Sistema de notificações
- [ ] Ações em lote
- [ ] Relatórios e exportação

#### Fase 6: Polimento e Testes (1-2 dias)
- [ ] Testes unitários dos componentes
- [ ] Testes de integração end-to-end
- [ ] Otimização de performance
- [ ] Documentação de uso

## Comandos de Teste Durante Desenvolvimento

```bash
# Testar integração completa
curl http://localhost:3000/integration-test

# Testar endpoints individuais
curl http://localhost:3000/api/hostex/status
curl http://localhost:3000/api/hostex/properties
curl http://localhost:3000/api/hostex/dashboard

# Executar testes automatizados
pnpm test

# Build para verificar erros de TypeScript
pnpm build
```

## Estrutura de Arquivos Final

```
src/
├── app/
│   ├── dashboard/page.tsx          # Dashboard principal integrado
│   ├── properties/
│   │   ├── page.tsx               # Lista de propriedades
│   │   └── [id]/page.tsx          # Propriedade individual
│   ├── reservations/page.tsx       # Gestão de reservas
│   ├── messages/page.tsx          # Sistema de mensagens
│   └── integration-test/page.tsx   # Testes de integração
├── components/hostex/
│   ├── MetricsWidget.tsx          # Métricas do dashboard
│   ├── PropertiesWidget.tsx       # Lista de propriedades
│   ├── ReservationCalendar.tsx    # Calendário de reservas
│   ├── MessagingWidget.tsx        # Mensagens automáticas
│   ├── PropertyCard.tsx           # Card individual de propriedade
│   ├── ReservationCard.tsx        # Card de reserva
│   └── NotificationCenter.tsx     # Centro de notificações
├── hooks/hostex/
│   ├── useProperties.ts           # Hook para propriedades
│   ├── useDashboardMetrics.ts     # Hook para métricas
│   ├── useReservations.ts         # Hook para reservas
│   ├── useMessaging.ts            # Hook para mensagens
│   └── useRealTimeSync.ts         # Sincronização em tempo real
└── lib/hostex/                    # Já implementado
    ├── client.ts
    ├── config.ts
    ├── index.ts
    └── ...
```

## Estimativa de Tempo Total
- **Desenvolvimento:** 10-14 dias
- **Testes e Polimento:** 3-5 dias
- **Total:** 2-3 semanas

## Critérios de Sucesso
1. ✅ Dashboard mostra dados reais da API Hostex
2. ✅ Propriedades carregam e sincronizam corretamente
3. ✅ Reservas aparecem no calendário em tempo real
4. ✅ Mensagens automáticas funcionam conforme triggers
5. ✅ Interface responsiva e performática
6. ✅ Error handling robusto
7. ✅ Testes de integração passando 100%
