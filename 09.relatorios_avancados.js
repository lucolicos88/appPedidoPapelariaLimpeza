/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v8.0
 * Módulo: 07. RELATÓRIOS E INSIGHTS
 * ========================================
 *
 * Este módulo fornece 8 tipos diferentes de relatórios com análises profundas:
 * 1. Visão Geral
 * 2. Análise Financeira
 * 3. Análise Logística
 * 4. Análise de Estoque
 * 5. Análise de Produtos
 * 6. Análise de Usuários
 * 7. Tendências e Previsões
 * 8. Comparativo de Períodos
 */

/**
 * Formata valor monetário para CSV (v14.0.4)
 */
function formatarValorMonetario(valor) {
  if (!valor || valor === '' || isNaN(valor)) {
    return 'R$ 0,00';
  }
  const num = parseFloat(valor);
  return 'R$ ' + num.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Formata número para CSV (v14.0.4)
 */
function formatarNumero(valor) {
  if (!valor || valor === '' || isNaN(valor)) {
    return '0';
  }
  return String(Math.round(parseFloat(valor)));
}

/**
 * Exporta relatório em formato CSV (v14.0.4)
 */
function exportarRelatorioCSV(tipo, filtros) {
  try {
    Logger.log(`📥 Exportando relatório CSV: ${tipo}`);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let dados = [];
    let headers = [];
    let fileName = '';

    switch (tipo) {
      case 'pedidos':
        const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
        if (!abaPedidos) {
          return { success: false, error: 'Aba de pedidos não encontrada' };
        }

        headers = ['Número Pedido', 'Data Solicitação', 'Solicitante', 'Setor', 'Tipo', 'Valor Total', 'Status'];
        const dadosPedidos = abaPedidos.getDataRange().getValues();

        for (let i = 1; i < dadosPedidos.length; i++) {
          const valorTotal = dadosPedidos[i][CONFIG.COLUNAS_PEDIDOS.VALOR_TOTAL - 1];

          dados.push([
            String(dadosPedidos[i][CONFIG.COLUNAS_PEDIDOS.NUMERO_PEDIDO - 1] || ''),
            Utilities.formatDate(new Date(dadosPedidos[i][CONFIG.COLUNAS_PEDIDOS.DATA_SOLICITACAO - 1]), Session.getScriptTimeZone(), 'dd/MM/yyyy'),
            String(dadosPedidos[i][CONFIG.COLUNAS_PEDIDOS.SOLICITANTE_NOME - 1] || ''),
            String(dadosPedidos[i][CONFIG.COLUNAS_PEDIDOS.SETOR - 1] || ''),
            String(dadosPedidos[i][CONFIG.COLUNAS_PEDIDOS.TIPO - 1] || ''),
            formatarValorMonetario(valorTotal),
            String(dadosPedidos[i][CONFIG.COLUNAS_PEDIDOS.STATUS - 1] || '')
          ]);
        }

        fileName = `relatorio_pedidos_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd')}.csv`;
        break;

      case 'estoque':
        const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
        if (!abaEstoque) {
          return { success: false, error: 'Aba de estoque não encontrada' };
        }

        headers = ['Produto', 'Quantidade Atual', 'Quantidade Reservada', 'Estoque Disponível', 'Última Atualização', 'Responsável'];
        const dadosEstoque = abaEstoque.getDataRange().getValues();

        for (let i = 1; i < dadosEstoque.length; i++) {
          dados.push([
            String(dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.PRODUTO_NOME - 1] || ''),
            formatarNumero(dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_ATUAL - 1]),
            formatarNumero(dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.QUANTIDADE_RESERVADA - 1]),
            formatarNumero(dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.ESTOQUE_DISPONIVEL - 1]),
            Utilities.formatDate(new Date(dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.ULTIMA_ATUALIZACAO - 1]), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
            String(dadosEstoque[i][CONFIG.COLUNAS_ESTOQUE.RESPONSAVEL - 1] || '')
          ]);
        }

        fileName = `relatorio_estoque_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd')}.csv`;
        break;

      default:
        return { success: false, error: 'Tipo de relatório inválido' };
    }

    // Montar CSV com UTF-8 BOM e delimiter ponto-e-vírgula (v14.0.4)
    // BOM (\uFEFF) garante que Excel reconheça acentuação corretamente
    // Ponto-e-vírgula (;) é o padrão para CSV em português no Excel
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += headers.join(';') + '\n';

    dados.forEach(linha => {
      const linhaFormatada = linha.map(campo => {
        // Valores já vêm formatados corretamente, apenas escapar aspas duplas
        let valor = String(campo || '');
        valor = valor.replace(/"/g, '""'); // Escapar aspas duplas
        return `"${valor}"`;
      });
      csv += linhaFormatada.join(';') + '\n';
    });

    Logger.log(`✅ Relatório CSV gerado: ${dados.length} linhas`);

    return {
      success: true,
      csv: csv,
      fileName: fileName
    };

  } catch (error) {
    Logger.log('❌ Erro ao exportar relatório CSV: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Função principal que roteia para o relatório específico
 */
function getRelatorio(tipo, periodo) {
  try {
    Logger.log(`🔄 Gerando relatório: ${tipo}, período: ${periodo} dias`);

    switch (tipo) {
      case 'visao_geral':
        return getRelatorioVisaoGeral(periodo);
      case 'financeiro':
        return getRelatorioFinanceiro(periodo);
      case 'logistico':
        return getRelatorioLogistico(periodo);
      case 'estoque':
        return getRelatorioEstoque(periodo);
      case 'produtos':
        return getRelatorioProdutos(periodo);
      case 'usuarios':
        return getRelatorioUsuarios(periodo);
      case 'tendencias':
        return getRelatorioTendencias(periodo);
      case 'comparativo':
        return getRelatorioComparativo(periodo);
      default:
        throw new Error('Tipo de relatório inválido');
    }
  } catch (error) {
    Logger.log('❌ Erro ao gerar relatório: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 1. RELATÓRIO: VISÃO GERAL
 * Resumo consolidado de todos os KPIs principais
 */
function getRelatorioVisaoGeral(dias) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);

  // Buscar dados
  const pedidos = getPedidosFiltrados({ dataInicio: dataLimite });
  const produtos = getTodosProdutos();
  const estoque = getTodosEstoque();

  // Calcular KPIs principais
  const kpis = {
    totalPedidos: pedidos.length,
    valorTotal: pedidos.reduce((sum, p) => sum + (p.valorTotal || 0), 0),
    pedidosFinalizados: pedidos.filter(p => p.status === 'Finalizado').length,
    ticketMedio: 0,
    totalProdutos: produtos.length,
    valorEstoque: estoque.reduce((sum, e) => sum + (e.quantidade * (e.precoUnit || 0)), 0),
    produtosAlerta: estoque.filter(e => e.quantidade <= e.quantidadeMinima).length
  };

  kpis.ticketMedio = kpis.totalPedidos > 0 ? kpis.valorTotal / kpis.totalPedidos : 0;

  // Alertas e Recomendações
  const alertas = [];
  const recomendacoes = [];

  if (kpis.produtosAlerta > 0) {
    alertas.push({
      tipo: 'warning',
      titulo: 'Produtos Abaixo do Mínimo',
      mensagem: `${kpis.produtosAlerta} produto(s) precisam de reposição urgente`
    });
    recomendacoes.push('Realizar pedido de reposição imediatamente');
  }

  const taxaCancelamento = pedidos.filter(p => p.status === 'Cancelado').length / pedidos.length * 100;
  if (taxaCancelamento > 10) {
    alertas.push({
      tipo: 'danger',
      titulo: 'Alta Taxa de Cancelamento',
      mensagem: `${taxaCancelamento.toFixed(1)}% dos pedidos foram cancelados`
    });
    recomendacoes.push('Revisar processo de aprovação de pedidos');
  }

  // Gráficos
  const graficos = {
    pedidosPorStatus: gerarDadosGraficoPedidosPorStatus(pedidos),
    gastoPorTipo: gerarDadosGraficoGastoPorTipo(pedidos),
    evolucaoMensal: gerarDadosGraficoEvolucaoMensal(pedidos)
  };

  return {
    success: true,
    tipo: 'visao_geral',
    periodo: dias,
    kpis: kpis,
    alertas: alertas,
    recomendacoes: recomendacoes,
    graficos: graficos
  };
}

/**
 * 2. RELATÓRIO: ANÁLISE FINANCEIRA
 * Análise detalhada de gastos e oportunidades de economia
 */
function getRelatorioFinanceiro(dias) {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);

  const pedidos = getPedidosFiltrados({ dataInicio: dataLimite });

  // Análise por Tipo
  const gastoPorTipo = {
    Papelaria: 0,
    Limpeza: 0
  };

  pedidos.forEach(p => {
    gastoPorTipo[p.tipo] = (gastoPorTipo[p.tipo] || 0) + (p.valorTotal || 0);
  });

  // Análise por Setor
  const gastoPorSetor = {};
  pedidos.forEach(p => {
    const setor = p.departamento || 'Sem Departamento';
    gastoPorSetor[setor] = (gastoPorSetor[setor] || 0) + (p.valorTotal || 0);
  });

  const setoresArray = Object.keys(gastoPorSetor).map(setor => ({
    setor: setor,
    valor: gastoPorSetor[setor],
    percentual: 0
  })).sort((a, b) => b.valor - a.valor);

  const totalGeral = setoresArray.reduce((sum, s) => sum + s.valor, 0);
  setoresArray.forEach(s => {
    s.percentual = (s.valor / totalGeral * 100).toFixed(1);
  });

  // Top 10 Produtos Mais Caros
  const produtosCusto = {};
  pedidos.forEach(pedido => {
    if (pedido.produtos) {
      pedido.produtos.forEach(prod => {
        const key = prod.nome;
        if (!produtosCusto[key]) {
          produtosCusto[key] = { nome: prod.nome, valorTotal: 0, quantidade: 0 };
        }
        produtosCusto[key].valorTotal += prod.quantidade * prod.precoUnitario;
        produtosCusto[key].quantidade += prod.quantidade;
      });
    }
  });

  const produtosCustosos = Object.values(produtosCusto)
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, 10);

  // Evolução Mensal
  const evolucaoMensal = gerarEvolucaoMensal(pedidos);

  // Insights e Recomendações
  const insights = [];
  const recomendacoes = [];

  // Identificar tendências
  if (evolucaoMensal.length >= 2) {
    const ultimoMes = evolucaoMensal[evolucaoMensal.length - 1].valor;
    const penultimoMes = evolucaoMensal[evolucaoMensal.length - 2].valor;
    const variacao = ((ultimoMes - penultimoMes) / penultimoMes * 100).toFixed(1);

    if (Math.abs(variacao) > 20) {
      insights.push({
        tipo: variacao > 0 ? 'warning' : 'success',
        titulo: `Variação de ${Math.abs(variacao)}% no último mês`,
        mensagem: variacao > 0
          ? 'Gastos aumentaram significativamente'
          : 'Gastos reduziram significativamente'
      });
    }
  }

  // Oportunidades de Economia
  if (produtosCustosos.length > 0) {
    const top3 = produtosCustosos.slice(0, 3);
    recomendacoes.push(
      `Focar negociação nos 3 produtos mais caros: ${top3.map(p => p.nome).join(', ')}`
    );
  }

  return {
    success: true,
    tipo: 'financeiro',
    periodo: dias,
    gastoPorTipo: gastoPorTipo,
    gastoPorSetor: setoresArray,
    produtosMaisCaros: produtosCustosos,
    evolucaoMensal: evolucaoMensal,
    insights: insights,
    recomendacoes: recomendacoes
  };
}

/**
 * 3. RELATÓRIO: ANÁLISE LOGÍSTICA
 * Análise de tempos, eficiência e gargalos
 */
function getRelatorioLogistico(dias) {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);

  const pedidos = getPedidosFiltrados({ dataInicio: dataLimite });

  // Calcular tempos médios
  let temposAprovacao = [];
  let temposCompra = [];
  let temposTotal = [];

  pedidos.forEach(p => {
    if (p.dataAprovacao && p.dataSolicitacao) {
      const tempo = (p.dataAprovacao - p.dataSolicitacao) / (1000 * 60 * 60); // horas
      temposAprovacao.push(tempo);
    }

    if (p.dataFinalizacao && p.dataSolicitacao) {
      const tempo = (p.dataFinalizacao - p.dataSolicitacao) / (1000 * 60 * 60 * 24); // dias
      temposTotal.push(tempo);
    }
  });

  const tempoMedioAprovacao = temposAprovacao.length > 0
    ? temposAprovacao.reduce((a, b) => a + b, 0) / temposAprovacao.length
    : 0;

  const leadTimeTotal = temposTotal.length > 0
    ? temposTotal.reduce((a, b) => a + b, 0) / temposTotal.length
    : 0;

  // Taxas
  const totalPedidos = pedidos.length;
  const pedidosFinalizados = pedidos.filter(p => p.status === 'Finalizado').length;
  const pedidosCancelados = pedidos.filter(p => p.status === 'Cancelado').length;

  const taxaFinalizacao = totalPedidos > 0 ? (pedidosFinalizados / totalPedidos * 100) : 0;
  const taxaCancelamento = totalPedidos > 0 ? (pedidosCancelados / totalPedidos * 100) : 0;

  // Backlog
  const backlog = pedidos.filter(p =>
    ['Solicitado', 'Em Compra', 'Aguardando Entrega'].includes(p.status)
  ).length;

  // Solicitantes Mais Ativos
  const solicitantes = {};
  pedidos.forEach(p => {
    const nome = p.solicitante || 'Desconhecido';
    solicitantes[nome] = (solicitantes[nome] || 0) + 1;
  });

  const solicitantesArray = Object.keys(solicitantes).map(nome => ({
    nome: nome,
    quantidade: solicitantes[nome],
    percentual: (solicitantes[nome] / totalPedidos * 100).toFixed(1)
  })).sort((a, b) => b.quantidade - a.quantidade).slice(0, 10);

  // Gargalos Identificados
  const gargalos = [];
  if (tempoMedioAprovacao > 48) {
    gargalos.push({
      fase: 'Aprovação',
      tempoMedio: tempoMedioAprovacao.toFixed(1) + ' horas',
      criticidade: 'Alta',
      recomendacao: 'Definir SLA de aprovação e notificar gestores'
    });
  }

  if (backlog > totalPedidos * 0.3) {
    gargalos.push({
      fase: 'Processamento Geral',
      tempoMedio: '-',
      criticidade: 'Média',
      recomendacao: 'Backlog elevado - priorizar pedidos mais antigos'
    });
  }

  return {
    success: true,
    tipo: 'logistico',
    periodo: dias,
    tempoMedioAprovacao: tempoMedioAprovacao,
    leadTimeTotal: leadTimeTotal,
    taxaFinalizacao: taxaFinalizacao,
    taxaCancelamento: taxaCancelamento,
    backlog: backlog,
    solicitantesMaisAtivos: solicitantesArray,
    gargalos: gargalos
  };
}

