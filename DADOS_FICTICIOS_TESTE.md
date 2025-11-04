# 📊 DADOS FICTÍCIOS PARA TESTE DE KPIs

## 🎯 Objetivo
Adicionar dados variados na planilha para testar todos os KPIs do dashboard e garantir que os cálculos estão corretos.

---

## 📦 ABA PEDIDOS (15 colunas: A-O)

Adicione os seguintes pedidos à aba **Pedidos**:

| ID | Número Pedido | Tipo | Email | Nome | Setor | Produtos (JSON) | Quantidades (JSON) | Valor Total | Status | Data Solicitação | Data Compra | Data Finalização | Prazo Entrega | Observações |
|----|---------------|------|-------|------|-------|-----------------|-------------------|-------------|--------|------------------|-------------|------------------|---------------|-------------|
| PED-001 | 2025-001 | Papelaria | joao@neoformula.com | João Silva | TI | Caneta Azul; Caderno | 50; 10 | 125.50 | Finalizado | 01/10/2025 | 02/10/2025 | 05/10/2025 | 10/10/2025 | Entregue no prazo |
| PED-002 | 2025-002 | Limpeza | maria@neoformula.com | Maria Santos | RH | Detergente; Álcool | 20; 15 | 189.90 | Finalizado | 03/10/2025 | 04/10/2025 | 08/10/2025 | 12/10/2025 | OK |
| PED-003 | 2025-003 | Papelaria | pedro@neoformula.com | Pedro Costa | Vendas | Papel A4; Grampeador | 100; 5 | 450.00 | Em Compra | 10/10/2025 | 11/10/2025 | | 20/10/2025 | Aguardando fornecedor |
| PED-004 | 2025-004 | Limpeza | ana@neoformula.com | Ana Oliveira | Produção | Sabão; Vassoura | 30; 8 | 267.40 | Solicitado | 15/10/2025 | | | 25/10/2025 | Pendente aprovação |
| PED-005 | 2025-005 | Papelaria | carlos@neoformula.com | Carlos Lima | Financeiro | Calculadora; Régua | 3; 20 | 189.70 | Solicitado | 18/10/2025 | | | 28/10/2025 | Urgente |
| PED-006 | 2025-006 | Limpeza | lucia@neoformula.com | Lúcia Ferreira | TI | Desinfetante; Pano | 25; 50 | 345.80 | Em Compra | 20/10/2025 | 21/10/2025 | | 30/10/2025 | Em processo |
| PED-007 | 2025-007 | Papelaria | rafael@neoformula.com | Rafael Santos | RH | Pasta; Clips | 40; 100 | 198.50 | Finalizado | 22/10/2025 | 23/10/2025 | 26/10/2025 | 01/11/2025 | Entregue |
| PED-008 | 2025-008 | Limpeza | julia@neoformula.com | Júlia Martins | Vendas | Luva; Saco Lixo | 60; 200 | 412.30 | Aguardando Entrega | 25/10/2025 | 26/10/2025 | | 05/11/2025 | Despachado |
| PED-009 | 2025-009 | Papelaria | bruno@neoformula.com | Bruno Alves | Produção | Etiqueta; Fita | 150; 30 | 523.90 | Finalizado | 28/10/2025 | 29/10/2025 | 02/11/2025 | 08/11/2025 | OK |
| PED-010 | 2025-010 | Limpeza | fernanda@neoformula.com | Fernanda Rocha | Financeiro | Esponja; Amaciante | 80; 40 | 298.60 | Em Compra | 30/10/2025 | 31/10/2025 | | 10/11/2025 | Processando |
| PED-011 | 2025-011 | Papelaria | diego@neoformula.com | Diego Souza | TI | Mouse Pad; Teclado | 10; 2 | 389.00 | Cancelado | 01/11/2025 | | | | Cancelado por solicitante |
| PED-012 | 2025-012 | Limpeza | patricia@neoformula.com | Patrícia Dias | RH | Sabonete; Papel Toalha | 100; 80 | 456.20 | Solicitado | 02/11/2025 | | | 12/11/2025 | Aguardando |

