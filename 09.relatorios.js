/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v6.0
 * Módulo: Relatórios
 * ========================================
 */

/**
 * Gera relatório de pedidos
 */
function gerarRelatorioPedidos(filtros) {
  try {
    const resultado = listarPedidos(filtros);
    
    if (!resultado.success) {
      return resultado;
    }
    
    const pedidos = resultado.pedidos;
    
    // Calcular estatísticas
    let valorTotal = 0;
    let qtdSolicitados = 0;
    let qtdEmCompra = 0;
    let qtdFinalizados = 0;
    let qtdCancelados = 0;
    
    pedidos.forEach(pedido => {
      valorTotal += parseFloat(pedido.valorTotal) || 0;
      
      if (pedido.status === CONFIG.STATUS_PEDIDO.SOLICITADO) qtdSolicitados++;
      if (pedido.status === CONFIG.STATUS_PEDIDO.EM_COMPRA) qtdEmCompra++;
      if (pedido.status === CONFIG.STATUS_PEDIDO.FINALIZADO) qtdFinalizados++;
      if (pedido.status === CONFIG.STATUS_PEDIDO.CANCELADO) qtdCancelados++;
    });
    
    const ticketMedio = pedidos.length > 0 ? valorTotal / pedidos.length : 0;
    
    return {
      success: true,
      relatorio: {
        pedidos: pedidos,
        estatisticas: {
          totalPedidos: pedidos.length,
          valorTotal: valorTotal,
          ticketMedio: ticketMedio,
          qtdSolicitados: qtdSolicitados,
          qtdEmCompra: qtdEmCompra,
          qtdFinalizados: qtdFinalizados,
          qtdCancelados: qtdCancelados
        },
        dataGeracao: new Date()
      }
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao gerar relatório de pedidos: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Gera relatório de produtos
 */
function gerarRelatorioProdutos(filtros) {
  try {
    const resultado = listarProdutos(filtros);
    
    if (!resultado.success) {
      return resultado;
    }
    
    const produtos = resultado.produtos;
    
    // Calcular estatísticas
    let qtdPapelaria = 0;
    let qtdLimpeza = 0;
    let valorTotalEstoque = 0;
    
    produtos.forEach(produto => {
      if (produto.tipo === 'Papelaria') qtdPapelaria++;
      if (produto.tipo === 'Limpeza') qtdLimpeza++;
    });
    
    return {
      success: true,
      relatorio: {
        produtos: produtos,
        estatisticas: {
          totalProdutos: produtos.length,
          qtdPapelaria: qtdPapelaria,
          qtdLimpeza: qtdLimpeza
        },
        dataGeracao: new Date()
      }
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao gerar relatório de produtos: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Gera relatório de estoque
 */
function gerarRelatorioEstoque() {
  try {
    const resultado = getEstoqueAtual();
    
    if (!resultado.success) {
      return resultado;
    }
    
    const estoque = resultado.estoque;
    
    // Calcular estatísticas
    let valorTotalEstoque = 0;
    let itensEstoqueBaixo = 0;
    let itensPontoPedido = 0;
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const dadosProdutos = abaProdutos.getDataRange().getValues();
    
    estoque.forEach(item => {
      // Buscar dados do produto
      for (let i = 1; i < dadosProdutos.length; i++) {
        if (dadosProdutos[i][0] === item.produtoId) {
          const precoUnitario = dadosProdutos[i][6] || 0;
          const estoqueMinimo = dadosProdutos[i][7] || 0;
          const pontoPedido = dadosProdutos[i][8] || 0;
          
          valorTotalEstoque += item.quantidadeAtual * precoUnitario;
          
          if (item.quantidadeAtual <= estoqueMinimo && estoqueMinimo > 0) {
            itensEstoqueBaixo++;
          }
          
          if (item.quantidadeAtual <= pontoPedido && pontoPedido > 0) {
            itensPontoPedido++;
          }
          
          break;
        }
      }
    });
    
    return {
      success: true,
      relatorio: {
        estoque: estoque,
        estatisticas: {
          totalItens: estoque.length,
          valorTotalEstoque: valorTotalEstoque,
          itensEstoqueBaixo: itensEstoqueBaixo,
          itensPontoPedido: itensPontoPedido
        },
        dataGeracao: new Date()
      }
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao gerar relatório de estoque: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Exporta relatório para CSV
 */
function exportarRelatorioCSV(tipoRelatorio, filtros) {
  try {
    let relatorio;
    let nomeArquivo;
    let dados = [];
    
    switch (tipoRelatorio) {
      case 'pedidos':
        relatorio = gerarRelatorioPedidos(filtros);
        nomeArquivo = `relatorio_pedidos_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')}.csv`;
        
        if (relatorio.success) {
          dados = relatorio.relatorio.pedidos.map(p => ({
            'Número': p.numeroPedido,
            'Tipo': p.tipo,
            'Solicitante': p.solicitanteNome,
            'Setor': p.setor,
            'Valor Total': p.valorTotal,
            'Status': p.status,
            'Data Solicitação': formatarData(p.dataSolicitacao)
          }));
        }
        break;
        
      case 'produtos':
        relatorio = gerarRelatorioProdutos(filtros);
        nomeArquivo = `relatorio_produtos_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')}.csv`;
        
        if (relatorio.success) {
          dados = relatorio.relatorio.produtos.map(p => ({
            'Código': p.codigo,
            'Nome': p.nome,
            'Tipo': p.tipo,
            'Categoria': p.categoria,
            'Preço Unitário': p.precoUnitario,
            'Estoque Mínimo': p.estoqueMinimo,
            'Ponto de Pedido': p.pontoPedido,
            'Ativo': p.ativo
          }));
        }
        break;
        
      case 'estoque':
        relatorio = gerarRelatorioEstoque();
        nomeArquivo = `relatorio_estoque_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')}.csv`;
        
        if (relatorio.success) {
          dados = relatorio.relatorio.estoque.map(e => ({
            'Produto': e.produtoNome,
            'Quantidade Atual': e.quantidadeAtual,
            'Quantidade Reservada': e.quantidadeReservada,
            'Estoque Disponível': e.estoqueDisponivel,
            'Última Atualização': formatarData(e.ultimaAtualizacao, 'dd/MM/yyyy HH:mm'),
            'Responsável': e.responsavel
          }));
        }
        break;
        
      default:
        return {
          success: false,
          error: 'Tipo de relatório inválido'
        };
    }
    
    if (!relatorio.success) {
      return relatorio;
    }
    
    return exportarParaCSV(dados, nomeArquivo);
    
  } catch (error) {
    Logger.log('❌ Erro ao exportar relatório: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
