/**
 * ========================================
 * SISTEMA DE CONTROLE DE PEDIDOS NEOFORMULA v8.0
 * CONFIGURAÇÕES GLOBAIS E MAPEAMENTO DE COLUNAS
 * ========================================
 */

const CONFIG = {
  // Nome das abas
  ABAS: {
    PRODUCTS: 'Produtos',
    ORDERS: 'Pedidos',
    STOCK: 'Estoque',
    STOCK_MOVEMENTS: 'Movimentações Estoque',
    USERS: 'Usuários',
    CONFIG: 'Configurações',
    REPORTS_CONFIG: 'Relatorios_Config' // Opcional
  },

  // Mapeamento de colunas - ABA PRODUTOS
  COLUNAS_PRODUTOS: {
    ID: 1,                    // A - ID
    CODIGO: 2,                // B - Código
    NOME: 3,                  // C - Nome
    TIPO: 4,                  // D - Tipo
    CATEGORIA: 5,             // E - Categoria
    UNIDADE: 6,               // F - Unidade
    PRECO_UNITARIO: 7,        // G - Preço Unitário
    ESTOQUE_MINIMO: 8,        // H - Estoque Mínimo
    PONTO_PEDIDO: 9,          // I - Ponto de Pedido
    FORNECEDOR: 10,           // J - Fornecedor
    IMAGEM_URL: 11,           // K - ImagemURL (v8.0)
    ATIVO: 12,                // L - Ativo
    DATA_CADASTRO: 13         // M - Data Cadastro
  },

  // Mapeamento de colunas - ABA PEDIDOS
  COLUNAS_PEDIDOS: {
    ID: 1,                    // A - ID
    NUMERO_PEDIDO: 2,         // B - Número Pedido
    TIPO: 3,                  // C - Tipo
    SOLICITANTE_EMAIL: 4,     // D - Solicitante Email
    SOLICITANTE_NOME: 5,      // E - Solicitante Nome
    SETOR: 6,                 // F - Setor
    PRODUTOS: 7,              // G - Produtos (JSON)
    QUANTIDADES: 8,           // H - Quantidades (JSON)
    VALOR_TOTAL: 9,           // I - Valor Total
    STATUS: 10,               // J - Status
    DATA_SOLICITACAO: 11,     // K - Data Solicitação
    DATA_COMPRA: 12,          // L - Data Compra
    DATA_FINALIZACAO: 13,     // M - Data Finalização
    PRAZO_ENTREGA: 14,        // N - Prazo Entrega
    OBSERVACOES: 15           // O - Observações
  },

  // Mapeamento de colunas - ABA ESTOQUE
  COLUNAS_ESTOQUE: {
    ID: 1,                    // A - ID
    PRODUTO_ID: 2,            // B - Produto ID
    PRODUTO_NOME: 3,          // C - Produto Nome
    QUANTIDADE_ATUAL: 4,      // D - Quantidade Atual
    QUANTIDADE_RESERVADA: 5,  // E - Quantidade Reservada
    ESTOQUE_DISPONIVEL: 6,    // F - Estoque Disponível
    ULTIMA_ATUALIZACAO: 7,    // G - Última Atualização
    RESPONSAVEL: 8            // H - Responsável
  },

  // Mapeamento de colunas - ABA MOVIMENTAÇÕES ESTOQUE
  COLUNAS_MOVIMENTACOES: {
    ID: 1,                    // A - ID
    DATA_HORA: 2,             // B - Data/Hora
    TIPO_MOVIMENTACAO: 3,     // C - Tipo Movimentação
    PRODUTO_ID: 4,            // D - Produto ID
    PRODUTO_NOME: 5,          // E - Produto Nome
    QUANTIDADE: 6,            // F - Quantidade
    ESTOQUE_ANTERIOR: 7,      // G - Estoque Anterior
    ESTOQUE_ATUAL: 8,         // H - Estoque Atual
    RESPONSAVEL: 9,           // I - Responsável
    OBSERVACOES: 10,          // J - Observações
    PEDIDO_ID: 11             // K - Pedido ID (v8.0)
  },

  // Status de pedidos permitidos
  STATUS_PEDIDOS: {
    SOLICITADO: 'Solicitado',
    EM_ANALISE: 'Em Análise',
    APROVADO: 'Aprovado',
    EM_COMPRA: 'Em Compra',
    AGUARDANDO_ENTREGA: 'Aguardando Entrega',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado'
  },

  // Alias para compatibilidade com código existente
  STATUS_PEDIDO: {
    SOLICITADO: 'Solicitado',
    EM_ANALISE: 'Em Análise',
    APROVADO: 'Aprovado',
    EM_COMPRA: 'Em Compra',
    AGUARDANDO_ENTREGA: 'Aguardando Entrega',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado'
  },

  // Tipos de movimentação
  TIPOS_MOVIMENTACAO: {
    ENTRADA: 'ENTRADA',
    SAIDA: 'SAIDA',
    AJUSTE: 'AJUSTE',
    BAIXA_PEDIDO: 'SAIDA' // Baixa de pedido usa SAIDA
  },

  // Tipos de produtos
  TIPOS_PRODUTOS: {
    PAPELARIA: 'Papelaria',
    LIMPEZA: 'Limpeza'
  },

  // Perfis de usuário
  PERFIS: {
    ADMIN: 'Admin',
    GESTOR: 'Gestor',
    FUNCIONARIO: 'Funcionario'
  },

  // Alias para compatibilidade (v6.0 usava PERMISSOES)
  PERMISSOES: {
    ADMIN: 'ADMIN',
    GESTOR: 'GESTOR',
    USUARIO: 'USUARIO',
    VISUALIZADOR: 'VISUALIZADOR'
  },

  // Configurações de upload de imagens
  UPLOAD: {
    PASTA_DRIVE: 'NeoFormula_Produtos_Imagens',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    TIPOS_PERMITIDOS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },

  // Configurações de relatórios
  RELATORIOS: {
    TIPOS: [
      'visao_geral',
      'financeiro',
      'logistico',
      'estoque',
      'produtos',
      'usuarios',
      'tendencias',
      'comparativo'
    ],
    PERIODOS: {
      ULTIMOS_7_DIAS: 7,
      ULTIMOS_30_DIAS: 30,
      ULTIMOS_90_DIAS: 90,
      ULTIMOS_6_MESES: 180,
      ULTIMO_ANO: 365
    }
  },

  // Cores padrão Neoformula (para compatibilidade)
  CORES: {
    PRIMARY: '#00A651',
    PRIMARY_DARK: '#008542',
    SECONDARY: '#2C3E50',
    ACCENT: '#FF6B35',
    SUCCESS: '#4CAF50',
    WARNING: '#FFC107',
    DANGER: '#F44336',
    INFO: '#2196F3'
  },

  // Logo Neoformula
  LOGO_URL: 'https://neoformula.com.br/cdn/shop/files/Logotipo-NeoFormula-Manipulacao-Homeopatia_76b2fa98-5ffa-4cc3-ac0a-6d41e1bc8810.png?height=100&v=1677088468',

  // Versão do sistema
  VERSAO: '10.1',
  DATA_VERSAO: '2025-11-05',
  CHANGELOG: [
    'v10.1 - CORREÇÃO: Imagens não apareciam no catálogo de pedidos (debug + fallback)',
    'v10.1 - CORREÇÃO CRÍTICA: Upload de imagem não salvava URL na planilha (Base64 incorreto)',
    'v10.1 - CORREÇÃO CRÍTICA: uploadImagemProduto não definida (cadastro de produtos falhava)',
    'v10.1 - CORREÇÃO CRÍTICA: Permissões case-insensitive em verificarPermissao()',
    'v10.1 - CORREÇÃO: Controle de abas agora funciona para perfil USUARIO',
    'v10.1 - CORREÇÃO: Admin pode cadastrar produtos (bug de permissão)',
    'v10.1 - CORREÇÃO: Usuário USUARIO vê apenas 2 abas (Abrir Pedido + Gestão)',
    'v10.1 - CORREÇÃO: Dashboard não aparece mais para USUARIO (redireciona para Abrir Pedido)',
    'v10.1 - CORREÇÃO: Erro pedido[7].split is not a function (proteção com toString)',
    'v10.1 - ADICÃO: Funções editarUsuario e excluirUsuario (stubs para v10.2)',
    'v10.0 - GRANDE ATUALIZAÇÃO: UX profissional + Controle de permissões avançado',
    'v10.0 - Modal de sucesso bonito com animações CSS',
    'v10.0 - Gestão de Usuários funcionando (botão Ver Usuários)',
    'v10.0 - Controle de abas por perfil (Funcionário vê apenas 2 abas)',
    'v10.0 - Filtro automático de pedidos por usuário (Funcionário)',
    'v10.0 - Controle de edição de status (apenas Gestor/Admin)',
    'v10.0 - Exportação CSV de produtos implementada',
    'v10.0 - Funções backend: __listarUsuarios e __exportarProdutosCSV',
    'v9.3 - CORREÇÃO CRÍTICA: Bug de case-sensitive em permissões (Admin vs ADMIN)',
    'v9.3 - Aba "Gestão de Pedidos" agora aparece corretamente para Admin',
    'v9.3 - Aba Configurações agora acessível para usuários Admin',
    'v9.3 - Verificação case-insensitive em todas as checagens de permissão',
    'v9.2 - Correção erro "Cannot set properties of null" (renderPedidosTable)',
    'v9.2 - Adicionados logs de debug extensivos para diagnóstico',
    'v9.2 - Proteção contra elemento não encontrado no DOM',
    'v9.2 - Melhor rastreamento de permissões de usuário',
    'v9.1 - Correção loop infinito no catálogo de pedidos',
    'v9.1 - Remoção de preços (apenas quantidade e estoque)',
    'v9.1 - Seleção de tipo ANTES do catálogo (dropdown obrigatório)',
    'v9.1 - Nova aba "Gestão de Pedidos" (Admin/Gestor)',
    'v9.1 - Renomeação: "Pedidos" para "Abrir Pedido"',
    'v9.1 - Busca de nome real do usuário (não email)',
    'v9.0 - Novo modal de pedidos com catálogo visual',
    'v9.0 - Controle de status por perfil (Gestor/Admin)',
    'v9.0 - Interface aprimorada com imagens e estoque',
    'v8.0 - Reestruturação completa com 8 abas',
    'v8.0 - Nova aba Solicitação',
    'v8.0 - Upload de imagens de produtos',
    'v8.0 - 8 tipos de relatórios avançados',
    'v8.0 - Baixa de produtos em pedidos',
    'v8.0 - Correções de bugs (Movimentação e Configurações)'
  ]
};

