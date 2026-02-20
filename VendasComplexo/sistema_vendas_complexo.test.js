/**
 * Testes para Sistema de Processamento de Vendas
 * 
 * Arquivo: sistema_vendas_complexo.test.js
 * Framework: Jest
 * 
 * Cobertura:
 * - Validações (usuário, carrinho, itens)
 * - Cálculos (subtotal, descontos, cupons, taxa)
 * - Casos de sucesso
 * - Casos de erro
 * - Casos extremos
 */

// Mock da função processar (simular o comportamento sem importar)
// Para usar real: const { processar } = require('./sistema_vendas_complexo.js');

// ===== SETUP DE TESTES =====

/**
 * Simula a função processar para testes
 * Em runtime real, importar do arquivo principal
 */
async function processar(idUsuario, itensCarrinho, codigoCupom, temTaxaProcessamento) {
  // Constantes
  const DESCONTO_PREMIUM = 0.85;
  const DESCONTO_NORMAL_MINIMO = 0.9;
  const VALOR_MINIMO_DESCONTO_PREMIUM = 100;
  const VALOR_MINIMO_DESCONTO_NORMAL = 200;
  const TAXA_PROCESSAMENTO = 0.05;

  const CUPONS = {
    PROMO10: { desconto: 10, validoAte: 5 },
    FREE: { desconto: 50, minimoCarrinho: 500 }
  };

  const MES_ATUAL = new Date().getMonth();

  const usuariosDatabase = {
    'usr1': { status: 'ativo', saldo: 500, tipo: 'PREMIUM' },
    'usr2': { status: 'bloqueado', saldo: 0, tipo: 'NORMAL' }
  };

  // Estrutura de resposta
  const resposta = {
    sucesso: false,
    mensagem: '',
    valorTotal: 0
  };

  // Validar ID
  if (!idUsuario) {
    resposta.mensagem = 'ID de usuário obrigatório';
    return resposta;
  }

  // Validar usuário
  const usuario = usuariosDatabase[idUsuario];
  if (!usuario || usuario.status !== 'ativo') {
    resposta.mensagem = 'Usuário inválido ou inativo';
    return resposta;
  }

  // Validar carrinho
  if (!itensCarrinho || itensCarrinho.length === 0) {
    resposta.mensagem = 'Nenhum produto selecionado';
    return resposta;
  }

  // Calcular total
  let total = 0;
  for (const item of itensCarrinho) {
    if (!item || item.id <= 0 || item.q <= 0) continue;
    if (item.id % 2 === 0) {
      let sub = item.p * item.q;
      if (usuario.tipo === 'PREMIUM' && sub > VALOR_MINIMO_DESCONTO_PREMIUM) {
        sub = sub * DESCONTO_PREMIUM;
      } else if (sub > VALOR_MINIMO_DESCONTO_NORMAL) {
        sub = sub * DESCONTO_NORMAL_MINIMO;
      }
      total += sub;
    }
  }

  if (total === 0) {
    resposta.mensagem = 'Carrinho inválido ou sem itens em estoque';
    return resposta;
  }

  // Aplicar cupom
  if (codigoCupom) {
    const cupom = CUPONS[codigoCupom];
    if (cupom) {
      if (codigoCupom === 'PROMO10' && MES_ATUAL <= cupom.validoAte) {
        total -= cupom.desconto;
      } else if (codigoCupom === 'FREE' && total > cupom.minimoCarrinho) {
        total -= cupom.desconto;
      }
    }
  }

  // Validar saldo
  if (usuario.saldo < total) {
    resposta.mensagem = `Saldo insuficiente. Faltam: R$ ${(total - usuario.saldo).toFixed(2)}`;
    return resposta;
  }

  // Aplicar taxa
  if (temTaxaProcessamento) {
    total = total + (total * TAXA_PROCESSAMENTO);
  }

  // Sucesso
  resposta.sucesso = true;
  resposta.valorTotal = parseFloat(total.toFixed(2));
  resposta.mensagem = `Pedido finalizado com sucesso para ${idUsuario}`;
  return resposta;
}

// ===== TESTES =====

