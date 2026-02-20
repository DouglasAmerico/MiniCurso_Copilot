# Exemplos de Uso - Sistema de Processamento de Vendas

## Exemplos Práticos

### 1. Compra Premium com Desconto Tipo

```javascript
// Usuário PREMIUM compra produtos com valor > R$ 100
const resultado = await processar(
  'usr1',
  [{ id: 2, q: 1, p: 150 }],
  null,
  false
);

// Cálculo:
// - Produto ID 2: 150 × 1 = R$ 150
// - Desconto PREMIUM (15%): 150 × 0.85 = R$ 127.50
// - Sem cupom, sem taxa
// Resultado: { sucesso: true, valorTotal: 127.50, ... }
```

---

### 2. Compra Normal com Desconto (> R$ 200)

```javascript
// Usuário NORMAL compra produtos com valor > R$ 200
const resultado = await processar(
  'usr1',
  [
    { id: 2, q: 2, p: 150 },  // 300 total
  ],
  null,
  false
);

// Cálculo:
// - Desconto automático NORMAL (10%): 300 × 0.9 = R$ 270
// Resultado: { sucesso: true, valorTotal: 270, ... }
```

---

### 3. Aplicação de Cupom PROMO10

```javascript
// Cupom válido apenas até junho (mês 5)
// Data atual: fevereiro (mês 1) - VÁLIDO
const resultado = await processar(
  'usr1',
  [{ id: 2, q: 3, p: 100 }],  // 300 × 0.85 = 255
  'PROMO10',                   // -R$ 10
  false
);

// Resultado: { sucesso: true, valorTotal: 245, ... }
```

---

### 4. Cupom FREE com Validação de Mínimo

```javascript
// Cupom FREE requer carrinho > R$ 500
const resultado = await processar(
  'usr1',
  [{ id: 2, q: 4, p: 150 }],  // 600 × 0.85 = 510 (> 500)
  'FREE',                      // -R$ 50
  false
);

// Resultado: { sucesso: true, valorTotal: 460, ... }
```

---

### 5. Recusa de Cupom com Valor Menor

```javascript
// Cupom FREE não aplicável (total < R$ 500)
const resultado = await processar(
  'usr1',
  [{ id: 2, q: 2, p: 150 }],  // 300 × 0.85 = 255 (< 500)
  'FREE',                      // Cupom ignorado
  false
);

// Resultado: { sucesso: true, valorTotal: 255, ... }
```

---

### 6. Taxa de Processamento

```javascript
// Adiciona taxa de 5% ao final
const resultado = await processar(
  'usr1',
  [{ id: 2, q: 2, p: 100 }],  // 200 × 0.85 = 170
  'PROMO10',                    // -10 = 160
  true                          // Taxa 5%: 160 × 1.05 = 168
);

// Resultado: { sucesso: true, valorTotal: 168, ... }
```

---

### 7. Produtos Sem Estoque (ID Ímpar)

```javascript
// Produtos ID ímpar não têm estoque
const resultado = await processar(
  'usr1',
  [
    { id: 1, q: 2, p: 100 },  // Sem estoque → ignorado
    { id: 3, q: 1, p: 50 }    // Sem estoque → ignorado
  ],
  null,
  false
);

// Resultado: { 
//   sucesso: false, 
//   mensagem: 'Carrinho inválido ou sem itens em estoque'
// }
```

---

### 8. Misto: Itens com e sem Estoque

```javascript
// Alguns itens com estoque, outros sem
const resultado = await processar(
  'usr1',
  [
    { id: 2, q: 2, p: 100 },  // Tem estoque → 200 × 0.85 = 170
    { id: 3, q: 1, p: 50 },   // Sem estoque → ignorado (log)
    { id: 4, q: 1, p: 50 }    // Tem estoque → 50
  ],
  null,
  false
);

// Console:
// AVISO: Produto sem estoque - ID: 3

// Cálculo: 170 + 50 = 220
// Resultado: { sucesso: true, valorTotal: 220, ... }
```

---

### 9. Saldo Insuficiente

```javascript
// Usuário 2 tem saldo 0
const resultado = await processar(
  'usr2',
  [{ id: 2, q: 1, p: 50 }],
  null,
  false
);

// Resultado: { 
//   sucesso: false, 
//   mensagem: 'Saldo insuficiente. Faltam: R$ 50.00'
// }
```

---

### 10. Usuário Inativo