/**
 * Função auxiliar para obter índice de coluna por nome
 * @param {string} aba - Nome da aba
 * @param {string} coluna - Nome da coluna
 * @returns {number} - Índice da coluna (1-based)
 */
function getIndiceColuna(aba, coluna) {
  const mapeamento = {
    'Produtos': CONFIG.COLUNAS_PRODUTOS,
    'Pedidos': CONFIG.COLUNAS_PEDIDOS,
    'Estoque': CONFIG.COLUNAS_ESTOQUE,
    'Movimentações Estoque': CONFIG.COLUNAS_MOVIMENTACOES
  };

  const colunas = mapeamento[aba];
  if (!colunas) {
    throw new Error('Aba não encontrada: ' + aba);
  }

  if (!colunas[coluna]) {
    throw new Error('Coluna não encontrada: ' + coluna + ' na aba ' + aba);
  }

  return colunas[coluna];
}

/**
 * Função auxiliar para validar status de pedido
 * @param {string} status - Status a validar
 * @returns {boolean} - True se válido
 */
function isStatusValido(status) {
  return Object.values(CONFIG.STATUS_PEDIDOS).includes(status);
}

/**
 * Função auxiliar para validar tipo de produto
 * @param {string} tipo - Tipo a validar
 * @returns {boolean} - True se válido
 */