/**
 * 4. RELATÓRIO: ANÁLISE DE ESTOQUE
 * Análise de giro, cobertura e saúde do estoque
 */
function getRelatorioEstoque(dias) {
  const estoque = getTodosEstoque();
  const produtos = getTodosProdutos();
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);

  // Movimentações do período
  const movimentacoes = getHistoricoMovimentacoes({ dataInicio: dataLimite });

  // Calcular Giro de Estoque por Produto
  const giroPorProduto = {};

  estoque.forEach(e => {
    const saidas = movimentacoes.filter(m =>
      m.tipo === 'SAIDA' && m.produtoNome === e.produtoNome
    );

    const totalSaidas = saidas.reduce((sum, m) => sum + m.quantidade, 0);
    const estoqueAtual = e.quantidade;
    const estoqueMinimo = e.quantidadeMinima || 10;

    const giro = estoqueAtual > 0
      ? (totalSaidas / estoqueAtual) * (365 / dias) // Anualizado
      : 0;

    giroPorProduto[e.produtoNome] = {
      produto: e.produtoNome,
      giro: giro,
      estoqueAtual: estoqueAtual,
      totalSaidas: totalSaidas,
      classificacao: giro > 6 ? 'Alto' : giro > 3 ? 'Médio' : 'Baixo'
    };
  });

  const girosArray = Object.values(giroPorProduto).sort((a, b) => b.giro - a.giro);

  // Produtos com Ruptura Frequente
  const rupturas = estoque.filter(e => e.quantidade === 0).map(e => ({
    produto: e.produtoNome,
    diasEmRuptura: 0 // Seria necessário histórico mais detalhado
  }));

  // Produtos Parados (sem movimentação)
  const produtosParados = estoque.filter(e => {
    const temMovimentacao = movimentacoes.some(m => m.produtoNome === e.produtoNome);
    return !temMovimentacao && e.quantidade > 0;
  }).map(e => ({
    produto: e.produtoNome,
    quantidade: e.quantidade,
    valorEstimado: e.quantidade * (e.precoUnitario || 0)
  }));

  // Previsão de Reposição (próximos 30 dias)
  const previsaoReposicao = estoque.filter(e => {
    const saidas = movimentacoes.filter(m =>
      m.tipo === 'SAIDA' && m.produtoNome === e.produtoNome
    );

    if (saidas.length === 0) return false;

    const totalSaidas = saidas.reduce((sum, m) => sum + m.quantidade, 0);
    const mediaDiaria = totalSaidas / dias;
    const diasParaRuptura = e.quantidade / mediaDiaria;

    return diasParaRuptura <= 30;
  }).map(e => {
    const saidas = movimentacoes.filter(m =>
      m.tipo === 'SAIDA' && m.produtoNome === e.produtoNome
    );
    const totalSaidas = saidas.reduce((sum, m) => sum + m.quantidade, 0);
    const mediaDiaria = totalSaidas / dias;
    const diasParaRuptura = Math.floor(e.quantidade / mediaDiaria);

    return {
      produto: e.produtoNome,
      estoqueAtual: e.quantidade,
      diasParaRuptura: diasParaRuptura,
      quantidadeSugerida: Math.ceil(mediaDiaria * 30) // 30 dias de cobertura
    };
  }).sort((a, b) => a.diasParaRuptura - b.diasParaRuptura);

  return {
    success: true,
    tipo: 'estoque',
    periodo: dias,
    giroPorProduto: girosArray,
    produtosComRuptura: rupturas,
    produtosParados: produtosParados,
    previsaoReposicao: previsaoReposicao,
    totalProdutos: estoque.length,
    valorTotalEstoque: estoque.reduce((sum, e) => sum + (e.quantidade * (e.precoUnitario || 0)), 0)
  };
}

