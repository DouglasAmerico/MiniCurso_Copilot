// ===== CONSTANTES =====
const DESCONTO_PREMIUM = 0.85;           // 15% de desconto
const DESCONTO_NORMAL_MINIMO = 0.9;      // 10% de desconto
const VALOR_MINIMO_DESCONTO_PREMIUM = 100;
const VALOR_MINIMO_DESCONTO_NORMAL = 200;
const TAXA_PROCESSAMENTO = 0.05;         // 5%
const VALOR_MINIMO_CUPOM_FREE = 500;

const CUPONS = {
  PROMO10: { desconto: 10, validoAte: 5 },   // Mês 5 (junho)
  FREE: { desconto: 50, minimoCarrinho: 500 }
};

const MES_ATUAL = new Date().getMonth();

// ===== BANCO DE DADOS MOCK =====
const usuariosDatabase = {
  'usr1': { status: 'ativo', saldo: 500, tipo: 'PREMIUM' },
  'usr2': { status: 'bloqueado', saldo: 0, tipo: 'NORMAL' }
};

// ===== VALIDAÇÕES =====
function validarIdUsuario(idUsuario) {
  if (!idUsuario) {
    return { valido: false, mensagem: 'ID de usuário obrigatório' };
  }
  return { valido: true };
}

function validarUsuarioAtivo(usuario, idUsuario) {
  if (!usuario || usuario.status !== 'ativo') {
    return { valido: false, mensagem: 'Usuário inválido ou inativo' };
  }
  return { valido: true };
}

function validarCarrinho(itens) {
  if (!itens || itens.length === 0) {
    return { valido: false, mensagem: 'Nenhum produto selecionado' };
  }
  return { valido: true };
}

function validarItemCarrinho(item) {
  return item && item.id > 0 && item.q > 0;
}

function temEstoque(idProduto) {
  return idProduto % 2 === 0;  // Produtos com ID par têm estoque
}

// ===== CÁLCULOS =====
function calcularSubtotal(preco, quantidade) {
  return preco * quantidade;
}

function aplicarDescontoTipo(subtotal, tipoUsuario) {
  if (tipoUsuario === 'PREMIUM' && subtotal > VALOR_MINIMO_DESCONTO_PREMIUM) {
    return subtotal * DESCONTO_PREMIUM;
  }
  if (subtotal > VALOR_MINIMO_DESCONTO_NORMAL) {
    return subtotal * DESCONTO_NORMAL_MINIMO;
  }
  return subtotal;
}

function aplicarCupomDesconto(totalCarrinho, codigoCupom) {
  if (!codigoCupom) {
    return totalCarrinho;
  }

  const cupom = CUPONS[codigoCupom];
  if (!cupom) {
    return totalCarrinho;
  }

  // Validar cupom PROMO10 por data
  if (codigoCupom === 'PROMO10' && MES_ATUAL <= cupom.validoAte) {
    return totalCarrinho - cupom.desconto;
  }

  // Validar cupom FREE por valor mínimo
  if (codigoCupom === 'FREE' && totalCarrinho > cupom.minimoCarrinho) {
    return totalCarrinho - cupom.desconto;
  }

  return totalCarrinho;
}

function aplicarTaxaProcessamento(total, temTaxa) {
  if (!temTaxa) {
    return total;
  }
  return total + (total * TAXA_PROCESSAMENTO);
}

function calcularTotalCarrinho(itens, tipoUsuario) {
  let total = 0;

  for (const item of itens) {
    if (!validarItemCarrinho(item)) {
      continue;
    }

    if (!temEstoque(item.id)) {
      console.warn(`AVISO: Produto sem estoque - ID: ${item.id}`);
      continue;
    }

    const subtotal = calcularSubtotal(item.p, item.q);
    const subtotalComDesconto = aplicarDescontoTipo(subtotal, tipoUsuario);
    total += subtotalComDesconto;
  }

  return total;
}

function validarSaldoSuficiente(saldoUsuario, totalCompra) {
  if (saldoUsuario < totalCompra) {
    const diferenca = totalCompra - saldoUsuario;
    return {
      valido: false,
      mensagem: `Saldo insuficiente. Faltam: R$ ${diferenca.toFixed(2)}`
    };
  }
  return { valido: true };
}

// ===== PROCESSAMENTO PRINCIPAL =====
async function processar(idUsuario, itensCarrinho, codigoCupom, temTaxaProcessamento) {
  // Estrutura de resposta padrão
  const resposta = {
    sucesso: false,
    mensagem: '',
    valorTotal: 0
  };

  // Validar ID do usuário
  const validacaoId = validarIdUsuario(idUsuario);
  if (!validacaoId.valido) {
    resposta.mensagem = validacaoId.mensagem;
    registrarOperacao();
    return resposta;
  }

  // Buscar usuário e validar status
  const usuario = usuariosDatabase[idUsuario];
  const validacaoUsuario = validarUsuarioAtivo(usuario, idUsuario);
  if (!validacaoUsuario.valido) {
    resposta.mensagem = validacaoUsuario.mensagem;
    registrarOperacao();
    return resposta;
  }

  // Validar carrinho
  const validacaoCarrinho = validarCarrinho(itensCarrinho);
  if (!validacaoCarrinho.valido) {
    resposta.mensagem = validacaoCarrinho.mensagem;
    registrarOperacao();
    return resposta;
  }

  // Calcular total do carrinho
  let totalCompra = calcularTotalCarrinho(itensCarrinho, usuario.tipo);

  // Validar se há itens em estoque
  if (totalCompra === 0) {
    resposta.mensagem = 'Carrinho inválido ou sem itens em estoque';
    registrarOperacao();
    return resposta;
  }

  // Aplicar cupom de desconto
  totalCompra = aplicarCupomDesconto(totalCompra, codigoCupom);

  // Validar saldo do usuário
  const validacaoSaldo = validarSaldoSuficiente(usuario.saldo, totalCompra);
  if (!validacaoSaldo.valido) {
    resposta.mensagem = validacaoSaldo.mensagem;
    registrarOperacao();
    return resposta;
  }

  // Aplicar taxa de processamento
  totalCompra = aplicarTaxaProcessamento(totalCompra, temTaxaProcessamento);

  // Processar pedido com sucesso
  try {
    resposta.sucesso = true;
    resposta.valorTotal = parseFloat(totalCompra.toFixed(2));
    resposta.mensagem = `Pedido finalizado com sucesso para ${idUsuario}`;
  } catch (erro) {
    resposta.mensagem = 'Erro interno ao processar pedido';
    console.error('ERRO:', erro);
  }

  registrarOperacao();
  return resposta;
}

function registrarOperacao() {
  const dataAtual = new Date().toISOString();
  console.log(`[${dataAtual}] Operação finalizada`);
}

// ===== EXEMPLOS DE USO =====
processar(
  'usr1',
  [{ id: 2, q: 2, p: 150 }, { id: 3, q: 1, p: 50 }],
  'PROMO10',
  true
).then(resultado => console.log(resultado));