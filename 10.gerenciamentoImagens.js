/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v8.0
 * Módulo: 08. UPLOAD DE IMAGENS (GOOGLE DRIVE)
 * ========================================
 *
 * Este módulo gerencia upload de imagens de produtos para o Google Drive
 * e retorna URLs públicas para exibição no frontend
 */

/**
 * Upload de imagem em Base64 para o Google Drive (v10.1 - CORRIGIDO)
 *
 * @param {string} base64 - String Base64 da imagem
 * @param {string} fileName - Nome do arquivo original
 * @param {string} mimeType - Tipo MIME (image/jpeg, image/png, etc)
 * @param {string} tipoProduto - Tipo do produto (Papelaria ou Limpeza)
 * @returns {object} - { success: boolean, imageUrl: string, fileId: string }
 */
function uploadImagemDrive(base64, fileName, mimeType, tipoProduto) {
  try {
    Logger.log(`📤 Iniciando upload de imagem: ${fileName} (${tipoProduto})`);

    // 1. Obter pasta correta (Papelaria ou Limpeza)
    const pasta = obterPastaImagensPorTipo(tipoProduto);

    if (!pasta) {
      throw new Error('Pasta de imagens não configurada. Configure PASTA_IMAGENS_ID em Configurações.');
    }

    // 2. Converter Base64 para Blob
    const bytes = Utilities.base64Decode(base64);
    const blob = Utilities.newBlob(bytes, mimeType, fileName);

    // 3. Fazer upload para o Drive
    const file = pasta.createFile(blob);

    // 4. Tornar arquivo público (leitura para qualquer um com o link)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 5. Obter URL pública (v10.1 - Formato de thumbnail)
    const fileId = file.getId();
    const imageUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;

    Logger.log(`✅ Upload concluído: ${imageUrl}`);

    return {
      success: true,
      imageUrl: imageUrl,
      fileId: fileId,
      fileName: fileName
    };

  } catch (error) {
    Logger.log(`❌ Erro ao fazer upload de imagem: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obter pasta de imagens por tipo (Papelaria ou Limpeza)
 * Usa o PASTA_IMAGENS_ID da aba Configurações
 *
 * @param {string} tipo - "Papelaria" ou "Limpeza"
 * @returns {Folder} - Objeto Folder do Google Drive
 */
function obterPastaImagensPorTipo(tipo) {
  try {
    // 1. Obter ID da pasta principal da configuração
    const pastaId = obterConfiguracao('PASTA_IMAGENS_ID');

    if (!pastaId || pastaId === '') {
      Logger.log('❌ PASTA_IMAGENS_ID não configurada');
      throw new Error('PASTA_IMAGENS_ID não configurada em Configurações');
    }

    // 2. Obter pasta principal
    const pastaPrincipal = DriveApp.getFolderById(pastaId);
    Logger.log(`📁 Pasta principal encontrada: ${pastaPrincipal.getName()}`);

    // 3. Buscar ou criar subpasta por tipo
    const nomePasta = tipo === 'Papelaria' ? 'Papelaria' : 'Limpeza';
    const subpastas = pastaPrincipal.getFoldersByName(nomePasta);

    if (subpastas.hasNext()) {
      const subpasta = subpastas.next();
      Logger.log(`📁 Subpasta encontrada: ${nomePasta}`);
      return subpasta;
    } else {
      // Criar subpasta se não existir
      Logger.log(`📁 Criando subpasta: ${nomePasta}`);
      const novaSubpasta = pastaPrincipal.createFolder(nomePasta);
      novaSubpasta.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return novaSubpasta;
    }

  } catch (error) {
    Logger.log(`❌ Erro ao obter pasta de imagens por tipo: ${error.message}`);
    throw error;
  }
}

/**
 * Deletar imagem do Drive quando produto for removido
 *
 * @param {string} fileIdOrUrl - ID do arquivo ou URL completa
 * @returns {object} - { success: boolean }
 */
function deletarImagemDrive(fileIdOrUrl) {
  try {
    // Extrair File ID da URL se necessário
    let fileId = fileIdOrUrl;

    if (fileIdOrUrl.includes('drive.google.com')) {
      // URL format: https://drive.google.com/uc?id=FILE_ID
      const match = fileIdOrUrl.match(/id=([^&]+)/);
      if (match) {
        fileId = match[1];
      }
    }

    Logger.log(`🗑️ Deletando imagem com ID: ${fileId}`);

    // Buscar arquivo
    const file = DriveApp.getFileById(fileId);

    // Deletar
    file.setTrashed(true);

    Logger.log(`✅ Imagem deletada com sucesso`);

    return {
      success: true
    };

  } catch (error) {
    Logger.log(`❌ Erro ao deletar imagem: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obter URL pública de uma imagem dado o File ID (v10.1 - Formato thumbnail)
 *
 * @param {string} fileId - ID do arquivo no Drive
 * @returns {string} - URL pública da imagem
 */
function getImageUrl(fileId) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
}

/**
 * Atualizar imagem de um produto (deleta antiga e sobe nova)
 *
 * @param {string} imagemUrlAntiga - URL da imagem atual
 * @param {string} base64Nova - Base64 da nova imagem
 * @param {string} fileName - Nome do novo arquivo
 * @param {string} mimeType - Tipo MIME da nova imagem
 * @returns {object} - { success: boolean, imageUrl: string }
 */
function atualizarImagemProduto(imagemUrlAntiga, base64Nova, fileName, mimeType) {
  try {
    Logger.log(`🔄 Atualizando imagem de produto`);

    // 1. Deletar imagem antiga (se existir)
    if (imagemUrlAntiga) {
      deletarImagemDrive(imagemUrlAntiga);
    }

    // 2. Upload da nova imagem
    const resultado = uploadImagemDrive(base64Nova, fileName, mimeType);

    return resultado;

  } catch (error) {
    Logger.log(`❌ Erro ao atualizar imagem: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Limpar imagens órfãs (imagens no Drive que não estão vinculadas a nenhum produto)
 *
 * @returns {object} - { success: boolean, imagensDeletadas: number }
 */
function limparImagensOrfas() {
  try {
    Logger.log(`🧹 Iniciando limpeza de imagens órfãs`);

    // 1. Buscar todas as imagens na pasta
    const pasta = obterOuCriarPastaImagens();
    const arquivos = pasta.getFiles();

    // 2. Buscar todos os produtos e suas URLs de imagem
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);
    const lastRow = abaProdutos.getLastRow();

    if (lastRow <= 1) {
      return { success: true, imagensDeletadas: 0 };
    }

    // Usar CONFIG para obter índice correto da coluna Imagem URL
    const colunaImagemUrl = CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL; // Coluna N = índice 14

    const dadosProdutos = abaProdutos.getRange(2, 1, lastRow - 1, colunaImagemUrl).getValues();

    // Coletar todas as URLs de imagem em uso
    const urlsEmUso = new Set();
    dadosProdutos.forEach(row => {
      const imagemUrl = row[colunaImagemUrl - 1]; // Ajustar índice
      if (imagemUrl) {
        urlsEmUso.add(imagemUrl);
      }
    });

    // 3. Deletar arquivos não utilizados
    let imagensDeletadas = 0;

    while (arquivos.hasNext()) {
      const arquivo = arquivos.next();
      const fileId = arquivo.getId();
      const imageUrl = getImageUrl(fileId);

      if (!urlsEmUso.has(imageUrl)) {
        Logger.log(`🗑️ Deletando imagem órfã: ${arquivo.getName()}`);
        arquivo.setTrashed(true);
        imagensDeletadas++;
      }
    }

    Logger.log(`✅ Limpeza concluída. ${imagensDeletadas} imagem(ns) deletada(s)`);

    return {
      success: true,
      imagensDeletadas: imagensDeletadas
    };

  } catch (error) {
    Logger.log(`❌ Erro ao limpar imagens órfãs: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obter informações de uma imagem do Drive
 *
 * @param {string} fileIdOrUrl - ID ou URL da imagem
 * @returns {object} - Informações do arquivo
 */
function getInfoImagemDrive(fileIdOrUrl) {
  try {
    // Extrair File ID
    let fileId = fileIdOrUrl;
    if (fileIdOrUrl.includes('drive.google.com')) {
      const match = fileIdOrUrl.match(/id=([^&]+)/);
      if (match) {
        fileId = match[1];
      }
    }

    const file = DriveApp.getFileById(fileId);

    return {
      success: true,
      info: {
        nome: file.getName(),
        tamanho: file.getSize(),
        tipo: file.getMimeType(),
        dataCriacao: file.getDateCreated(),
        url: getImageUrl(fileId)
      }
    };

  } catch (error) {
    Logger.log(`❌ Erro ao obter info da imagem: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Upload de imagem de produto (wrapper com validações) v10.1 - MELHORADO
 *
 * @param {object} dados - { base64Data, fileName, mimeType, produtoId, produtoCodigo, produtoNome, tipo }
 * @returns {object} - { success: boolean, imageUrl: string, fileId: string }
 */
function uploadImagemProduto(dados) {
  try {
    Logger.log(`📤 [v10.1] Upload de imagem para produto: ${dados.produtoNome}`);

    // Validações
    if (!dados || !dados.base64Data) {
      return {
        success: false,
        error: 'Dados de imagem não fornecidos'
      };
    }

    if (!dados.tipo) {
      return {
        success: false,
        error: 'Tipo do produto não fornecido (Papelaria ou Limpeza)'
      };
    }

    // Gerar nome de arquivo inteligente: CODIGO-DESCRICAO.extensao
    const codigo = dados.produtoCodigo || 'SEM-CODIGO';
    const descricao = (dados.produtoNome || 'produto')
      .replace(/[^a-zA-Z0-9-]/g, '-') // Substituir caracteres especiais por hífen
      .replace(/-+/g, '-')             // Remover hífens duplicados
      .replace(/^-|-$/g, '')           // Remover hífens no início/fim
      .substring(0, 50);               // Limitar a 50 caracteres

    // Detectar extensão do arquivo original
    const extensao = dados.fileName ? dados.fileName.split('.').pop() : 'jpg';

    const nomeArquivo = `${codigo}-${descricao}.${extensao}`;

    Logger.log(`📝 Nome do arquivo: ${nomeArquivo}`);

    // Fazer upload na pasta correta (Papelaria ou Limpeza)
    const resultado = uploadImagemDrive(
      dados.base64Data,
      nomeArquivo,
      dados.mimeType || 'image/jpeg',
      dados.tipo  // Novo parâmetro: Papelaria ou Limpeza
    );

    if (resultado.success) {
      Logger.log(`✅ Upload de imagem concluído: ${resultado.imageUrl}`);
    }

    return resultado;

  } catch (error) {
    Logger.log(`❌ Erro ao fazer upload de imagem de produto: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * ========================================
 * FUNÇÕES DE TESTE
 * ========================================
 */

/**
 * Corrige URLs antigas de imagens para o novo formato (v10.1)
 */
function corrigirURLsImagensAntigas() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const abaProdutos = ss.getSheetByName(CONFIG.ABAS.PRODUCTS);

    if (!abaProdutos) {
      return { success: false, error: 'Aba de produtos não encontrada' };
    }

    const dados = abaProdutos.getDataRange().getValues();
    let corrigidos = 0;

    for (let i = 1; i < dados.length; i++) {
      const imagemURL = dados[i][CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL - 1];

      // Se tiver URL no formato antigo (uc?id=), converter para thumbnail
      if (imagemURL && imagemURL.includes('drive.google.com/uc?id=')) {
        const fileId = imagemURL.match(/id=([^&]+)/)[1];
        const novaURL = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;

        abaProdutos.getRange(i + 1, CONFIG.COLUNAS_PRODUTOS.IMAGEM_URL).setValue(novaURL);
        Logger.log(`✅ Corrigida URL do produto linha ${i + 1}: ${novaURL}`);
        corrigidos++;
      }
    }

    return {
      success: true,
      corrigidos: corrigidos,
      message: `${corrigidos} URL(s) corrigida(s)`
    };

  } catch (error) {
    Logger.log('❌ Erro ao corrigir URLs: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Função de teste para verificar se upload está funcionando
 */
function testeUploadImagem() {
  // Base64 de uma imagem 1x1 pixel PNG transparente (para teste)
  const base64Test = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const resultado = uploadImagemDrive(base64Test, 'teste.png', 'image/png');

  Logger.log('Resultado do teste:');
  Logger.log(JSON.stringify(resultado));

  if (resultado.success) {
    Logger.log('✅ Teste de upload passou!');
    Logger.log('URL da imagem: ' + resultado.imageUrl);

    // Tentar deletar a imagem de teste
    const resultadoDelete = deletarImagemDrive(resultado.fileId);
    Logger.log('Resultado do delete: ' + JSON.stringify(resultadoDelete));
  } else {
    Logger.log('❌ Teste de upload falhou: ' + resultado.error);
  }
}

/**
 * Função de teste para verificar limpeza de órfãs
 */
function testeLimparOrfas() {
  const resultado = limparImagensOrfas();
  Logger.log('Resultado da limpeza:');
  Logger.log(JSON.stringify(resultado));
}
