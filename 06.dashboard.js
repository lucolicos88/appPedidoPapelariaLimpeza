/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v6.0
 * Módulo: Dashboard e KPIs Avançados
 * ========================================
 * 
 * NOVIDADES v6.0:
 * - Mais KPIs e métricas
 * - Filtros avançados (tipo, data, solicitante, status, setor)
 * - Gráficos otimizados
 * - Comparativos de períodos
 * - Análise de tendências
 */

/**
 * Calcula KPIs do dashboard v6.0
 */
function getDashboardData(filtros) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    const abaMovimentacoes = ss.getSheetByName(CONFIG.ABAS.STOCK_MOVEMENTS);
    
    if (!abaPedidos || !abaProdutos) {
      return { success: false, error: 'Abas não encontradas' };
    }
    
    const dadosPedidos = abaPedidos.getDataRange().getValues();
    const dadosProdutos = abaProdutos.getDataRange().getValues();
    const dadosEstoque = abaEstoque ? abaEstoque.getDataRange().getValues() : [];
    const dadosMovimentacoes = abaMovimentacoes ? abaMovimentacoes.getDataRange().getValues() : [];
    
    // Aplicar filtros aos pedidos
    const pedidosFiltrados = [];
    for (let i = 1; i < dadosPedidos.length; i++) {
      if (!dadosPedidos[i][0]) continue;
      
      let incluir = true;
      
      // Filtro por tipo
      if (filtros && filtros.tipo && dadosPedidos[i][2] !== filtros.tipo) {
        incluir = false;
      }
      
      // Filtro por status
      if (filtros && filtros.status && dadosPedidos[i][9] !== filtros.status) {
        incluir = false;
      }
      
      // Filtro por solicitante
      if (filtros && filtros.solicitante && dadosPedidos[i][3] !== filtros.solicitante) {
        incluir = false;
      }
      
      // Filtro por setor
      if (filtros && filtros.setor && dadosPedidos[i][5] !== filtros.setor) {
        incluir = false;
      }
      
      // Filtro por data
      if (filtros && filtros.dataInicio) {
        const dataInicio = new Date(filtros.dataInicio);
        const dataPedido = new Date(dadosPedidos[i][10]);
        if (dataPedido < dataInicio) {
          incluir = false;
        }
      }
      
      if (filtros && filtros.dataFim) {
        const dataFim = new Date(filtros.dataFim);
        const dataPedido = new Date(dadosPedidos[i][10]);
        if (dataPedido > dataFim) {
          incluir = false;
        }
      }
      
      if (incluir) {
        pedidosFiltrados.push(dadosPedidos[i]);
      }
    }
    
    // KPIs Básicos
    const totalPedidos = pedidosFiltrados.length;
    let valorTotalPedidos = 0;
    let pedidosSolicitados = 0;
    let pedidosEmCompra = 0;
    let pedidosFinalizados = 0;
    let pedidosCancelados = 0;
    
    // KPIs por tipo
    let pedidosPapelaria = 0;
    let pedidosLimpeza = 0;
    let valorPapelaria = 0;
    let valorLimpeza = 0;
    
    // Análise temporal
    const pedidosPorMes = {};
    const valorPorMes = {};
    
    // Produtos mais solicitados
    const produtosCount = {};
    
    // Análise por setor
    const pedidosPorSetor = {};
    const valorPorSetor = {};
    
    // Processar pedidos
    pedidosFiltrados.forEach(pedido => {
      const valor = parseFloat(pedido[8]) || 0;
      const tipo = pedido[2];
      const status = pedido[9];
      const setor = pedido[5];
      const data = new Date(pedido[10]);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      
      // Valores totais
      valorTotalPedidos += valor;
      
      // Status
      if (status === CONFIG.STATUS_PEDIDO.SOLICITADO) pedidosSolicitados++;
      if (status === CONFIG.STATUS_PEDIDO.EM_COMPRA) pedidosEmCompra++;
      if (status === CONFIG.STATUS_PEDIDO.FINALIZADO) pedidosFinalizados++;
      if (status === CONFIG.STATUS_PEDIDO.CANCELADO) pedidosCancelados++;
      
      // Tipo
      if (tipo === 'Papelaria') {
        pedidosPapelaria++;
        valorPapelaria += valor;
      } else if (tipo === 'Limpeza') {
        pedidosLimpeza++;
        valorLimpeza += valor;
      }
      
      // Temporal
      if (!pedidosPorMes[mesAno]) {
        pedidosPorMes[mesAno] = 0;
        valorPorMes[mesAno] = 0;
      }
      pedidosPorMes[mesAno]++;
      valorPorMes[mesAno] += valor;
      
      // Setor
      if (!pedidosPorSetor[setor]) {
        pedidosPorSetor[setor] = 0;
        valorPorSetor[setor] = 0;
      }
      pedidosPorSetor[setor]++;
      valorPorSetor[setor] += valor;
      
      // Produtos
      const produtos = pedido[6].split('; ');
      const quantidades = pedido[7].split('; ');
      
      produtos.forEach((produto, idx) => {
        if (!produtosCount[produto]) {
          produtosCount[produto] = 0;
        }
        produtosCount[produto] += parseFloat(quantidades[idx]) || 0;
      });
    });
    
    // Produtos mais solicitados (top 10)
    const produtosMaisSolicitados = Object.entries(produtosCount)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
    
    // Setores mais ativos (top 5)
    const setoresMaisAtivos = Object.entries(pedidosPorSetor)
      .map(([setor, quantidade]) => ({ 
        setor, 
        quantidade,
        valor: valorPorSetor[setor] 
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
    
    // KPIs de Estoque
    let totalProdutos = 0;
    let produtosEstoqueBaixo = 0;
    let produtosPontoPedido = 0;
    let valorTotalEstoque = 0;
    
    for (let i = 1; i < dadosProdutos.length; i++) {
      if (!dadosProdutos[i][0]) continue;
      
      totalProdutos++;
      
      const produtoId = dadosProdutos[i][0];
      const estoqueMinimo = dadosProdutos[i][7] || 0;
      const pontoPedido = dadosProdutos[i][8] || 0;
      const precoUnitario = dadosProdutos[i][6] || 0;
      
      // Buscar estoque atual
      let qtdAtual = 0;
      for (let j = 1; j < dadosEstoque.length; j++) {
        if (dadosEstoque[j][1] === produtoId) {
          qtdAtual = dadosEstoque[j][3] || 0;
          break;
        }
      }
      
      valorTotalEstoque += qtdAtual * precoUnitario;
      
      if (qtdAtual <= estoqueMinimo && estoqueMinimo > 0) {
        produtosEstoqueBaixo++;
      }
      
      if (qtdAtual <= pontoPedido && pontoPedido > 0) {
        produtosPontoPedido++;
      }
    }
    
    // Movimentações recentes
    const movimentacoesRecentes = [];
    const limite = Math.min(dadosMovimentacoes.length, 11); // Últimas 10 movimentações
    
    for (let i = dadosMovimentacoes.length - 1; i >= 1 && movimentacoesRecentes.length < 10; i--) {
      if (!dadosMovimentacoes[i][0]) continue;
      
      movimentacoesRecentes.push({
        data: dadosMovimentacoes[i][1],
        tipo: dadosMovimentacoes[i][2],
        produto: dadosMovimentacoes[i][4],
        quantidade: dadosMovimentacoes[i][5]
      });
    }
    
    // Cálculos de médias
    const ticketMedio = totalPedidos > 0 ? valorTotalPedidos / totalPedidos : 0;
    const taxaFinalizacao = totalPedidos > 0 ? (pedidosFinalizados / totalPedidos) * 100 : 0;
    const taxaCancelamento = totalPedidos > 0 ? (pedidosCancelados / totalPedidos) * 100 : 0;
    
    // Comparação com período anterior (se houver filtro de data)
    let comparacao = null;
    if (filtros && filtros.dataInicio && filtros.dataFim) {
      const inicio = new Date(filtros.dataInicio);
      const fim = new Date(filtros.dataFim);
      const diasPeriodo = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
      
      // Período anterior
      const inicioAnterior = new Date(inicio);
      inicioAnterior.setDate(inicioAnterior.getDate() - diasPeriodo);
      const fimAnterior = new Date(inicio);
      
      // Buscar pedidos do período anterior
      let totalAnterior = 0;
      let valorAnterior = 0;
      
      for (let i = 1; i < dadosPedidos.length; i++) {
        if (!dadosPedidos[i][0]) continue;
        
        const dataPedido = new Date(dadosPedidos[i][10]);
        if (dataPedido >= inicioAnterior && dataPedido < fimAnterior) {
          totalAnterior++;
          valorAnterior += parseFloat(dadosPedidos[i][8]) || 0;
        }
      }
      
      comparacao = {
        totalAnterior: totalAnterior,
        valorAnterior: valorAnterior,
        variacaoTotal: totalAnterior > 0 ? ((totalPedidos - totalAnterior) / totalAnterior * 100) : 0,
        variacaoValor: valorAnterior > 0 ? ((valorTotalPedidos - valorAnterior) / valorAnterior * 100) : 0
      };
    }
    
    // Retornar dados
    return {
      success: true,
      kpis: {
        // KPIs Gerais
        totalPedidos: totalPedidos,
        valorTotalPedidos: valorTotalPedidos,
        ticketMedio: ticketMedio,
        
        // Status
        pedidosSolicitados: pedidosSolicitados,
        pedidosEmCompra: pedidosEmCompra,
        pedidosFinalizados: pedidosFinalizados,
        pedidosCancelados: pedidosCancelados,
        
        // Taxas
        taxaFinalizacao: taxaFinalizacao,
        taxaCancelamento: taxaCancelamento,
        
        // Por Tipo
        pedidosPapelaria: pedidosPapelaria,
        pedidosLimpeza: pedidosLimpeza,
        valorPapelaria: valorPapelaria,
        valorLimpeza: valorLimpeza,
        
        // Estoque
        totalProdutos: totalProdutos,
        produtosEstoqueBaixo: produtosEstoqueBaixo,
        produtosPontoPedido: produtosPontoPedido,
        valorTotalEstoque: valorTotalEstoque,
        
        // Análises
        produtosMaisSolicitados: produtosMaisSolicitados,
        setoresMaisAtivos: setoresMaisAtivos,
        pedidosPorMes: pedidosPorMes,
        valorPorMes: valorPorMes,
        movimentacoesRecentes: movimentacoesRecentes,
        
        // Comparação
        comparacao: comparacao
      }
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao obter dados do dashboard: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Gera dados para gráficos (NOVO v6.0)
 */
function getGraficosData(tipo, filtros) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
    
    if (!abaPedidos) {
      return { success: false, error: 'Aba de pedidos não encontrada' };
    }
    
    const dados = abaPedidos.getDataRange().getValues();
    let resultado = {};
    
    switch (tipo) {
      case 'pedidos_por_mes':
        resultado = gerarGraficoPedidosPorMes(dados, filtros);
        break;
        
      case 'valor_por_tipo':
        resultado = gerarGraficoValorPorTipo(dados, filtros);
        break;
        
      case 'status_pedidos':
        resultado = gerarGraficoStatusPedidos(dados, filtros);
        break;
        
      case 'pedidos_por_setor':
        resultado = gerarGraficoPedidosPorSetor(dados, filtros);
        break;
        
      default:
        return { success: false, error: 'Tipo de gráfico inválido' };
    }
    
    return {
      success: true,
      grafico: resultado
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao gerar dados do gráfico: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Gera dados para gráfico de pedidos por mês
 */
function gerarGraficoPedidosPorMes(dados, filtros) {
  const pedidosPorMes = {};
  
  for (let i = 1; i < dados.length; i++) {
    if (!dados[i][0]) continue;
    
    const data = new Date(dados[i][10]);
    const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    
    if (!pedidosPorMes[mesAno]) {
      pedidosPorMes[mesAno] = 0;
    }
    pedidosPorMes[mesAno]++;
  }
  
  // Ordenar por data
  const mesesOrdenados = Object.keys(pedidosPorMes).sort();
  
  return {
    labels: mesesOrdenados,
    valores: mesesOrdenados.map(mes => pedidosPorMes[mes])
  };
}

/**
 * Gera dados para gráfico de valor por tipo
 */
function gerarGraficoValorPorTipo(dados, filtros) {
  let valorPapelaria = 0;
  let valorLimpeza = 0;
  
  for (let i = 1; i < dados.length; i++) {
    if (!dados[i][0]) continue;
    
    const tipo = dados[i][2];
    const valor = parseFloat(dados[i][8]) || 0;
    
    if (tipo === 'Papelaria') {
      valorPapelaria += valor;
    } else if (tipo === 'Limpeza') {
      valorLimpeza += valor;
    }
  }
  
  return {
    labels: ['Papelaria', 'Limpeza'],
    valores: [valorPapelaria, valorLimpeza]
  };
}

/**
 * Gera dados para gráfico de status dos pedidos
 */
function gerarGraficoStatusPedidos(dados, filtros) {
  const statusCount = {
    'Solicitado': 0,
    'Em Compra': 0,
    'Finalizado': 0,
    'Cancelado': 0
  };
  
  for (let i = 1; i < dados.length; i++) {
    if (!dados[i][0]) continue;
    
    const status = dados[i][9];
    if (statusCount.hasOwnProperty(status)) {
      statusCount[status]++;
    }
  }
  
  return {
    labels: Object.keys(statusCount),
    valores: Object.values(statusCount)
  };
}

/**
 * Gera dados para gráfico de pedidos por setor
 */
function gerarGraficoPedidosPorSetor(dados, filtros) {
  const pedidosPorSetor = {};
  
  for (let i = 1; i < dados.length; i++) {
    if (!dados[i][0]) continue;
    
    const setor = dados[i][5] || 'Sem Setor';
    
    if (!pedidosPorSetor[setor]) {
      pedidosPorSetor[setor] = 0;
    }
    pedidosPorSetor[setor]++;
  }
  
  // Top 5 setores
  const setoresOrdenados = Object.entries(pedidosPorSetor)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  return {
    labels: setoresOrdenados.map(s => s[0]),
    valores: setoresOrdenados.map(s => s[1])
  };
}
