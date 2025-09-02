# Correção do Problema de Upload de Documentos

## Problema Identificado

Após análise do código, foi identificado que o problema de upload de documentos está relacionado às **políticas de Row Level Security (RLS)** do Supabase. Os motoristas não possuem permissões adequadas para:

1. Inserir registros na tabela `corrida_documentos`
2. Fazer upload de arquivos no bucket `corrida-documentos`

## Solução

### 1. Aplicar Políticas RLS no Supabase

**OPÇÃO A - Script Simplificado (Recomendado):**

1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Execute o conteúdo do arquivo `fix-upload-policies-simple.sql`
4. **IMPORTANTE:** Execute cada comando `CREATE POLICY` separadamente
5. Se aparecer erro "policy already exists", ignore e continue

**OPÇÃO B - Script Completo:**

Use o arquivo `fix-upload-policies.sql` se quiser incluir comandos de debug

**Políticas que serão criadas:**
- Permitir motoristas inserir documentos nas suas corridas
- Permitir motoristas fazer upload no storage
- Permitir motoristas atualizar/deletar documentos das suas corridas

### 2. Logs de Debug Adicionados

Foi adicionado logging detalhado na função `fillOS` para identificar exatamente onde está falhando:

```javascript
// Logs que aparecerão no console do navegador:
📎 Documentos recebidos para salvar: [...]
📄 Processando documento: [nome] Arquivo: [true/false]
📄 Tipo do arquivo: File
📄 Tamanho do arquivo: [bytes]
⬆️ Fazendo upload do arquivo: [nome_do_arquivo]
⬆️ Bucket: corrida-documentos
✅ Upload realizado com sucesso: [...]
💾 Salvando registro na tabela corrida_documentos...
💾 Dados do documento para inserir: {...}
✅ Documento salvo no banco com sucesso: [...]
```

### 3. Como Testar

1. Abra o console do navegador (F12)
2. Faça login como motorista
3. Preencha uma OS com documentos anexados
4. Observe os logs no console para identificar onde está falhando

### 4. Possíveis Erros e Soluções

#### Erro de Política RLS
```
Erro: new row violates row-level security policy
```
**Solução:** Execute o script `fix-upload-policies.sql` no Supabase

#### Erro de Storage
```
Erro: Insufficient permissions
```
**Solução:** Verifique se as políticas de storage foram aplicadas corretamente

#### Erro de Autenticação
```
Erro: JWT expired
```
**Solução:** Faça logout e login novamente

### 5. Verificação das Políticas

Para verificar se as políticas foram aplicadas corretamente, execute no SQL Editor:

```sql
-- Verificar políticas da tabela
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('corrida_documentos') 
ORDER BY tablename, policyname;

-- Verificar políticas de storage
SELECT * FROM storage.policies WHERE bucket_id = 'corrida-documentos';
```

### 6. Estrutura da Tabela corrida_documentos

A tabela deve ter a seguinte estrutura:
```sql
CREATE TABLE corrida_documentos (
  id SERIAL PRIMARY KEY,
  corrida_id INTEGER REFERENCES corridas(id),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Próximos Passos

1. **Execute o script SQL** no painel do Supabase
2. **Teste o upload** de documentos
3. **Monitore os logs** no console do navegador
4. **Remova os logs de debug** após confirmar que está funcionando

## Arquivos Modificados

- `src/contexts/CorridasContext.tsx` - Adicionados logs de debug
- `fix-upload-policies.sql` - Script para corrigir políticas RLS
- `supabase/migrations/20250127000000-fix-corrida-documentos-policies.sql` - Migração (para referência)

---

**Importante:** Após confirmar que o upload está funcionando, remova os logs de debug para não poluir o console em produção.