/**
 * 5. RELATÓRIO: ANÁLISE DE PRODUTOS
 * Produtos mais solicitados, nunca solicitados, correlações
 */
function getRelatorioProdutos(dias) {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);

  const pedidos = getPedidosFiltrados({ dataInicio: dataLimite });
  const todosProdutos = getTodosProdutos();

  // Produtos Mais Solicitados
  const produtosSolicitados = {};

  pedidos.forEach(pedido => {
    if (pedido.produtos) {
      pedido.produtos.forEach(prod => {
        const key = prod.nome;
        if (!produtosSolicitados[key]) {
          produtosSolicitados[key] = {
            nome: prod.nome,
            quantidade: 0,
            frequencia: 0,
            valorTotal: 0
          };
        }
        produtosSolicitados[key].quantidade += prod.quantidade;
        produtosSolicitados[key].frequencia += 1;
        produtosSolicitados[key].valorTotal += prod.quantidade * prod.precoUnitario;
      });
    }
  });

  const produtosMaisSolicitados = Object.values(produtosSolicitados)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 20);

  // Produtos Nunca Solicitados
  const produtosNuncaSolicitados = todosProdutos.filter(prod => {
    return !produtosMaisSolicitados.some(ps => ps.nome === prod.nome);
  }).map(p => ({
    codigo: p.codigo,
    nome: p.nome,
    tipo: p.tipo
  }));

  // Valor Médio por Produto
  produtosMaisSolicitados.forEach(p => {
    p.valorMedio = p.valorTotal / p.quantidade;
  });

  return {
    success: true,
    tipo: 'produtos',
    periodo: dias,
    produtosMaisSolicitados: produtosMaisSolicitados,
    produtosNuncaSolicitados: produtosNuncaSolicitados
  };
}

