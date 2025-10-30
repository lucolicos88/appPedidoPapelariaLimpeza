/**
 * ========================================
 * UTILITÁRIO DE SERIALIZAÇÃO v6.0.2
 * ========================================
 *
 * Resolve problemas de serialização entre Apps Script e Frontend
 * O google.script.run não serializa corretamente objetos Date
 */

/**
 * Converte todas as Dates em strings ISO para serialização
 */
function serializarParaFrontend(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Se for Date, converte para ISO string
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Se for array, processa cada elemento
  if (Array.isArray(obj)) {
    return obj.map(item => serializarParaFrontend(item));
  }

  // Se for objeto, processa cada propriedade
  if (typeof obj === 'object') {
    const novoObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        novoObj[key] = serializarParaFrontend(obj[key]);
      }
    }
    return novoObj;
  }

  // Tipos primitivos retornam como estão
  return obj;
}

/**
 * Converte strings ISO de volta para Date (para usar no frontend)
 */
function deserializarDoFrontend(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Se for string no formato ISO, tenta converter para Date
  if (typeof obj === 'string') {
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    if (isoDatePattern.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }

  // Se for array, processa cada elemento
  if (Array.isArray(obj)) {
    return obj.map(item => deserializarDoFrontend(item));
  }

  // Se for objeto, processa cada propriedade
  if (typeof obj === 'object') {
    const novoObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        novoObj[key] = deserializarDoFrontend(obj[key]);
      }
    }
    return novoObj;
  }

  // Tipos primitivos retornam como estão
  return obj;
}