**TOTAIS ESPERADOS (excluindo cancelados):**
- **Total de Pedidos:** 11 (12 - 1 cancelado)
- **Valor Total:** R$ 3.526,80
- **Ticket Médio:** R$ 320,62
- **Papelaria:** 5 pedidos (R$ 1.876,60)
- **Limpeza:** 6 pedidos (R$ 1.650,20)
- **Por Status:**
  - Finalizados: 4
  - Em Compra: 3
  - Solicitados: 3
  - Aguardando Entrega: 1
  - Cancelados: 1

---

## 📦 ABA PRODUTOS (13 colunas: A-M)

Se necessário, adicione mais produtos:

| ID | Código | Nome | Tipo | Categoria | Unidade | Preço Unit. | Estoque Mín. | Ponto Pedido | Fornecedor | ImagemURL | Ativo | Data Cadastro |
|----|--------|------|------|-----------|---------|-------------|--------------|--------------|------------|-----------|-------|---------------|
| PROD-021 | CAN-001 | Caneta Azul | Papelaria | Escrita | UN | 2.50 | 50 | 100 | Papelaria ABC | | Sim | 01/01/2025 |
| PROD-022 | CAD-001 | Caderno | Papelaria | Escrita | UN | 12.50 | 10 | 20 | Papelaria ABC | | Sim | 01/01/2025 |
| PROD-023 | DET-001 | Detergente | Limpeza | Limpeza | UN | 4.50 | 30 | 50 | Limpeza XYZ | | Sim | 01/01/2025 |
| PROD-024 | ALC-001 | Álcool | Limpeza | Limpeza | UN | 8.90 | 20 | 40 | Limpeza XYZ | | Sim | 01/01/2025 |
| PROD-025 | PAP-001 | Papel A4 | Papelaria | Papel | CX | 35.00 | 20 | 40 | Papelaria ABC | | Sim | 01/01/2025 |

---

## 📊 ABA ESTOQUE (8 colunas: A-H)

Adicione registros de estoque para os produtos:

| ID | Produto ID | Produto Nome | Qtd Atual | Qtd Reservada | Estoque Disponível | Última Atualização | Responsável |
|----|------------|--------------|-----------|---------------|-------------------|-------------------|-------------|
| EST-001 | PROD-021 | Caneta Azul | 150 | 20 | 130 | 01/11/2025 | admin@neoformula.com |
| EST-002 | PROD-022 | Caderno | 8 | 0 | 8 | 01/11/2025 | admin@neoformula.com |
| EST-003 | PROD-023 | Detergente | 45 | 10 | 35 | 01/11/2025 | admin@neoformula.com |
| EST-004 | PROD-024 | Álcool | 15 | 5 | 10 | 01/11/2025 | admin@neoformula.com |
| EST-005 | PROD-025 | Papel A4 | 60 | 15 | 45 | 01/11/2025 | admin@neoformula.com |

**ALERTAS ESPERADOS:**
- **Estoque Baixo:** Caderno (8 < 10), Álcool (15 < 20)
- **Ponto de Pedido:** Nenhum ainda

---

## 📋 ABA MOVIMENTAÇÕES (11 colunas: A-K)

Adicione algumas movimentações:

| ID | Data/Hora | Tipo | Produto ID | Produto Nome | Quantidade | Estoque Anterior | Estoque Atual | Responsável | Observações | Pedido ID |
|----|-----------|------|------------|--------------|------------|------------------|---------------|-------------|-------------|-----------|
| MOV-001 | 01/10/2025 10:00 | ENTRADA | PROD-021 | Caneta Azul | 200 | 0 | 200 | admin@neoformula.com | Entrada inicial | |
| MOV-002 | 05/10/2025 14:30 | SAIDA | PROD-021 | Caneta Azul | 50 | 200 | 150 | admin@neoformula.com | Baixa pedido PED-001 | PED-001 |
| MOV-003 | 08/10/2025 11:00 | SAIDA | PROD-023 | Detergente | 20 | 65 | 45 | admin@neoformula.com | Baixa pedido PED-002 | PED-002 |

---

## ✅ CHECKLIST DE VERIFICAÇÃO DOS KPIs

