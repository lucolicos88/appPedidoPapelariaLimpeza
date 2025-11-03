/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v8.0
 * Módulo: 08. UPLOAD DE IMAGENS (GOOGLE DRIVE)
 * ========================================
 *
 * Este módulo gerencia upload de imagens de produtos para o Google Drive
 * e retorna URLs públicas para exibição no frontend
 */

// Nome da pasta no Drive onde as imagens serão armazenadas
const PASTA_IMAGENS_PRODUTOS = 'NeoFormula_Produtos_Imagens';

/**
 * Upload de imagem em Base64 para o Google Drive
 *
 * @param {string} base64 - String Base64 da imagem
 * @param {string} fileName - Nome do arquivo original
 * @param {string} mimeType - Tipo MIME (image/jpeg, image/png, etc)
 * @returns {object} - { success: boolean, imageUrl: string, fileId: string }
 */
function uploadImagemDrive(base64, fileName, mimeType) {
  try {
    Logger.log(`📤 Iniciando upload de imagem: ${fileName}`);

    // 1. Verificar se pasta existe, senão criar
    const pasta = obterOuCriarPastaImagens();

    // 2. Converter Base64 para Blob
    const bytes = Utilities.base64Decode(base64);
    const blob = Utilities.newBlob(bytes, mimeType, fileName);

    // 3. Fazer upload para o Drive
    const file = pasta.createFile(blob);

    // 4. Tornar arquivo público (leitura para qualquer um com o link)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 5. Obter URL pública
    const fileId = file.getId();
    const imageUrl = `https://drive.google.com/uc?id=${fileId}`;

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
 * Obter ou criar pasta de imagens de produtos no Drive
 *
 * @returns {Folder} - Objeto Folder do Google Drive
 */
function obterOuCriarPastaImagens() {
  try {
    // Buscar pasta existente
    const folders = DriveApp.getFoldersByName(PASTA_IMAGENS_PRODUTOS);

    if (folders.hasNext()) {
      // Pasta já existe
      Logger.log(`📁 Pasta encontrada: ${PASTA_IMAGENS_PRODUTOS}`);
      return folders.next();
    } else {
      // Criar nova pasta
      Logger.log(`📁 Criando pasta: ${PASTA_IMAGENS_PRODUTOS}`);
      const pasta = DriveApp.createFolder(PASTA_IMAGENS_PRODUTOS);

      // Tornar pasta compartilhada (para que imagens sejam acessíveis)
      pasta.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return pasta;
    }
  } catch (error) {
    Logger.log(`❌ Erro ao obter/criar pasta: ${error.message}`);
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
 * Obter URL pública de uma imagem dado o File ID
 *
 * @param {string} fileId - ID do arquivo no Drive
 * @returns {string} - URL pública da imagem
 */
function getImageUrl(fileId) {
  return `https://drive.google.com/uc?id=${fileId}`;
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
 * ========================================
 * FUNÇÕES DE TESTE
 * ========================================
 */

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