/**
 * 6. RELATÓRIO: ANÁLISE DE USUÁRIOS
 * Solicitações por usuário, padrões, gastos por departamento
 */
function getRelatorioUsuarios(dias) {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);

  const pedidos = getPedidosFiltrados({ dataInicio: dataLimite });

  // Análise por Usuário
  const usuarios = {};

  pedidos.forEach(p => {
    const usuario = p.solicitante || 'Desconhecido';
    if (!usuarios[usuario]) {
      usuarios[usuario] = {
        nome: usuario,
        quantidadePedidos: 0,
        valorTotal: 0,
        pedidosFinalizados: 0,
        pedidosCancelados: 0
      };
    }

    usuarios[usuario].quantidadePedidos += 1;
    usuarios[usuario].valorTotal += p.valorTotal || 0;
    if (p.status === 'Finalizado') usuarios[usuario].pedidosFinalizados += 1;
    if (p.status === 'Cancelado') usuarios[usuario].pedidosCancelados += 1;
  });

  const usuariosArray = Object.values(usuarios)
    .sort((a, b) => b.quantidadePedidos - a.quantidadePedidos);

  // Usuários Mais Ativos
  const usuariosMaisAtivos = usuariosArray.slice(0, 10);

  // Usuários Inativos (sem pedidos no período)
  // Precisaria carregar todos os usuários cadastrados para comparar

  return {
    success: true,
    tipo: 'usuarios',
    periodo: dias,
    usuariosMaisAtivos: usuariosMaisAtivos,
    totalUsuariosAtivos: usuariosArray.length
  };
}

