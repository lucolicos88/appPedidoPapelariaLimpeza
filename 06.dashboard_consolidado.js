/**
 * ========================================
 * DASHBOARD AVANÇADO v7.0
 * ========================================
 *
 * KPIs completos divididos em:
 * - Financeiros (10 KPIs)
 * - Logísticos (10 KPIs)
 * - Estoque (12 KPIs)
 *
 * Total: 32+ KPIs
 */

/**
 * Obtém todos os KPIs avançados do sistema
 */
function getDashboardAvancado(filtros) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaPedidos = ss.getSheetByName(CONFIG.ABAS.ORDERS);
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const abaEstoque = ss.getSheetByName(CONFIG.ABAS.STOCK);
    const abaMovimentacoes = ss.getSheetByName(CONFIG.ABAS.STOCK_MOVEMENTS);
    const abaUsuarios = ss.getSheetByName(CONFIG.ABAS.USERS);

    if (!abaPedidos || !abaProdutos) {
      return { success: false, error: 'Abas não encontradas' };
    }

    // Carregar dados
    const lastRowPedidos = abaPedidos.getLastRow();
    const lastRowProdutos = abaProdutos.getLastRow();
    const lastRowEstoque = abaEstoque ? abaEstoque.getLastRow() : 0;
    const lastRowMovimentacoes = abaMovimentacoes ? abaMovimentacoes.getLastRow() : 0;
    const lastRowUsuarios = abaUsuarios ? abaUsuarios.getLastRow() : 0;

    const dadosPedidos = lastRowPedidos > 1 ? abaPedidos.getRange(2, 1, lastRowPedidos - 1, 15).getValues() : [];
    const dadosProdutos = lastRowProdutos > 1 ? abaProdutos.getRange(2, 1, lastRowProdutos - 1, 13).getValues() : [];
    const dadosEstoque = (abaEstoque && lastRowEstoque > 1) ? abaEstoque.getRange(2, 1, lastRowEstoque - 1, 8).getValues() : [];
    const dadosMovimentacoes = (abaMovimentacoes && lastRowMovimentacoes > 1) ? abaMovimentacoes.getRange(2, 1, lastRowMovimentacoes - 1, 10).getValues() : [];
    const dadosUsuarios = (abaUsuarios && lastRowUsuarios > 1) ? abaUsuarios.getRange(2, 1, lastRowUsuarios - 1, 5).getValues() : [];

    // 🐛 DEBUG: Log dados carregados
    Logger.log('📊 getDashboardAvancado - Dados carregados da planilha:');
    Logger.log('   Pedidos: ' + dadosPedidos.length);
    Logger.log('   Produtos: ' + dadosProdutos.length);
    Logger.log('   Estoque: ' + dadosEstoque.length);
    Logger.log('🔍 Filtros recebidos no getDashboardAvancado: ' + JSON.stringify(filtros));

    // Aplicar filtros
    const pedidosFiltrados = aplicarFiltrosPedidos(dadosPedidos, filtros);

    // Calcular KPIs
    const kpisFinanceiros = calcularKPIsFinanceiros(pedidosFiltrados, dadosProdutos, dadosUsuarios);
    const kpisLogisticos = calcularKPIsLogisticos(pedidosFiltrados);
    const kpisEstoque = calcularKPIsEstoque(dadosProdutos, dadosEstoque, dadosMovimentacoes, pedidosFiltrados);

    return {
      success: true,
      kpis: {
        financeiros: kpisFinanceiros,
        logisticos: kpisLogisticos,
        estoque: kpisEstoque
      }
    };

  } catch (error) {
    Logger.log('❌ Erro ao obter dashboard avançado: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Aplica filtros aos pedidos
 */
function aplicarFiltrosPedidos(dadosPedidos, filtros) {
  // 🐛 DEBUG: Log dos filtros recebidos
  Logger.log('🔍 aplicarFiltrosPedidos - Total de pedidos recebidos: ' + dadosPedidos.length);
  Logger.log('🔍 Filtros recebidos: ' + JSON.stringify(filtros));

  const pedidosFiltrados = [];

  for (let i = 0; i < dadosPedidos.length; i++) {
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

    // Filtro por setor
    if (filtros && filtros.setor && dadosPedidos[i][5] !== filtros.setor) {
      incluir = false;
    }

    // Filtro por data
    if (filtros && filtros.dataInicio) {
      try {
        const dataInicio = new Date(filtros.dataInicio);
        const dataPedido = new Date(dadosPedidos[i][10]);
        if (!isNaN(dataInicio.getTime()) && !isNaN(dataPedido.getTime()) && dataPedido < dataInicio) {
          incluir = false;
        }
      } catch (e) {
        Logger.log('⚠️ Erro ao processar data de início: ' + e.message);
      }
    }

    if (filtros && filtros.dataFim) {
      try {
        const dataFim = new Date(filtros.dataFim);
        const dataPedido = new Date(dadosPedidos[i][10]);
        if (!isNaN(dataFim.getTime()) && !isNaN(dataPedido.getTime()) && dataPedido > dataFim) {
          incluir = false;
        }
      } catch (e) {
        Logger.log('⚠️ Erro ao processar data de fim: ' + e.message);
      }
    }

    if (incluir) {
      pedidosFiltrados.push(dadosPedidos[i]);
    }
  }

  // 🐛 DEBUG: Log dos pedidos filtrados
  Logger.log('🔍 Total de pedidos após filtros: ' + pedidosFiltrados.length);

  return pedidosFiltrados;
}

/**
 * 💰 KPIs FINANCEIROS (10 KPIs)
 */
function calcularKPIsFinanceiros(pedidosFiltrados, dadosProdutos, dadosUsuarios) {
  let valorTotal = 0;
  let valorPapelaria = 0;
  let valorLimpeza = 0;
  const gastoPorSetor = {};
  const gastoPorProduto = {};
  const valoresPorMes = [];

  // 🐛 DEBUG: Log inicial
  Logger.log('💰 calcularKPIsFinanceiros - Pedidos recebidos: ' + pedidosFiltrados.length);

  // Processar pedidos
  pedidosFiltrados.forEach(pedido => {
    const valor = parseFloat(pedido[8]) || 0;
    const tipo = pedido[2];
    const setor = pedido[5];
    const status = pedido[9];
    const data = new Date(pedido[10]);
    const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

    // 🐛 DEBUG: Log de cada pedido
    Logger.log(`   Pedido: status="${status}", valor=${valor}, tipo="${tipo}"`);

    // Ignorar cancelados
    if (status !== CONFIG.STATUS_PEDIDO.CANCELADO) {
      valorTotal += valor;

      // Por tipo
      if (tipo === 'Papelaria') {
        valorPapelaria += valor;
      } else if (tipo === 'Limpeza') {
        valorLimpeza += valor;
      }

      // Por setor
      if (!gastoPorSetor[setor]) {
        gastoPorSetor[setor] = 0;
      }
      gastoPorSetor[setor] += valor;

      // Por produto
      const produtos = pedido[6].split('; ');
      const quantidades = pedido[7].split('; ');
      produtos.forEach((produto, idx) => {
        if (!gastoPorProduto[produto]) {
          gastoPorProduto[produto] = 0;
        }
        const qtd = parseFloat(quantidades[idx]) || 0;
        // Estimativa de valor por produto (valor total / num produtos)
        gastoPorProduto[produto] += valor / produtos.length;
      });

      // Por mês
      valoresPorMes.push({ mes: mesAno, valor: valor });
    }
  });

  // 1. Valor Total de Pedidos
  const totalPedidos = pedidosFiltrados.filter(p => p[9] !== CONFIG.STATUS_PEDIDO.CANCELADO).length;

  // 🐛 DEBUG: Log de totais calculados
  Logger.log('💰 TOTAIS CALCULADOS:');
  Logger.log('   totalPedidos (não cancelados): ' + totalPedidos);
  Logger.log('   valorTotal: R$ ' + valorTotal.toFixed(2));

  // 2. Ticket Médio
  const ticketMedio = totalPedidos > 0 ? valorTotal / totalPedidos : 0;
  Logger.log('   ticketMedio: R$ ' + ticketMedio.toFixed(2));

  // 3. Gasto por Tipo
  const gastoPorTipo = [
    { tipo: 'Papelaria', valor: valorPapelaria },
    { tipo: 'Limpeza', valor: valorLimpeza }
  ];

  // 4. Gasto por Setor (Top 10)
  const gastoPorSetorArray = Object.entries(gastoPorSetor)
    .map(([setor, valor]) => ({ setor, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10);

  // 5. Taxa de Variação de Gastos (últimos 3 meses)
  const valoresMensais = agruparPorMes(valoresPorMes);
  const mesesOrdenados = Object.keys(valoresMensais).sort();
  let taxaVariacao = 0;
  if (mesesOrdenados.length >= 2) {
    const mesAtual = valoresMensais[mesesOrdenados[mesesOrdenados.length - 1]];
    const mesAnterior = valoresMensais[mesesOrdenados[mesesOrdenados.length - 2]];
    taxaVariacao = mesAnterior > 0 ? ((mesAtual - mesAnterior) / mesAnterior) * 100 : 0;
  }

  // 6. Custo Médio por Produto
  const custoMedioProdutos = dadosProdutos.map(p => ({
    nome: p[1],
    custoMedio: parseFloat(p[6]) || 0
  })).filter(p => p.custoMedio > 0);

  // 7. Top 10 Produtos Mais Caros
  const produtosMaisCaros = Object.entries(gastoPorProduto)
    .map(([produto, valor]) => ({ produto, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 10);

  // 8. Previsão de Gastos (média últimos 3 meses * 1.1)
  const ultimos3Meses = mesesOrdenados.slice(-3);
  const mediaUltimos3 = ultimos3Meses.length > 0
    ? ultimos3Meses.reduce((sum, mes) => sum + valoresMensais[mes], 0) / ultimos3Meses.length
    : 0;
  const previsaoGastos = mediaUltimos3 * 1.1;

  // 9. Taxa de Economia (placeholder - requer histórico de preços)
  const taxaEconomia = 0; // Implementar com histórico

  // 10. Custo per Capita
  const usuariosAtivos = dadosUsuarios.filter(u => u[4] === 'Ativo').length;
  const custoPerCapita = usuariosAtivos > 0 ? valorTotal / usuariosAtivos : 0;

  return {
    totalPedidos: totalPedidos, // ✅ ADICIONADO: Total de pedidos não cancelados
    valorTotalPedidos: valorTotal,
    valorTotal: valorTotal, // Alias para compatibilidade
    ticketMedio: ticketMedio,
    gastoPorTipo: gastoPorTipo,
    gastoPorSetor: gastoPorSetorArray,
    taxaVariacao: taxaVariacao,
    custoMedioProdutos: custoMedioProdutos.slice(0, 10),
    produtosMaisCaros: produtosMaisCaros,
    previsaoGastos: previsaoGastos,
    taxaEconomia: taxaEconomia,
    custoPerCapita: custoPerCapita,
    valoresPorMes: valoresMensais,
    // Adicionais para compatibilidade com frontend
    pedidosPapelaria: pedidosFiltrados.filter(p => p[2] === 'Papelaria' && p[9] !== CONFIG.STATUS_PEDIDO.CANCELADO).length,
    pedidosLimpeza: pedidosFiltrados.filter(p => p[2] === 'Limpeza' && p[9] !== CONFIG.STATUS_PEDIDO.CANCELADO).length,
    valorPapelaria: valorPapelaria,
    valorLimpeza: valorLimpeza
  };
}

/**
 * 🚚 KPIs LOGÍSTICOS (10 KPIs)
 */
function calcularKPIsLogisticos(pedidosFiltrados) {
  let tempoTotalAprovacao = 0;
  let countAprovacao = 0;
  let tempoTotalProcessamento = 0;
  let countProcessamento = 0;
  let pedidosNoPrazo = 0;
  let pedidosUrgentes = 0;
  const pedidosPorStatus = {};
  const pedidosPorSolicitante = {};

  pedidosFiltrados.forEach(pedido => {
    const status = pedido[9];
    const dataSolicitacao = new Date(pedido[10]);
    const dataCompra = pedido[11] ? new Date(pedido[11]) : null;
    const dataFinalizacao = pedido[12] ? new Date(pedido[12]) : null;
    const prazoEntrega = pedido[13] ? new Date(pedido[13]) : null;
    const solicitante = pedido[3];

    // Tempo de aprovação
    if (dataCompra) {
      const diasAprovacao = (dataCompra - dataSolicitacao) / (1000 * 60 * 60 * 24);
      if (diasAprovacao >= 0) {
        tempoTotalAprovacao += diasAprovacao;
        countAprovacao++;
      }
    }

    // Lead time total
    if (dataFinalizacao) {
      const diasProcessamento = (dataFinalizacao - dataSolicitacao) / (1000 * 60 * 60 * 24);
      if (diasProcessamento >= 0) {
        tempoTotalProcessamento += diasProcessamento;
        countProcessamento++;

        // Pedidos no prazo
        if (prazoEntrega && dataFinalizacao <= prazoEntrega) {
          pedidosNoPrazo++;
        }
      }
    }

    // Pedidos por status
    if (!pedidosPorStatus[status]) {
      pedidosPorStatus[status] = 0;
    }
    pedidosPorStatus[status]++;

    // Pedidos por solicitante
    if (!pedidosPorSolicitante[solicitante]) {
      pedidosPorSolicitante[solicitante] = 0;
    }
    pedidosPorSolicitante[solicitante]++;

    // Pedidos urgentes (prazo < 3 dias)
    if (prazoEntrega) {
      const diasAtePrazo = (prazoEntrega - dataSolicitacao) / (1000 * 60 * 60 * 24);
      if (diasAtePrazo < 3) {
        pedidosUrgentes++;
      }
    }
  });

  // 1. Tempo Médio de Aprovação
  const tempoMedioAprovacao = countAprovacao > 0 ? tempoTotalAprovacao / countAprovacao : 0;

  // 2. Lead Time Total
  const leadTimeTotal = countProcessamento > 0 ? tempoTotalProcessamento / countProcessamento : 0;

  // 3. Taxa de Pedidos no Prazo
  const taxaPedidosNoPrazo = countProcessamento > 0 ? (pedidosNoPrazo / countProcessamento) * 100 : 0;

  // 4. Taxa de Cancelamento
  const totalPedidos = pedidosFiltrados.length;
  const pedidosCancelados = pedidosPorStatus[CONFIG.STATUS_PEDIDO.CANCELADO] || 0;
  const taxaCancelamento = totalPedidos > 0 ? (pedidosCancelados / totalPedidos) * 100 : 0;

  // 5. Pedidos por Status (array para gráfico)
  const pedidosPorStatusArray = Object.entries(pedidosPorStatus)
    .map(([status, count]) => ({ status, count }));

  // 6. Eficiência de Processamento (pedidos finalizados / 30 dias)
  const pedidosFinalizados = pedidosPorStatus[CONFIG.STATUS_PEDIDO.FINALIZADO] || 0;
  const eficienciaProcessamento = pedidosFinalizados / 30; // por dia

  // 7. Taxa de Pedidos Urgentes
  const taxaPedidosUrgentes = totalPedidos > 0 ? (pedidosUrgentes / totalPedidos) * 100 : 0;

  // 8. Backlog de Pedidos
  const backlog = (pedidosPorStatus[CONFIG.STATUS_PEDIDO.SOLICITADO] || 0) +
    (pedidosPorStatus[CONFIG.STATUS_PEDIDO.EM_COMPRA] || 0);

  // 9. Tempo de Resposta do Gestor (aprox. = tempo de aprovação)
  const tempoRespostaGestor = tempoMedioAprovacao;

  // 10. Pedidos por Solicitante (Top 10)
  const pedidosPorSolicitanteArray = Object.entries(pedidosPorSolicitante)
    .map(([solicitante, count]) => ({ solicitante, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calcular taxa de finalização
  const pedidosNaoCancelados = totalPedidos - pedidosCancelados;
  const taxaFinalizacao = pedidosNaoCancelados > 0 ? (pedidosFinalizados / pedidosNaoCancelados) * 100 : 0;

  return {
    tempoMedioAprovacao: tempoMedioAprovacao,
    leadTimeTotal: leadTimeTotal,
    taxaPedidosNoPrazo: taxaPedidosNoPrazo,
    taxaCancelamento: taxaCancelamento,
    taxaFinalizacao: taxaFinalizacao,
    pedidosPorStatus: pedidosPorStatusArray,
    eficienciaProcessamento: eficienciaProcessamento,
    taxaPedidosUrgentes: taxaPedidosUrgentes,
    backlog: backlog,
    tempoRespostaGestor: tempoRespostaGestor,
    pedidosPorSolicitante: pedidosPorSolicitanteArray,
    // Campos adicionais para Dashboard Resumo
    pedidosSolicitados: pedidosPorStatus[CONFIG.STATUS_PEDIDO.SOLICITADO] || 0,
    pedidosEmCompra: pedidosPorStatus[CONFIG.STATUS_PEDIDO.EM_COMPRA] || 0,
    pedidosFinalizados: pedidosFinalizados,
    pedidosCancelados: pedidosCancelados
  };
}

/**
 * 📦 KPIs DE ESTOQUE (12 KPIs)
 */
function calcularKPIsEstoque(dadosProdutos, dadosEstoque, dadosMovimentacoes, pedidosFiltrados) {
  let totalProdutos = 0;
  let produtosEstoqueBaixo = 0;
  let produtosEstoqueZero = 0;
  let produtosPontoPedido = 0;
  let valorTotalEstoque = 0;
  let idadeTotalEstoque = 0;
  let countIdade = 0;
  const produtosSolicitacoes = {};

  // Calcular consumo médio diário por produto
  const consumoPorProduto = calcularConsumoMedioDiario(pedidosFiltrados, dadosMovimentacoes);

  dadosProdutos.forEach(produto => {
    if (!produto[0]) return;

    totalProdutos++;

    const produtoId = produto[0];
    const estoqueMinimo = parseFloat(produto[7]) || 0;
    const pontoPedido = parseFloat(produto[8]) || 0;
    const precoUnitario = parseFloat(produto[6]) || 0;
    const dataCadastro = produto[12] ? new Date(produto[12]) : null;

    // Buscar estoque atual
    let qtdAtual = 0;
    for (let j = 0; j < dadosEstoque.length; j++) {
      if (dadosEstoque[j][1] === produtoId) {
        qtdAtual = parseFloat(dadosEstoque[j][3]) || 0;
        break;
      }
    }

    valorTotalEstoque += qtdAtual * precoUnitario;

    if (qtdAtual === 0) {
      produtosEstoqueZero++;
    }

    if (qtdAtual <= estoqueMinimo && estoqueMinimo > 0) {
      produtosEstoqueBaixo++;
    }

    // Verificar ponto de pedido
    if (qtdAtual <= pontoPedido && pontoPedido > 0) {
      produtosPontoPedido++;
    }

    // Idade do estoque
    if (dataCadastro) {
      const diasDesde = (new Date() - dataCadastro) / (1000 * 60 * 60 * 24);
      idadeTotalEstoque += diasDesde;
      countIdade++;
    }
  });

  // Contar solicitações por produto
  pedidosFiltrados.forEach(pedido => {
    const produtos = pedido[6].split('; ');
    const quantidades = pedido[7].split('; ');
    produtos.forEach((produto, idx) => {
      if (!produtosSolicitacoes[produto]) {
        produtosSolicitacoes[produto] = 0;
      }
      produtosSolicitacoes[produto] += parseFloat(quantidades[idx]) || 0;
    });
  });

  // 1. Giro de Estoque
  const totalSaidas = dadosMovimentacoes.filter(m => m[2] === 'SAIDA').reduce((sum, m) => sum + (parseFloat(m[5]) || 0), 0);
  const giroEstoque = valorTotalEstoque > 0 ? totalSaidas / valorTotalEstoque : 0;

  // 2. Cobertura de Estoque (média)
  const consumoMedioDiarioTotal = Object.values(consumoPorProduto).reduce((sum, c) => sum + c, 0);
  const coberturaEstoque = consumoMedioDiarioTotal > 0 ? totalProdutos / consumoMedioDiarioTotal : 0;

  // 3. Taxa de Ruptura
  const taxaRuptura = totalProdutos > 0 ? (produtosEstoqueZero / totalProdutos) * 100 : 0;

  // 4. Produtos Abaixo do Mínimo
  const produtosAbaixoMinimo = produtosEstoqueBaixo;

  // 5. Acurácia de Estoque (placeholder - requer auditoria física)
  const acuraciaEstoque = 98; // Assumir 98% por padrão

  // 6. Valor Total de Estoque
  // já calculado acima

  // 7. Idade Média do Estoque
  const idadeMediaEstoque = countIdade > 0 ? idadeTotalEstoque / countIdade : 0;

  // 8. Top 10 Produtos Mais Solicitados
  const produtosMaisSolicitados = Object.entries(produtosSolicitacoes)
    .map(([produto, quantidade]) => ({ produto, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  // 9. Produtos Inativos (sem movimentação em 90 dias)
  const produtosInativos = calcularProdutosInativos(dadosMovimentacoes);

  // 10. Taxa de Estoque Reservado (placeholder)
  const taxaEstoqueReservado = 15; // Assumir 15% por padrão

  // 11. Previsão de Reposição
  const previsaoReposicao = calcularPrevisaoReposicao(dadosProdutos, dadosEstoque, consumoPorProduto);

  // 12. Custo de Armazenagem (2% ao mês)
  const custoArmazenagem = valorTotalEstoque * 0.02;

  return {
    giroEstoque: giroEstoque,
    coberturaEstoque: coberturaEstoque,
    taxaRuptura: taxaRuptura,
    produtosAbaixoMinimo: produtosAbaixoMinimo,
    acuraciaEstoque: acuraciaEstoque,
    valorTotalEstoque: valorTotalEstoque,
    idadeMediaEstoque: idadeMediaEstoque,
    produtosMaisSolicitados: produtosMaisSolicitados,
    produtosInativos: produtosInativos,
    taxaEstoqueReservado: taxaEstoqueReservado,
    previsaoReposicao: previsaoReposicao,
    custoArmazenagem: custoArmazenagem,
    // Campos adicionais para Dashboard Resumo
    totalProdutos: totalProdutos,
    valorTotal: valorTotalEstoque,
    produtosPontoPedido: produtosPontoPedido
  };
}

/**
 * Funções auxiliares
 */

function agruparPorMes(valoresPorMes) {
  const agrupado = {};
  valoresPorMes.forEach(item => {
    if (!agrupado[item.mes]) {
      agrupado[item.mes] = 0;
    }
    agrupado[item.mes] += item.valor;
  });
  return agrupado;
}

function calcularConsumoMedioDiario(pedidosFiltrados, dadosMovimentacoes) {
  const consumo = {};
  const dias = 30; // Últimos 30 dias

  dadosMovimentacoes.forEach(mov => {
    if (mov[2] === 'SAIDA') {
      const produtoId = mov[3];
      const quantidade = parseFloat(mov[5]) || 0;
      if (!consumo[produtoId]) {
        consumo[produtoId] = 0;
      }
      consumo[produtoId] += quantidade;
    }
  });

  // Dividir por dias
  Object.keys(consumo).forEach(produtoId => {
    consumo[produtoId] = consumo[produtoId] / dias;
  });

  return consumo;
}

function calcularProdutosInativos(dadosMovimentacoes) {
  const ultimaMovimentacao = {};
  const agora = new Date();

  dadosMovimentacoes.forEach(mov => {
    const produtoId = mov[3];
    const data = new Date(mov[1]);
    if (!ultimaMovimentacao[produtoId] || data > ultimaMovimentacao[produtoId]) {
      ultimaMovimentacao[produtoId] = data;
    }
  });

  let inativos = 0;
  Object.values(ultimaMovimentacao).forEach(data => {
    const diasSemMovimentacao = (agora - data) / (1000 * 60 * 60 * 24);
    if (diasSemMovimentacao > 90) {
      inativos++;
    }
  });

  return inativos;
}

function calcularPrevisaoReposicao(dadosProdutos, dadosEstoque, consumoPorProduto) {
  const previsoes = [];

  dadosProdutos.forEach(produto => {
    const produtoId = produto[0];
    const produtoNome = produto[1];

    // Buscar estoque atual
    let qtdAtual = 0;
    for (let j = 0; j < dadosEstoque.length; j++) {
      if (dadosEstoque[j][1] === produtoId) {
        qtdAtual = parseFloat(dadosEstoque[j][3]) || 0;
        break;
      }
    }

    const consumoDiario = consumoPorProduto[produtoId] || 0;
    if (consumoDiario > 0) {
      const diasAteRuptura = qtdAtual / consumoDiario;
      if (diasAteRuptura < 30) {
        previsoes.push({
          produto: produtoNome,
          diasAteRuptura: Math.floor(diasAteRuptura)
        });
      }
    }
  });

  return previsoes.sort((a, b) => a.diasAteRuptura - b.diasAteRuptura).slice(0, 10);
}
