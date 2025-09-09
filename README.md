# PRD - Sistema Prime Transportes

## 1. Visão Geral do Produto

### 1.1 Nome do Produto
**Prime Transportes - Sistema de Gestão de Corridas e Motoristas**

### 1.2 Descrição
Sistema web completo para gestão de corridas, motoristas, empresas e processos financeiros de uma empresa de transportes. O sistema oferece controle total do fluxo operacional desde a solicitação de corridas até o pagamento dos motoristas.

### 1.3 Objetivos do Produto
- Centralizar o gerenciamento de corridas e motoristas
- Automatizar processos operacionais e financeiros
- Fornecer visibilidade completa do status das corridas
- Facilitar a comunicação entre diferentes níveis de usuários
- Gerar relatórios detalhados para tomada de decisões

## 2. Público-Alvo

### 2.1 Usuários Primários
- **Administradores**: Controle total do sistema
- **Administração**: Gestão operacional de corridas e motoristas
- **Financeiro**: Aprovação de OS e controle de pagamentos
- **Motoristas**: Preenchimento de OS e visualização de corridas

### 2.2 Empresas Cliente
- Empresas que necessitam de serviços de transporte
- Solicitantes vinculados às empresas

## 3. Funcionalidades Principais

### 3.1 Módulo de Autenticação
- **Login seguro** com diferentes níveis de acesso
- **Cadastro de motoristas** com validação de documentos
- **Recuperação de senha**
- **Perfis de usuário** personalizados por role

### 3.2 Módulo de Corridas
- **Criação de corridas** com dados completos
- **Workflow de status** (Pendente → Confirmada → Em Andamento → Concluída)
- **Seleção de motoristas** para corridas
- **Preenchimento de OS** (Ordem de Serviço) pelos motoristas
- **Aprovação/Rejeição** pelo financeiro
- **Upload de documentos** (notas, recibos, fotos)
- **Cálculo automático** de valores e reembolsos

### 3.3 Módulo de Motoristas
- **Cadastro completo** com documentos obrigatórios
- **Gestão de status** (Pendente, Aprovado, Rejeitado)
- **Upload de documentos** (CNH, RG, Fotos do veículo)
- **Histórico de corridas** por motorista
- **Criação automática** de contas de acesso

### 3.4 Módulo de Empresas
- **Cadastro de empresas** clientes
- **Gestão de solicitantes** vinculados às empresas
- **Controle de centro de custo**
- **Histórico de corridas** por empresa

### 3.5 Módulo Financeiro
- **Aprovação de OS** preenchidas pelos motoristas
- **Controle de pagamentos** (Pendente/Pago)
- **Gestão de reembolsos** e despesas
- **Cálculo de valores** para motoristas
- **Status de medição** vs Nota Fiscal

### 3.6 Módulo de Relatórios
- **Relatórios personalizados** por período
- **Filtros avançados** (empresa, motorista, status)
- **Exportação** em múltiplos formatos
- **Histórico de relatórios** gerados
- **Snapshots de filtros** aplicados

### 3.7 Módulo de Alertas e Notificações
- **Sistema de alertas** para diferentes usuários
- **Notificações em tempo real**
- **Controle de leitura** de alertas
- **Segmentação** por tipo de usuário

### 3.8 Módulo de Vouchers
- **Gestão de vouchers** de combustível
- **Controle de uso** e saldo
- **Relatórios de consumo**
- **Filtros e estatísticas**

### 3.9 Módulo de Configurações
- **Configurações gerais** do sistema
- **Integração com WhatsApp** (Evolution API)
- **Testes de conectividade**
- **Parâmetros operacionais**

## 4. Fluxo de Trabalho Principal

### 4.1 Fluxo de Corrida
1. **Solicitação**: Administração cria nova corrida
2. **Seleção**: Motorista é selecionado para a corrida
3. **Confirmação**: Corrida é confirmada e motorista notificado
4. **Execução**: Motorista executa a corrida
5. **OS**: Motorista preenche Ordem de Serviço com despesas
6. **Aprovação**: Financeiro aprova ou rejeita a OS
7. **Pagamento**: Corrida aprovada gera pagamento para motorista

