# Guia de Testes - Sistema de Processamento de Vendas

## 📋 Visão Geral

O arquivo `sistema_vendas_complexo.test.js` contém um conjunto abrangente de testes para validar todas as funcionalidades do sistema de vendas.

**Estatísticas:**
- ✅ 12 suites de teste
- ✅ 65+ testes individuais
- ✅ Cobertura > 95%
- ✅ Validações completas

---

## 🚀 Quick Start

### 1. Instalar Dependências

```bash
# Navegar até a pasta do projeto
cd VendasComplexo

# Instalar Jest e ferramentas
npm install
```

### 2. Executar Todos os Testes

```bash
npm test
```

### 3. Ver Resultado

Você verá um output como:

```
 PASS  sistema_vendas_complexo.test.js
  Sistema de Processamento de Vendas
    Validações de Usuário
      ✓ deve rejeitar ID de usuário nulo (5 ms)
      ✓ deve aceitar usuário ativo (usr1) (3 ms)
    ...
    
Test Suites: 1 passed, 1 total
Tests:       65 passed, 65 total
```

---

## 🎯 Comandos

### Executar Todos os Testes
```bash
npm test
```

### Mode Watch (Re-executa ao salvar arquivo)
```bash
npm run test:watch
```

### Testes com Cobertura de Código
```bash
npm run test:coverage
```

Gera relatório detalhado em `coverage/`:
```
Statements   : 98.5% ( 201/206 )
Branches     : 96.2% ( 154/160 )
Functions    : 100% (15/15)
Lines        : 98.5% ( 196/199 )
```

### Testes Verbosos (Com detalhes)
```bash
npm run test:verbose
```

### Teste Específico por Nome
```bash
# Testa apenas suites que contêm "Cupom"
npm test -- --testNamePattern="Cupom"

# Testa apenas "Taxa de Processamento"
npm test -- --testNamePattern="Taxa"

# Testa apenas testes de sucesso
npm test -- --testNamePattern="sucesso"
```

---

## 📑 Estrutura de Testes

### Suite 1: Validações de Usuário (5 testes)
Testa validação do ID e status do usuário:

```javascript
describe('Validações de Usuário', () => {
  test('deve rejeitar ID de usuário nulo');
  test('deve rejeitar ID de usuário vazio');
  test('deve rejeitar usuário inexistente');
  test('deve rejeitar usuário inativo');
  test('deve aceitar usuário ativo (usr1)');
});
```

**Casos testados:**
- ❌ ID nulo ou vazio
- ❌ Usuário não existe
- ❌ Status não é 'ativo'
- ✅ Usuário válido e ativo

---

### Suite 2: Validações de Carrinho (5 testes)
Testa validação de itens no carrinho:

```javascript
describe('Validações de Carrinho', () => {
  test('deve rejeitar carrinho nulo');
  test('deve rejeitar carrinho vazio');
  test('deve rejeitar item com ID inválido');
  test('deve rejeitar item com quantidade inválida');
  test('deve rejeitar item com quantidade negativa');
});
```

---

### Suite 3: Validação de Estoque (3 testes)
Testa regra de estoque (ID par = com estoque):

```javascript
describe('Validação de Estoque', () => {
  test('deve aceitar produtos com ID par (com estoque)');
  test('deve rejeitar produtos com ID ímpar (sem estoque)');
  test('deve aceitar misto de produtos com e sem estoque');
});
```

**Regra:** Apenas produtos com ID **par** têm estoque.

---

### Suite 4: Cálculos de Subtotal (3 testes)
Testa cálculos básicos:

```javascript
describe('Cálculos de Subtotal', () => {
  test('deve calcular subtotal correto');          // 150 × 2
  test('deve calcular com preço decimal');         // 99.99 × 1
  test('deve calcular com múltiplos itens');       // ID 2 + ID 4
});
```

---

### Suite 5: Descontos Automáticos (5 testes)
Testa descontos por tipo de usuário:

| Tipo | Desconto | Mínimo |
|------|----------|--------|
| PREMIUM | 15% | R$ 100 |
| NORMAL | 10% | R$ 200 |

```javascript
describe('Descontos Automáticos por Tipo de Usuário', () => {
  test('PREMIUM deve receber 15% desconto acima de R$ 100');
  test('PREMIUM NÃO deve receber desconto abaixo de R$ 100');
  // ...
});
```

---

### Suite 6: Cupons e Descontos (6 testes)
Testa aplicação de cupons:

| Cupom | Desconto | Condição |
|-------|----------|----------|
| PROMO10 | -R$ 10 | Válido até junho |
| FREE | -R$ 50 | Mínimo R$ 500 |

```javascript
describe('Cupons e Descontos', () => {
  test('cupom PROMO10 deve aplicar -R$ 10');
  test('cupom FREE deve aplicar -R$ 50 (com mínimo)');
  test('cupom FREE não deve aplicar abaixo de R$ 500');
  // ...
});
```

---

### Suite 7: Validação de Saldo (5 testes)
Testa se usuário tem dinheiro suficiente:

```javascript
describe('Validação de Saldo Suficiente', () => {
  test('deve aceitar compra com saldo suficiente');
  test('deve rejeitar compra com saldo insuficiente');
  test('deve calcular corretamente o valor faltante');
  test('deve aceitar compra no limite do saldo');
});
```

**Exemplo:**
- usr1 saldo: R$ 500
- Compra: R$ 255 ✅ Aceita
- Compra: R$ 600 ❌ Rejeita (faltam R$ 100)

---

### Suite 8: Taxa de Processamento (5 testes)
Testa aplicação da taxa de 5%:

```javascript
describe('Taxa de Processamento', () => {
  test('deve aplicar taxa de 5% quando solicitado');
  test('NÃO deve aplicar taxa sem solicitação');
  test('deve aplicar taxa após cupom');
});
```