/**
 * 7. RELATÓRIO: TENDÊNCIAS E PREVISÕES
 * Previsão de gastos, produtos que precisarão reposição, alertas preventivos
 */
function getRelatorioTendencias(dias) {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);

  const pedidos = getPedidosFiltrados({ dataInicio: dataLimite });

  // Previsão de Gastos (próximos 3 meses)
  const gastoPorMes = {};
  pedidos.forEach(p => {
    if (p.dataSolicitacao) {
      const mes = `${p.dataSolicitacao.getFullYear()}-${String(p.dataSolicitacao.getMonth() + 1).padStart(2, '0')}`;
      gastoPorMes[mes] = (gastoPorMes[mes] || 0) + (p.valorTotal || 0);
    }
  });

  const mesesArray = Object.keys(gastoPorMes).sort();
  const valores = mesesArray.map(m => gastoPorMes[m]);

  // Regressão linear simples para previsão
  const mediaGastos = valores.length > 0
    ? valores.reduce((a, b) => a + b, 0) / valores.length
    : 0;

  const previsaoProximos3Meses = [
    { mes: 'Próximo mês', valorPrevistoMin: mediaGastos * 0.9, valorPrevistoMax: mediaGastos * 1.1 },
    { mes: 'Mês +2', valorPrevistoMin: mediaGastos * 0.85, valorPrevistoMax: mediaGastos * 1.15 },
    { mes: 'Mês +3', valorPrevistoMin: mediaGastos * 0.8, valorPrevistoMax: mediaGastos * 1.2 }
  ];

  return {
    success: true,
    tipo: 'tendencias',
    periodo: dias,
    previsaoGastos: previsaoProximos3Meses,
    gastoPorMes: gastoPorMes
  };
}