### **Dashboard Resumo:**
- [ ] **Total de Pedidos:** Deve mostrar 11 (excluindo cancelado)
- [ ] **Valor Total:** Deve mostrar R$ 3.526,80
- [ ] **Ticket Médio:** Deve mostrar R$ 320,62
- [ ] **Solicitados:** Deve mostrar 3
- [ ] **Em Compra:** Deve mostrar 3
- [ ] **Finalizados:** Deve mostrar 4
- [ ] **Cancelados:** Deve mostrar 1
- [ ] **Taxa de Finalização:** Deve calcular % de finalizados
- [ ] **Taxa de Cancelamento:** Deve calcular % de cancelados
- [ ] **Produtos Cadastrados:** Deve mostrar 25 (20 originais + 5 novos)
- [ ] **Estoque Baixo:** Deve mostrar 2 (Caderno, Álcool)
- [ ] **Ponto de Pedido:** Deve mostrar 0
- [ ] **Valor Total Estoque:** Deve calcular corretamente
- [ ] **Papelaria:** Deve mostrar 5 pedidos (R$ 1.876,60)
- [ ] **Limpeza:** Deve mostrar 6 pedidos (R$ 1.650,20)

### **Dashboard Financeiro:**
- [ ] **Valor Total:** R$ 3.526,80
- [ ] **Ticket Médio:** R$ 320,62
- [ ] **Gasto por Tipo:** Papelaria vs Limpeza com gráfico
- [ ] **Top 10 Gastos por Setor:** Ranking com progress bars
- [ ] **Top 10 Produtos Mais Caros:** Ranking com valores
- [ ] **Taxa de Variação:** Calcular variação mensal
- [ ] **Previsão de Gastos:** Baseado em média + 10%
- [ ] **Custo per Capita:** Total / número de usuários ativos

### **Dashboard Logístico:**
- [ ] **Tempo Médio de Aprovação:** Calcular dias entre solicitação e compra
- [ ] **Lead Time Médio:** Calcular dias entre solicitação e finalização
- [ ] **Taxa de Pedidos no Prazo:** % de pedidos entregues antes do prazo
- [ ] **Taxa de Cancelamento:** 1/12 = 8,33%
- [ ] **Pedidos por Status:** Gráfico com distribuição
- [ ] **Solicitantes Mais Ativos:** Top 10 com progress bars
- [ ] **Backlog:** Solicitados + Em Análise
- [ ] **Pedidos Urgentes:** Identificar por prazo < 7 dias
- [ ] **Eficiência de Processamento:** Pedidos finalizados / 30 dias

### **Dashboard Estoque:**
- [ ] **Valor Total Estoque:** Calcular soma (qtd * preço)
- [ ] **Produtos com Estoque Baixo:** 2 produtos
- [ ] **Taxa de Ruptura:** % de produtos sem estoque
- [ ] **Giro de Estoque:** Calcular rotatividade
- [ ] **Cobertura de Estoque:** Dias de cobertura
- [ ] **Produtos Inativos:** Produtos com "Ativo = Não"
- [ ] **Top 10 Produtos Mais Solicitados:** Ranking
- [ ] **Previsão de Reposição:** Produtos próximos ao ponto de pedido
- [ ] **Acurácia de Estoque:** % de precisão dos registros
- [ ] **Idade Média do Estoque:** Tempo médio em estoque
- [ ] **Custo de Armazenagem:** Estimativa baseada no valor

---

## 🎯 COMO ADICIONAR OS DADOS

1. **Abra a planilha Google Sheets**
2. **Vá para a aba "Pedidos"**
3. **Cole os dados da tabela acima** (use Ctrl+C, Ctrl+V)
4. **Vá para a aba "Produtos"** (se necessário)
5. **Cole os novos produtos**
6. **Vá para a aba "Estoque"**
7. **Cole os registros de estoque**
8. **Vá para a aba "Movimentações"**
9. **Cole as movimentações**
10. **Faça clasp push** para atualizar o código
11. **Abra o aplicativo** e verifique o dashboard
12. **Compare os valores** com os totais esperados acima

---

## 📝 NOTAS IMPORTANTES

- **Formato de Data:** Use dd/mm/aaaa (ex: 01/10/2025)
- **Produtos JSON:** Use ponto-e-vírgula como separador (ex: "Caneta; Caderno")
- **Quantidades JSON:** Use ponto-e-vírgula (ex: "50; 10")
- **Valores:** Use vírgula para decimais (ex: 125,50)
- **Status válidos:** Solicitado, Em Análise, Aprovado, Em Compra, Aguardando Entrega, Finalizado, Cancelado

---

**✅ Após adicionar esses dados, todos os KPIs do dashboard deverão funcionar corretamente!**