### 4.2 Status de Corrida
- **Pendente**: Corrida criada, aguardando seleção de motorista
- **Confirmada**: Motorista selecionado e confirmado
- **Em Andamento**: Corrida em execução
- **Aguardando OS**: Corrida concluída, aguardando preenchimento da OS
- **OS Preenchida**: OS preenchida pelo motorista
- **Aprovada**: OS aprovada pelo financeiro
- **Rejeitada**: OS rejeitada, necessita correção
- **Concluída**: Processo finalizado
- **Cancelada**: Corrida cancelada

## 5. Requisitos Técnicos

### 5.1 Tecnologias Utilizadas
- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Realtime**: Supabase Realtime para notificações
- **Integração**: Evolution API para WhatsApp

### 5.2 Arquitetura
- **SPA (Single Page Application)** responsiva
- **PWA (Progressive Web App)** com manifest
- **Autenticação JWT** via Supabase Auth
- **RLS (Row Level Security)** para controle de acesso
- **Upload de arquivos** via Supabase Storage

### 5.3 Segurança
- **Controle de acesso** baseado em roles
- **Políticas RLS** no banco de dados
- **Validação de dados** no frontend e backend
- **Sanitização** de uploads de arquivos

## 6. Estrutura de Dados

### 6.1 Entidades Principais
- **Profiles**: Perfis de usuário com roles
- **Empresas**: Empresas clientes
- **Solicitantes**: Usuários das empresas
- **Motoristas**: Motoristas cadastrados
- **Corridas**: Corridas solicitadas
- **Documentos**: Arquivos anexados
- **Alertas**: Sistema de notificações
- **Notificações**: Notificações em tempo real

### 6.2 Relacionamentos
- Empresas → Solicitantes (1:N)
- Motoristas → Corridas (1:N)
- Corridas → Documentos (1:N)
- Usuários → Profiles (1:1)

## 7. Interface do Usuário

### 7.1 Design System
- **Cores**: Tema azul (#0ea5e9) com variações
- **Tipografia**: Sistema de fontes responsivo
- **Componentes**: Biblioteca shadcn/ui
- **Responsividade**: Mobile-first design

### 7.2 Navegação
- **Sidebar** com navegação principal
- **Header** com informações do usuário
- **Breadcrumbs** para orientação
- **Modais** para ações específicas

### 7.3 Experiência do Usuário
- **Dashboard** personalizado por role
- **Filtros avançados** em todas as listagens
- **Feedback visual** para todas as ações
- **Loading states** e error handling

## 8. Integrações

### 8.1 WhatsApp (Evolution API)
- **Envio de notificações** para motoristas
- **Confirmações** de corridas
- **Alertas** de status

### 8.2 Supabase
- **Autenticação** de usuários
- **Banco de dados** PostgreSQL
- **Storage** para arquivos
- **Realtime** para notificações

## 9. Métricas e KPIs

### 9.1 Operacionais
- Número de corridas por período
- Taxa de aprovação de OS
- Tempo médio de processamento
- Motoristas ativos

### 9.2 Financeiros
- Valor total de corridas
- Reembolsos por período
- Custo por corrida
- Receita por empresa


## 11. Considerações de Implementação

### 11.1 Performance
- **Lazy loading** de componentes
- **Paginação** em listagens grandes
- **Cache** de dados frequentes
- **Otimização** de imagens

### 11.2 Manutenibilidade
- **Código TypeScript** tipado
- **Componentes reutilizáveis**
- **Hooks customizados** para lógica
- **Testes unitários** (planejado)

### 11.3 Escalabilidade
- **Arquitetura modular**
- **Separação de responsabilidades**
- **Contextos React** para estado global
- **Supabase** para escalabilidade automática

---

**Versão**: 1.0  
**Data**: Setembro 2025  
**Autor**: Matteus Moreira 
**Status**: Implementado e em Produção