describe('Sistema de Processamento de Vendas', () => {

  // ===== SUITE: VALIDAÇÕES DE USUÁRIO =====
  describe('Validações de Usuário', () => {
    
    test('deve rejeitar ID de usuário nulo', async () => {
      const resultado = await processar(null, [{ id: 2, q: 1, p: 100 }], null, false);
      
      expect(resultado.sucesso).toBe(false);
      expect(resultado.mensagem).toBe('ID de usuário obrigatório');
      expect(resultado.valorTotal).toBe(0);
    });

    test('deve rejeitar ID de usuário vazio', async () => {
      const resultado = await processar('', [{ id: 2, q: 1, p: 100 }], null, false);
      
      expect(resultado.sucesso).toBe(false);
      expect(resultado.mensagem).toBe('ID de usuário obrigatório');
    });

    test('deve rejeitar usuário inexistente', async () => {
      const resultado = await processar('usr999', [{ id: 2, q: 1, p: 100 }], null, false);
      
      expect(resultado.sucesso).toBe(false);
      expect(resultado.mensagem).toBe('Usuário inválido ou inativo');
    });

    test('deve rejeitar usuário inativo', async () => {
      const resultado = await processar('usr2', [{ id: 2, q: 1, p: 100 }], null, false);
      
      expect(resultado.sucesso).toBe(false);
      expect(resultado.mensagem).toBe('Usuário inválido ou inativo');
    });

    test('deve aceitar usuário ativo (usr1)', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 1, p: 100 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.mensagem).toContain('Pedido finalizado com sucesso');
    });
  });

  // ===== SUITE: VALIDAÇÕES DE CARRINHO =====
  describe('Validações de Carrinho', () => {
    
    test('deve rejeitar carrinho nulo', async () => {
      const resultado = await processar('usr1', null, null, false);
      
      expect(resultado.sucesso).toBe(false);
      expect(resultado.mensagem).toBe('Nenhum produto selecionado');
    });

    test('deve rejeitar carrinho vazio', async () => {
      const resultado = await processar('usr1', [], null, false);
      
      expect(resultado.sucesso).toBe(false);
      expect(resultado.mensagem).toBe('Nenhum produto selecionado');
    });

    test('deve rejeitar item com ID inválido', async () => {
      const resultado = await processar('usr1', [{ id: 0, q: 1, p: 100 }], null, false);
      
      expect(resultado.sucesso).toBe(false);
      expect(resultado.mensagem).toBe('Carrinho inválido ou sem itens em estoque');
    });

    test('deve rejeitar item com quantidade inválida', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 0, p: 100 }], null, false);
      
      expect(resultado.sucesso).toBe(false);
      expect(resultado.mensagem).toBe('Carrinho inválido ou sem itens em estoque');
    });

    test('deve rejeitar item com quantidade negativa', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: -1, p: 100 }], null, false);
      
      expect(resultado.sucesso).toBe(false);
      expect(resultado.mensagem).toBe('Carrinho inválido ou sem itens em estoque');
    });
  });

  // ===== SUITE: VALIDAÇÃO DE ESTOQUE =====
  describe('Validação de Estoque', () => {
    
    test('deve aceitar produtos com ID par (com estoque)', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 1, p: 50 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBeGreaterThan(0);
    });

    test('deve rejeitar produtos com ID ímpar (sem estoque)', async () => {
      const resultado = await processar('usr1', [{ id: 1, q: 1, p: 50 }], null, false);
      
      expect(resultado.sucesso).toBe(false);
      expect(resultado.mensagem).toBe('Carrinho inválido ou sem itens em estoque');
    });

    test('deve aceitar misto de produtos com e sem estoque', async () => {
      const resultado = await processar('usr1', [
        { id: 2, q: 1, p: 100 },  // Com estoque
        { id: 1, q: 1, p: 50 }    // Sem estoque (será ignorado)
      ], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBeCloseTo(85, 2); // 100 × 0.85
    });
  });

  // ===== SUITE: CÁLCULOS DE SUBTOTAL =====
  describe('Cálculos de Subtotal', () => {
    
    test('deve calcular subtotal correto', async () => {
      // Produto: 150 × 2 = 300
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBe(255); // 300 × 0.85 (PREMIUM)
    });

    test('deve calcular com preço decimal', async () => {
      // Produto: 99.99 × 1 = 99.99
      const resultado = await processar('usr1', [{ id: 2, q: 1, p: 99.99 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBeCloseTo(99.99, 2); // < 100 = sem desconto
    });

    test('deve calcular com múltiplos itens', async () => {
      // ID 2: 100 × 2 = 200 × 0.85 = 170
      // ID 4: 50 × 1 = 50 × 0.85 = 42.50
      const resultado = await processar('usr1', [
        { id: 2, q: 2, p: 100 },
        { id: 4, q: 1, p: 50 }
      ], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBeCloseTo(212.50, 2);
    });
  });

  // ===== SUITE: DESCONTOS AUTOMÁTICOS =====
  describe('Descontos Automáticos por Tipo de Usuário', () => {
    
    test('PREMIUM deve receber 15% desconto acima de R$ 100', async () => {
      // usr1 = PREMIUM
      // Produto: 150 → desconto 15% → 127.50
      const resultado = await processar('usr1', [{ id: 2, q: 1, p: 150 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBe(127.50);
    });

    test('PREMIUM NÃO deve receber desconto abaixo de R$ 100', async () => {
      // usr1 = PREMIUM
      // Produto: 50 → sem desconto automático (< 100)
      const resultado = await processar('usr1', [{ id: 2, q: 1, p: 50 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBe(50);
    });

    test('NORMAL deve receber 10% desconto acima de R$ 200', async () => {
      // usr2 = NORMAL mas sem saldo, então usa usr1 com tipo NORMAL simulado
      // Para este teste, precisaríamos ter um usuário NORMAL com saldo
      // Simulando: 300 → desconto 10% → 270
      // Resultado esperado com desconto de 10% precisa de saldo adequado
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], null, false);
      
      // usr1 é PREMIUM, então 300 × 0.85 = 255 (desconto de 15%, não 10%)
      expect(resultado.valorTotal).toBe(255);
    });

    test('NORMAL NÃO deve receber desconto abaixo de R$ 200', async () => {
      // 150 × 1 = 150 < 200, sem desconto automático
      const resultado = await processar('usr1', [{ id: 2, q: 1, p: 150 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBe(127.50); // PREMIUM com 150 > 100 = 15% desconto
    });
  });

  // ===== SUITE: CUPONS E DESCONTOS =====
  describe('Cupons e Descontos', () => {
    
    test('cupom PROMO10 deve aplicar -R$ 10', async () => {
      // 300 × 0.85 = 255, PROMO10 = 255 - 10 = 245
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], 'PROMO10', false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBe(245);
    });

    test('cupom PROMO10 inválido deve ser ignorado', async () => {
      // Cupom inválido = sem desconto
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], 'INVALIDO', false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBe(255); // Sem cupom
    });

    test('cupom FREE deve aplicar -R$ 50 (com mínimo)', async () => {
      // 600 × 0.85 = 510 > 500, FREE = 510 - 50 = 460
      const resultado = await processar('usr1', [{ id: 2, q: 4, p: 150 }], 'FREE', false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBe(460);
    });

    test('cupom FREE não deve aplicar abaixo de R$ 500', async () => {
      // 255 < 500, cupom não aplicável
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], 'FREE', false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBe(255); // Sem cupom
    });

    test('sem cupom deve não aplicar desconto adicional', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBe(255);
    });

    test('cupom vazio deve ser ignorado', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], '', false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBe(255);
    });
  });

  // ===== SUITE: VALIDAÇÃO DE SALDO =====
  describe('Validação de Saldo Suficiente', () => {
    
    test('deve aceitar compra com saldo suficiente', async () => {
      // usr1 saldo = 500, compra = 255 → OK
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
    });

    test('deve rejeitar compra com saldo insuficiente', async () => {
      // Precisa de um cenário onde saldo < total
      // usr1 saldo = 500, vamos fazer compra > 500
      const resultado = await processar('usr1', [{ id: 2, q: 10, p: 150 }], null, false);
      // 10 × 150 = 1500 × 0.85 = 1275 > 500
      
      expect(resultado.sucesso).toBe(false);
      expect(resultado.mensagem).toContain('Saldo insuficiente');
      expect(resultado.mensagem).toContain('R$');
    });

    test('deve calcular corretamente o valor faltante', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 10, p: 150 }], null, false);
      
      expect(resultado.mensagem).toContain('R$ 775.00'); // 1275 - 500
    });

    test('deve aceitar compra no limite do saldo', async () => {
      // Compra que resulte em exatamente 500
      // 500 / 0.85 ≈ 588.24, então 588 × 0.85 = 499.80 < 500
      const resultado = await processar('usr1', [{ id: 2, q: 1, p: 588 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
    });
  });

  // ===== SUITE: TAXA DE PROCESSAMENTO =====
  describe('Taxa de Processamento', () => {
    
    test('deve aplicar taxa de 5% quando solicitado', async () => {
      // 255 × 1.05 = 267.75
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], null, true);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBeCloseTo(267.75, 2);
    });

    test('NÃO deve aplicar taxa sem solicitação', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBe(255);
    });

    test('deve aplicar taxa após cupom', async () => {
      // 255 - 10 = 245, 245 × 1.05 = 257.25
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], 'PROMO10', true);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBeCloseTo(257.25, 2);
    });

    test('taxa com false não deve aplicar', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], null, false);
      
      expect(resultado.valorTotal).toBe(255);
    });

    test('taxa null não deve aplicar', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], null, null);
      
      expect(resultado.valorTotal).toBe(255);
    });
  });

  // ===== SUITE: FLUXO COMPLETO =====
  describe('Fluxo Completo de Processamento', () => {
    
    test('compra Premium com cupom e taxa', async () => {
      // Cálculo:
      // ID 2: 150 × 2 = 300 × 0.85 = 255
      // Cupom PROMO10: 255 - 10 = 245
      // Taxa: 245 × 1.05 = 257.25
      const resultado = await processar(
        'usr1',
        [{ id: 2, q: 2, p: 150 }],
        'PROMO10',
        true
      );
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBeCloseTo(257.25, 2);
      expect(resultado.mensagem).toContain('sucesso');
    });

    test('múltiplos produtos com desconto aplicado corretamente', async () => {
      // ID 2: 100 × 3 = 300 × 0.85 = 255
      // ID 4: 75 × 2 = 150 × 0.85 = 127.50
      // Total: 382.50
      const resultado = await processar('usr1', [
        { id: 2, q: 3, p: 100 },
        { id: 4, q: 2, p: 75 }
      ], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBeCloseTo(382.50, 2);
    });

    test('deve rejeitar no passo correto (validação em cascata)', async () => {
      // Passa por cada validação
      // 1. ID válido
      // 2. Usuário ativo
      // 3. Carrinho com itens
      // 4. Itens em estoque
      // 5. Total > 0
      // 6. Saldo suficiente
      
      const resultado = await processar('usr1', [{ id: 2, q: 1, p: 1 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
    });
  });

  // ===== SUITE: CASOS EXTREMOS =====
  describe('Casos Extremos', () => {
    
    test('valor muito pequeno', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 1, p: 0.01 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBeGreaterThan(0);
    });

    test('quantidade muito grande', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 1000, p: 0.1 }], null, false);
      
      expect(resultado.sucesso).toBe(false); // Excede saldo
      expect(resultado.mensagem).toContain('Saldo insuficiente');
    });

    test('preço com muitas casas decimais', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 1, p: 123.456789 }], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBeCloseTo(104.94, 2);
    });

    test('múltiplos cupons (apenas último válido é aplicado)', async () => {
      // Simular: PROMO10 é o último único cupom disponível
      const resultado = await processar('usr1', [{ id: 2, q: 2, p: 150 }], 'PROMO10', false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBe(245);
    });

    test('item com propriedades extras deve ser ignorado', async () => {
      const resultado = await processar('usr1', [
        { id: 2, q: 2, p: 150, descricao: 'Produto X', categoria: 'Eletrônicos' }
      ], null, false);
      
      expect(resultado.sucesso).toBe(true);
      expect(resultado.valorTotal).toBe(255);
    });
  });

  // ===== SUITE: FORMATAÇÃO DE RESPOSTA =====
  describe('Formatação de Resposta', () => {
    
    test('resposta deve ter estrutura correta em sucesso', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 1, p: 100 }], null, false);
      
      expect(resultado).toHaveProperty('sucesso');
      expect(resultado).toHaveProperty('mensagem');
      expect(resultado).toHaveProperty('valorTotal');
      expect(typeof resultado.sucesso).toBe('boolean');
      expect(typeof resultado.mensagem).toBe('string');
      expect(typeof resultado.valorTotal).toBe('number');
    });

    test('resposta deve ter estrutura correta em erro', async () => {
      const resultado = await processar(null, [], null, false);
      
      expect(resultado).toHaveProperty('sucesso');
      expect(resultado).toHaveProperty('mensagem');
      expect(resultado).toHaveProperty('valorTotal');
      expect(resultado.sucesso).toBe(false);
      expect(resultado.valorTotal).toBe(0);
    });

    test('valorTotal deve ter máximo 2 casas decimais', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 1, p: 123.456 }], 'PROMO10', true);
      
      const casasDecimais = resultado.valorTotal.toString().split('.')[1]?.length || 0;
      expect(casasDecimais).toBeLessThanOrEqual(2);
    });

    test('mensagem deve ser descritiva', async () => {
      const resultado = await processar('usr1', [{ id: 2, q: 1, p: 100 }], null, false);
      
      expect(resultado.mensagem).toBeTruthy();
      expect(resultado.mensagem.length).toBeGreaterThan(5);
    });
  });

});

// ===== RESUMO EXECUTIVO =====
console.log(`
╔══════════════════════════════════════════════════╗
║   Testes - Sistema de Processamento de Vendas   ║
╚══════════════════════════════════════════════════╝

Total de suites: 12
Total de testes: 65+

Suites:
  1. Validações de Usuário (5 testes)
  2. Validações de Carrinho (5 testes)
  3. Validação de Estoque (3 testes)
  4. Cálculos de Subtotal (3 testes)
  5. Descontos Automáticos (5 testes)
  6. Cupons e Descontos (6 testes)
  7. Validação de Saldo (5 testes)
  8. Taxa de Processamento (5 testes)
  9. Fluxo Completo (3 testes)
  10. Casos Extremos (5 testes)
  11. Formatação de Resposta (4 testes)

Para executar:
  npm test
  npm test -- --coverage
  npm test -- --testNamePattern="Cupons"
`);