/**
 * 8. RELATÓRIO: COMPARATIVO DE PERÍODOS
 * Comparação mês a mês, identificação de variações
 */
function getRelatorioComparativo(dias) {
  // Período atual
  const dataLimiteAtual = new Date();
  const dataInicioAtual = new Date();
  dataInicioAtual.setDate(dataInicioAtual.getDate() - dias);

  // Período anterior
  const dataLimiteAnterior = new Date(dataInicioAtual);
  const dataInicioAnterior = new Date(dataInicioAtual);
  dataInicioAnterior.setDate(dataInicioAnterior.getDate() - dias);

  const pedidosAtual = getPedidosFiltrados({
    dataInicio: dataInicioAtual,
    dataFim: dataLimiteAtual
  });

  const pedidosAnterior = getPedidosFiltrados({
    dataInicio: dataInicioAnterior,
    dataFim: dataLimiteAnterior
  });

  // Comparar métricas
  const metricas = {
    totalPedidos: {
      atual: pedidosAtual.length,
      anterior: pedidosAnterior.length,
      variacao: 0
    },
    valorTotal: {
      atual: pedidosAtual.reduce((sum, p) => sum + (p.valorTotal || 0), 0),
      anterior: pedidosAnterior.reduce((sum, p) => sum + (p.valorTotal || 0), 0),
      variacao: 0
    },
    ticketMedio: {
      atual: 0,
      anterior: 0,
      variacao: 0
    }
  };

  metricas.ticketMedio.atual = metricas.totalPedidos.atual > 0
    ? metricas.valorTotal.atual / metricas.totalPedidos.atual
    : 0;

  metricas.ticketMedio.anterior = metricas.totalPedidos.anterior > 0
    ? metricas.valorTotal.anterior / metricas.totalPedidos.anterior
    : 0;

  // Calcular variações
  Object.keys(metricas).forEach(key => {
    const anterior = metricas[key].anterior;
    if (anterior > 0) {
      metricas[key].variacao = ((metricas[key].atual - anterior) / anterior * 100).toFixed(1);
    }
  });

  return {
    success: true,
    tipo: 'comparativo',
    periodo: dias,
    periodoAtual: { inicio: dataInicioAtual, fim: dataLimiteAtual },
    periodoAnterior: { inicio: dataInicioAnterior, fim: dataLimiteAnterior },
    comparacao: metricas
  };
}