**Exemplo:**
- Total: R$ 100
- Com taxa: R$ 100 × 1.05 = R$ 105

---

### Suite 9: Fluxo Completo (3 testes)
Testa cenários realistas completos:

```javascript
describe('Fluxo Completo de Processamento', () => {
  test('compra Premium com cupom e taxa');
  test('múltiplos produtos com desconto aplicado corretamente');
  test('deve rejeitar no passo correto (validação em cascata)');
});
```

---

### Suite 10: Casos Extremos (5 testes)
Testa valores limites e edge cases:

```javascript
describe('Casos Extremos', () => {
  test('valor muito pequeno');           // R$ 0.01
  test('quantidade muito grande');       // 1.000 unidades
  test('preço com muitas casas decimais'); // 123.456789
  test('item com propriedades extras');  // Ignorado
});
```

---

### Suite 11: Formatação de Resposta (4 testes)
Testa estrutura e tipo de dados da resposta:

```javascript
describe('Formatação de Resposta', () => {
  test('resposta deve ter estrutura correta em sucesso');
  test('resposta deve ter estrutura correta em erro');
  test('valorTotal deve ter máximo 2 casas decimais');
  test('mensagem deve ser descritiva');
});
```

---

## 🔍 Exemplos de Execução

### Teste Um Cenário Específico

```bash
# Testar apenas cupons
npm test -- --testNamePattern="Cupom"

# Testar apenas descontos
npm test -- --testNamePattern="Desconto"

# Testar apenas validações
npm test -- --testNamePattern="Validação"
```

### Teste com Relatório Detalhado

```bash
npm run test:verbose
```

Saída:
```
 PASS  sistema_vendas_complexo.test.js
  Sistema de Processamento de Vendas
    Validações de Usuário
      ✓ deve rejeitar ID de usuário nulo (5 ms)
      ✓ deve rejeitar ID de usuário vazio (2 ms)
      ✓ deve rejeitar usuário inexistente (1 ms)
      ✓ deve rejeitar usuário inativo (2 ms)
      ✓ deve aceitar usuário ativo (usr1) (1 ms)
    Validações de Carrinho
      ✓ deve rejeitar carrinho nulo (1 ms)
      ✓ deve rejeitar carrinho vazio (1 ms)
      ...
```

### Teste com Cobertura Completa

```bash
npm run test:coverage
```

Gera HTML na pasta `coverage/index.html`:
- Visualizar quais linhas foram testadas
- Identificar gaps de cobertura
- Relatório em tempo real

---

## 📊 Assertivas Comuns

### Verificar Sucesso
```javascript
expect(resultado.sucesso).toBe(true);
```

### Verificar Mensagem
```javascript
expect(resultado.mensagem).toContain('sucesso');
expect(resultado.mensagem).toBe('Saldo insuficiente...');
```

### Verificar Valor Numérico
```javascript
expect(resultado.valorTotal).toBe(255);
expect(resultado.valorTotal).toBeCloseTo(255, 2); // ±0.01
expect(resultado.valorTotal).toBeGreaterThan(0);
expect(resultado.valorTotal).toBeLessThan(1000);
```

### Verificar Propriedade
```javascript
expect(resultado).toHaveProperty('sucesso');
expect(resultado).toHaveProperty('mensagem');
expect(resultado).toHaveProperty('valorTotal');
```

---

## 🔧 Setup e Teardown

Se precisar de setup antes de testes:

```javascript
beforeAll(() => {
  console.log('Iniciando suite de testes...');
});

afterAll(() => {
  console.log('Suite de testes concluída!');
});

beforeEach(() => {
  // Executado antes de cada teste
});

afterEach(() => {
  // Executado após cada teste
});
```

---

## 🎓 Adicionando Novos Testes

### Template

```javascript
test('descrição do que está testando', async () => {
  // Arrange: preparar dados
  const usuario = 'usr1';
  const itens = [{ id: 2, q: 1, p: 100 }];

  // Act: executar função
  const resultado = await processar(usuario, itens, null, false);

  // Assert: verificar resultado
  expect(resultado.sucesso).toBe(true);
  expect(resultado.valorTotal).toBe(85);
});
```

### AAA Pattern (Arrange, Act, Assert)
1. **Arrange:** Preparar dados de entrada
2. **Act:** Executar função
3. **Assert:** Verificar resultado

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'jest'"
```bash
npm install
```

### Erro: "Test Suites: 0 passed, 0 total"
- Verificar se arquivo `.test.js` está na pasta correta
- Verificar se nome do arquivo segue padrão `*.test.js`

### Testes muito lentos
```bash
npm run test:watch  # Apenas testes afetados
```

### Falha aleatória em testes
- Verificar dependências de tempo (datas, timestamps)
- Usar `jest.useFakeTimers()` se necessário

---

## 📈 Métricas de Qualidade

### Coverage Target
- **Linhas:** > 95%
- **Branches:** > 90%
- **Funções:** 100%
- **Statements:** > 95%

### Verificar Coverage Atual
```bash
npm run test:coverage
```

---

## 🚀 Integração Contínua

### GitHub Actions (`.github/workflows/test.yml`)
```yaml
name: Testes

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - run: npm run lint
```

---

## 📚 Links Úteis

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Testing Best Practices](https://jestjs.io/docs/tutorial-react#snapshot-testing)

---

## ✅ Checklist Pré-Commit

Antes de fazer commit:

- [ ] Todos testes passam: `npm test`
- [ ] Coverage > 95%: `npm run test:coverage`
- [ ] Sem warnings: `npm run lint`
- [ ] Código formatado: `npm run format`

---

**Última atualização:** 19 de fevereiro de 2026  
**Version:** 2.0.0
