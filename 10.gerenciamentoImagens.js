/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v6.0
 * Módulo: Gerenciamento de Imagens
 * ========================================
 * 
 * FUNCIONALIDADES v6.0:
 * - Upload de imagens para o Google Drive
 * - Renomeação inteligente: NomeProduto-DataCadastro
 * - Organização automática por tipo (Papelaria/Limpeza)
 * - Geração de URLs públicas
 * - Compressão e otimização
 */

/**
 * Faz upload de imagem para o Google Drive (v6.0)
 */
function uploadImagemProduto(dadosImagem) {
  try {
    const email = Session.getActiveUser().getEmail();
    
    // Verificar permissão
    if (!verificarPermissao(email, CONFIG.PERMISSOES.GESTOR)) {
      return {
        success: false,
        error: 'Permissão negada. Apenas gestores podem fazer upload de imagens.'
      };
    }
    
    // Validar dados
    if (!dadosImagem.base64Data || !dadosImagem.produtoNome || !dadosImagem.tipo) {
      return {
        success: false,
        error: 'Dados incompletos para upload da imagem'
      };
    }
    
    // Obter ID da pasta principal
    const pastaId = obterConfiguracao('PASTA_IMAGENS_ID');
    
    if (!pastaId || pastaId === '') {
      return {
        success: false,
        error: 'Pasta de imagens não configurada. Configure em Configurações > PASTA_IMAGENS_ID'
      };
    }
    
    try {
      const pastaPrincipal = DriveApp.getFolderById(pastaId);
      
      // Obter ou criar subpasta por tipo
      let subpasta;
      const subpastaNome = dadosImagem.tipo; // 'Papelaria' ou 'Limpeza'
      
      const subpastas = pastaPrincipal.getFoldersByName(subpastaNome);
      if (subpastas.hasNext()) {
        subpasta = subpastas.next();
      } else {
        subpasta = pastaPrincipal.createFolder(subpastaNome);
      }
      
      // Gerar nome do arquivo: NomeProduto-DataCadastro
      const agora = new Date();
      const dataFormatada = Utilities.formatDate(agora, Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss');
      const nomeProdutoLimpo = dadosImagem.produtoNome
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '_') // Substitui espaços por underline
        .substring(0, 50); // Limita tamanho
      
      const extensao = dadosImagem.mimeType ? dadosImagem.mimeType.split('/')[1] : 'jpg';
      const nomeArquivo = `${nomeProdutoLimpo}-${dataFormatada}.${extensao}`;
      
      // Converter base64 para blob
      const base64Data = dadosImagem.base64Data.split(',')[1] || dadosImagem.base64Data;
      const decodedData = Utilities.base64Decode(base64Data);
      const blob = Utilities.newBlob(decodedData, dadosImagem.mimeType || 'image/jpeg', nomeArquivo);
      
      // Fazer upload
      const arquivo = subpasta.createFile(blob);
      
      // Tornar arquivo público (apenas leitura)
      arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      // Obter URL pública
      const fileId = arquivo.getId();
      const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      
      // Registrar log
      registrarLog('IMAGEM_UPLOAD', `Upload de imagem: ${nomeArquivo}`, 'SUCESSO');
      
      Logger.log(`✅ Imagem salva: ${nomeArquivo}`);
      
      return {
        success: true,
        imageUrl: imageUrl,
        fileId: fileId,
        fileName: nomeArquivo
      };
      
    } catch (driveError) {
      Logger.log('❌ Erro ao acessar Google Drive: ' + driveError.message);
      return {
        success: false,
        error: 'Erro ao acessar a pasta do Google Drive. Verifique o ID da pasta nas configurações.'
      };
    }
    
  } catch (error) {
    Logger.log('❌ Erro ao fazer upload da imagem: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Lista imagens de uma pasta
 */
function listarImagensPasta(tipo) {
  try {
    const pastaId = obterConfiguracao('PASTA_IMAGENS_ID');
    
    if (!pastaId || pastaId === '') {
      return {
        success: false,
        error: 'Pasta de imagens não configurada'
      };
    }
    
    const pastaPrincipal = DriveApp.getFolderById(pastaId);
    const subpastas = pastaPrincipal.getFoldersByName(tipo);
    
    if (!subpastas.hasNext()) {
      return {
        success: true,
        imagens: []
      };
    }
    
    const subpasta = subpastas.next();
    const arquivos = subpasta.getFiles();
    const imagens = [];
    
    while (arquivos.hasNext()) {
      const arquivo = arquivos.next();
      const mimeType = arquivo.getMimeType();
      
      // Filtrar apenas imagens
      if (mimeType.startsWith('image/')) {
        imagens.push({
          id: arquivo.getId(),
          nome: arquivo.getName(),
          url: `https://drive.google.com/uc?export=view&id=${arquivo.getId()}`,
          dataModificacao: arquivo.getLastUpdated(),
          tamanho: arquivo.getSize()
        });
      }
    }
    
    return {
      success: true,
      imagens: imagens
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao listar imagens: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Deleta uma imagem do Drive
 */
function deletarImagem(fileId) {
  try {
    const email = Session.getActiveUser().getEmail();
    
    // Verificar permissão
    if (!verificarPermissao(email, CONFIG.PERMISSOES.ADMIN)) {
      return {
        success: false,
        error: 'Permissão negada. Apenas administradores podem deletar imagens.'
      };
    }
    
    const arquivo = DriveApp.getFileById(fileId);
    arquivo.setTrashed(true);
    
    // Registrar log
    registrarLog('IMAGEM_DELETADA', `Imagem deletada: ${arquivo.getName()}`, 'SUCESSO');
    
    return {
      success: true,
      message: 'Imagem deletada com sucesso'
    };
    
  } catch (error) {
    Logger.log('❌ Erro ao deletar imagem: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Atualiza imagem de um produto
 */
function atualizarImagemProduto(produtoId, dadosImagem) {
  try {
    // Buscar produto atual
    const resultadoProduto = buscarProduto(produtoId);
    
    if (!resultadoProduto.success) {
      return {
        success: false,
        error: 'Produto não encontrado'
      };
    }
    
    const produto = resultadoProduto.produto;
    
    // Se já tem imagem, marcar a antiga para remoção (opcional)
    if (produto.imagemURL) {
      // Você pode optar por deletar a imagem antiga aqui
      // ou manter histórico de imagens
    }
    
    // Fazer upload da nova imagem
    const resultadoUpload = uploadImagemProduto({
      base64Data: dadosImagem.base64Data,
      fileName: dadosImagem.fileName,
      mimeType: dadosImagem.mimeType,
      produtoId: produtoId,
      produtoNome: produto.nome,
      tipo: produto.tipo
    });
    
    if (!resultadoUpload.success) {
      return resultadoUpload;
    }
    
    // Atualizar produto com nova URL
    return atualizarProduto(produtoId, {
      imagemURL: resultadoUpload.imageUrl
    });
    
  } catch (error) {
    Logger.log('❌ Erro ao atualizar imagem do produto: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