/**
 * ========================================
 * FUNÇÕES AUXILIARES
 * ========================================
 */

function gerarDadosGraficoPedidosPorStatus(pedidos) {
  const statusCount = {};
  pedidos.forEach(p => {
    statusCount[p.status] = (statusCount[p.status] || 0) + 1;
  });

  return {
    labels: Object.keys(statusCount),
    data: Object.values(statusCount)
  };
}

function gerarDadosGraficoGastoPorTipo(pedidos) {
  const gastos = { Papelaria: 0, Limpeza: 0 };
  pedidos.forEach(p => {
    gastos[p.tipo] = (gastos[p.tipo] || 0) + (p.valorTotal || 0);
  });

  return {
    labels: Object.keys(gastos),
    data: Object.values(gastos)
  };
}

function gerarDadosGraficoEvolucaoMensal(pedidos) {
  const gastoPorMes = {};

  pedidos.forEach(p => {
    if (p.dataSolicitacao) {
      const mes = `${p.dataSolicitacao.getFullYear()}-${String(p.dataSolicitacao.getMonth() + 1).padStart(2, '0')}`;
      gastoPorMes[mes] = (gastoPorMes[mes] || 0) + (p.valorTotal || 0);
    }
  });

  const mesesOrdenados = Object.keys(gastoPorMes).sort();

  return {
    labels: mesesOrdenados,
    data: mesesOrdenados.map(m => gastoPorMes[m])
  };
}

function gerarEvolucaoMensal(pedidos) {
  const gastoPorMes = {};

  pedidos.forEach(p => {
    if (p.dataSolicitacao) {
      const mes = `${p.dataSolicitacao.getFullYear()}-${String(p.dataSolicitacao.getMonth() + 1).padStart(2, '0')}`;
      gastoPorMes[mes] = (gastoPorMes[mes] || 0) + (p.valorTotal || 0);
    }
  });

  return Object.keys(gastoPorMes).sort().map(mes => ({
    mes: mes,
    valor: gastoPorMes[mes]
  }));
}

/**
 * Busca pedidos com filtros opcionais
 */
function getPedidosFiltrados(filtros) {
  // Esta função já deve existir em 02.pedidos.js
  // Caso não exista, implementar aqui
  return getAllPedidos(filtros);
}