```javascript
// Usuário 2 tem status 'bloqueado'
const resultado = await processar(
  'usr2',
  [{ id: 2, q: 1, p: 100 }],
  null,
  false
);

// Resultado: { 
//   sucesso: false, 
//   mensagem: 'Usuário inválido ou inativo'
// }
```

---

### 11. ID Usuário Nulo

```javascript
const resultado = await processar(
  null,
  [{ id: 2, q: 1, p: 100 }],
  null,
  false
);

// Resultado: { 
//   sucesso: false, 
//   mensagem: 'ID de usuário obrigatório'
// }
```

---

### 12. Carrinho Vazio

```javascript
const resultado = await processar(
  'usr1',
  [],
  null,
  false
);

// Resultado: { 
//   sucesso: false, 
//   mensagem: 'Nenhum produto selecionado'
// }
```

---

## Exemplos de Integração

### Integração com Express.js

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Importar a função processar
// const { processar } = require('./sistema_vendas_complexo.js');

app.post('/api/pedidos', async (req, res) => {
  try {
    const { usuarioId, itens, cupom, comTaxa } = req.body;

    const resultado = await processar(
      usuarioId,
      itens,
      cupom,
      comTaxa || false
    );

    if (resultado.sucesso) {
      res.json({
        status: 'sucesso',
        pedido: resultado,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        status: 'erro',
        mensagem: resultado.mensagem
      });
    }
  } catch (erro) {
    res.status(500).json({
      status: 'erro',
      mensagem: 'Erro interno ao processar pedido'
    });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
```

**Request de Exemplo:**
```json
POST /api/pedidos
Content-Type: application/json

{
  "usuarioId": "usr1",
  "itens": [
    { "id": 2, "q": 2, "p": 150 }
  ],
  "cupom": "PROMO10",
  "comTaxa": true
}
```

**Response de Sucesso:**
```json
{
  "status": "sucesso",
  "pedido": {
    "sucesso": true,
    "mensagem": "Pedido finalizado com sucesso para usr1",
    "valorTotal": 514.25
  },
  "timestamp": "2026-02-19T14:35:00.000Z"
}
```

---

### Teste com CLI (Script Node)

```javascript
// teste_vendas.js
const processar = require('./sistema_vendas_complexo.js').processar;

// Array de casos de teste
const casos = [
  {
    nome: 'Compra Premium com cupom',
    params: ['usr1', [{ id: 2, q: 2, p: 150 }], 'PROMO10', true],
    esperado: { sucesso: true }
  },
  {
    nome: 'Saldo insuficiente',
    params: ['usr2', [{ id: 2, q: 1, p: 100 }], null, false],
    esperado: { sucesso: false }
  },
  {
    nome: 'Usuário inválido',
    params: ['usr999', [{ id: 2, q: 1, p: 100 }], null, false],
    esperado: { sucesso: false }
  }
];

// Executar testes
(async () => {
  for (const caso of casos) {
    const resultado = await processar(...caso.params);
    const passou = resultado.sucesso === caso.esperado.sucesso;
    
    console.log(`${passou ? '✓' : '✗'} ${caso.nome}`);
    console.log(`  Resultado: ${resultado.mensagem}`);
  }
})();
```

---

## Tabela Comparativa de Resultados

| Usuário | Itens | Cupom | Taxa | Esperado |
|---------|-------|-------|------|----------|
| usr1 (PREMIUM, R$ 500) | ID 2×2 × R$ 150 | PROMO10 | Sim | ✅ R$ 514.25 |
| usr1 (PREMIUM, R$ 500) | ID 2×1 × R$ 100 | - | Não | ✅ R$ 85.00 |
| usr1 (PREMIUM, R$ 500) | ID 1×1 × R$ 100 | - | Não | ❌ Sem estoque |
| usr2 (NORMAL, R$ 0) | ID 2×1 × R$ 100 | - | Não | ❌ Saldo insuficiente |
| null | ID 2×1 × R$ 100 | - | Não | ❌ ID obrigatório |

---

## Checklist de Implementação

Antes de usar em produção:

- [ ] Substituir `usuariosDatabase` por banco de dados real
- [ ] Adicionar autenticação JWT ou similar
- [ ] Implementar validação de entrada mais rigorosa
- [ ] Adicionar logs estruturados (Winston, Pino)
- [ ] Criar testes unitários
- [ ] Adicionar rate limiting
- [ ] Usar HTTPS em APIs
- [ ] Criptografar dados sensíveis
- [ ] Documentar mudanças futuras
- [ ] Configurar CI/CD

---

**Última atualização:** 19 de fevereiro de 2026
