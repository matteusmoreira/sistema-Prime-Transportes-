# Diretrizes de Auditoria e Logging

Este documento descreve o padrão centralizado de auditoria (system_logs) e como as features devem registrar ações. O objetivo é garantir rastreabilidade consistente, sem duplicidade e com mínimo acoplamento à camada de dados.

## Princípios

- Centralização: todo registro de log deve passar por `useLogs().logAction`, que usa o `LogsContext` por baixo dos panos e chama a RPC `log_system_action` com RLS/segurança adequadas.
- Não chame `supabase.rpc('log_system_action', ...)` diretamente em componentes/hooks de features. Use sempre `logAction` do `LogsContext`.
- Minimização: envie apenas dados relevantes em `old_data` e `new_data` (evite blobs, arquivos ou objetos enormes). Remova campos como `documentos`.
- Contexto de Segurança: a tabela `system_logs` possui RLS permitindo INSERT para usuários autenticados e restringindo leitura/remoção a administradores.

## Estrutura do Log

- action_type: 'CREATE' | 'UPDATE' | 'DELETE'
- entity_type: 'empresas' | 'solicitantes' | 'motoristas' | 'corridas'
- entity_id: string (pode ser número convertido para string, UUID, etc.)
- old_data: JSON com valores antes da alteração (null em CREATE)
- new_data: JSON com valores após a alteração (null em DELETE)

## Como usar

Exemplo genérico em um hook/componente de feature:

```ts
import { useLogs } from '@/contexts/LogsContext';

const { logAction } = useLogs();

await logAction({
  action_type: 'UPDATE',
  entity_type: 'corridas',
  entity_id: String(corridaId),
  old_data: { status: 'Pendente' },
  new_data: { status: 'Aprovada' }
});
```

## Padrões por domínio

- Corridas
  - Usar funções do `CorridasContext`: `addCorrida`, `updateCorrida`, `deleteCorrida`, `approveCorrida`, `rejectCorrida`, `updateStatus`, `fillOS`, `selectMotorista`.
  - Essas funções já registram logs apropriados. Evite atualizar corridas diretamente via Supabase fora do contexto.
  - Importante: `updateCorrida` monta `old_data` dinamicamente com base nas chaves realmente atualizadas (incluindo campos financeiros como `statusPagamento` e `medicaoNotaFiscal`).

- Motoristas
  - `useMotoristas` utiliza `useLogInterceptor` para `addMotorista`, `updateMotorista` e `deleteMotorista`. Não logue duplicado.
  - Em `AdminDocumentosViewer`, visualizações e downloads de documentos/fotos são logadas como `CREATE` com `entity_type: 'motoristas'` e detalhes do item.

- Documentos de Corrida
  - `useCorridaDocuments` registra downloads (público vs storage) com `entity_type: 'corridas'` e detalhe do documento.

- Financeiro
  - `useFinanceiro` delega alterações a `CorridasContext.updateCorrida` e `updateStatus`. Os logs já são gerados pelo contexto, inclusive para `statusPagamento` e `medicaoNotaFiscal`.

## Boas práticas

- Sempre converter IDs para string no `entity_id`.
- Remover campos grandes ou irrelevantes de `new_data`/`old_data` (ex.: `documentos`).
- Ao atualizar múltiplos campos, enviar apenas os que realmente mudaram; o `updateCorrida` já trata isso corretamente para fins de log.
- Use nomes coesos para ações não-CRUD no `new_data.details` (ex.: `visualizacao_documento`, `download_documento`, `visualizacao_foto`).

## Acesso de Administrador

- UI: `LogsPage` e `LogsPanel` usam `useIsAdmin()` para restringir acesso e ações (exclusão).
- Servidor: RLS na tabela e checagens nas RPCs garantem que apenas administradores listem/excluam logs. Usuários autenticados podem apenas inserir logs.

## Índices e Performance

- Índices existentes: `user_email`, `created_at DESC`, `action_type`, `entity_type`, `entity_id`, e índice composto `(entity_type, action_type, created_at DESC)`.
- Se futuramente for necessário pesquisar por conteúdo em `old_data/new_data`, considerar índice GIN em colunas JSONB.
- Para grande volume de dados na UI, considerar paginação server-side e/ou virtualização na lista (ver seção de melhorias abaixo).

## Testes Manuais (checklist)

1) Corrida
- Criar, editar (campos básicos), selecionar motorista, preencher OS, aprovar/rejeitar, atualizar status, deletar.
- Verificar que cada etapa aparece em Logs com `entity_type: 'corridas'`, `entity_id` correto e `old_data/new_data` consistentes.

2) Motorista
- Criar/editar/excluir motorista; acessar documentos e fotos, fazer download.
- Verificar logs `entity_type: 'motoristas'` com detalhes do item visualizado/baixado.

3) Documentos Corrida
- Baixar por link público e por storage.
- Verificar logs com fonte correta (público vs storage).

4) Permissões
- Usuário não-admin: não consegue abrir página de logs nem apagar.
- Admin: consegue listar, filtrar e apagar logs.

## Ideias de Evolução (server-side)

- Edge Function para enriquecer logs com IP/geo sem impactar a UI:

```ts
// functions/log-enrich/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('cf-connecting-ip') ?? undefined
  const ua = req.headers.get('user-agent') ?? undefined
  const body = await req.json() // { user_email, action_type, entity_type, entity_id, old_data, new_data }

  const { data, error } = await supabase.rpc('log_system_action', {
    p_user_email: body.user_email,
    p_action_type: body.action_type,
    p_entity_type: body.entity_type,
    p_entity_id: String(body.entity_id),
    p_old_data: body.old_data ?? null,
    p_new_data: body.new_data ?? null,
    p_ip_address: ip ?? null,
    p_user_agent: ua ?? null,
  })

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  return new Response(JSON.stringify({ id: data }), { status: 200 })
})
```

- Chamar a função acima no lugar de `logAction` quando quisermos enriquecer com IP/geo e padronizar.

## Conclusão

- Utilize sempre `useLogs().logAction` em features.
- Delegue atualizações de corridas ao `CorridasContext` para evitar logs duplicados e garantir consistência.
- Siga o checklist de testes a cada alteração relevante.