function isTipoProdutoValido(tipo) {
  return Object.values(CONFIG.TIPOS_PRODUTOS).includes(tipo);
}

/**
 * Função auxiliar para validar perfil de usuário
 * @param {string} perfil - Perfil a validar
 * @returns {boolean} - True se válido
 */
function isPerfilValido(perfil) {
  return Object.values(CONFIG.PERFIS).includes(perfil);
}

/**
 * Função para verificar se usuário tem permissão
 * @param {string} perfilUsuario - Perfil do usuário
 * @param {string} funcionalidade - Nome da funcionalidade
 * @returns {boolean} - True se tem permissão
 */
function temPermissao(perfilUsuario, funcionalidade) {
  const permissoes = {
    'Dashboard': ['Admin', 'Gestor'],
    'Solicitacao': ['Admin', 'Gestor', 'Funcionario'],
    'Pedidos': ['Admin', 'Gestor', 'Funcionario'],
    'Produtos': ['Admin', 'Gestor'],
    'Estoque': ['Admin', 'Gestor'],
    'Movimentacao': ['Admin', 'Gestor'],
    'Relatorios': ['Admin', 'Gestor'],
    'Configuracoes': ['Admin']
  };

  const perfisPermitidos = permissoes[funcionalidade];
  if (!perfisPermitidos) {
    return false;
  }

  return perfisPermitidos.includes(perfilUsuario);
}

// Exportar CONFIG como global
this.CONFIG = CONFIG;
