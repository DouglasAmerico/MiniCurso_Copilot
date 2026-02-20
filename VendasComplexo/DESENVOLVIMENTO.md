# Guia de Desenvolvimento e Contribuições

## 1. Configuração do Ambiente

### Pré-requisitos
- Node.js v14.0.0+
- npm ou yarn
- Git
- Editor de código (VS Code recomendado)

### Setup Inicial
```bash
# Clone o repositório
git clone <repo-url>
cd VendasComplexo

# Instale dependências (quando houver)
npm install

# Valide a sintaxe
node -c sistema_vendas_complexo.js

# Execute testes
npm test
```

---

## 2. Estrutura de Branches

```
main (produção)
  ├── develop (desenvolvimento)
  │   ├── feature/adicionar-estoque-dinamico
  │   ├── feature/integrar-banco-dados
  │   └── bugfix/corrigir-calculo-desconto
```

### Convenção de Nomes
- `feature/` - Nova funcionalidade
- `bugfix/` - Correção de bug
- `docs/` - Atualização de documentação
- `refactor/` - Refatoração de código

---

## 3. Padrão de Código

### Nomenclatura
- **Variáveis e Funções:** camelCase
- **Constantes:** UPPER_SNAKE_CASE
- **Classes:** PascalCase
- **Booleanos:** prefixo `tem`, `é`, `pode`

### Exemplo
```javascript
// ✅ CORRETO
const TAXA_PROCESSAMENTO = 0.05;
function temEstoque(idProduto) { ... }
function validarIdUsuario(id) { ... }

// ❌ ERRADO
const taxa = 0.05;
function EstoqueValido(idProduto) { ... }
function validate_user(id) { ... }
```

### Formatação

```javascript
// ✅ Espaços e indentação
if (condicao === true) {
  console.log('Mensagem');
}

// ❌ Sem espaço após 'if'
if(condicao===true)console.log('Mensagem');
```

### Comentários

```javascript
// ✅ Comentário útil
// Produtos com ID par têm estoque no sistema
if (idProduto % 2 === 0) {
  // ...
}

// ✅ Comentário de seção
// ===== VALIDAÇÕES =====

// ❌ Comentário óbvio
// Incrementa i
i++;

// ❌ Comentário desatualizado
// Calcula desconto de 20% (era 20%, agora é 15%)
```

### Tamanho de Funções
- Máximo 30 linhas por função
- Uma responsabilidade por função
- Evite funções aninhadas profundas

---

## 4. Testes

### Executar Testes
```bash
# Todos os testes
npm test

# Teste específico
npm test -- --testNamePattern="compra Premium"

# Com cobertura
npm test -- --coverage
```

### Exemplo de Teste (Jest)
```javascript
// __tests__/sistema_vendas.test.js
describe('Sistema de Vendas', () => {
  
  test('processa compra PREMIUM com sucesso', async () => {
    const resultado = await processar(
      'usr1',
      [{ id: 2, q: 2, p: 150 }],
      'PROMO10',
      true
    );

    expect(resultado.sucesso).toBe(true);
    expect(resultado.valorTotal).toBeCloseTo(514.25, 2);
  });

  test('rejeita usuario inativo', async () => {
    const resultado = await processar('usr2', [], null, false);
    
    expect(resultado.sucesso).toBe(false);
    expect(resultado.mensagem).toContain('inativo');
  });

  test('calcula desconto PREMIUM corretamente', async () => {
    const resultado = await processar(
      'usr1',
      [{ id: 2, q: 1, p: 150 }],
      null,
      false
    );

    expect(resultado.valorTotal).toBe(127.50);
  });
});
```

### Coverage Esperado
- Declarações: > 95%
- Branches: > 90%
- Funções: 100%
- Linhas: > 95%

---

## 5. Processo de Pull Request

### 1. Criar Branch
```bash
git checkout -b feature/sua-feature
```

### 2. Fazer Commits Atômicos
```bash
# ✅ Bom
git commit -m "feat: adiciona validação de email"

# ❌ Ruim
git commit -m "fiz umas coisas"
```

### Formato de Commit (Conventional Commits)
```
<tipo>(<escopo>): <descrição>

<corpo>

<rodapé>
```

**Tipos:**
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Alteração em documentação
- `style:` Sem mudança de lógica
- `refactor:` Refatoração
- `test:` Adiciona testes
- `chore:` Alterações de build

**Exemplos:**
```bash
git commit -m "feat(cupom): adiciona validação de data de expiração"
git commit -m "fix(calculo): corrige desconto NORMAL acima de R$ 200"
git commit -m "docs: atualiza README com novos exemplos"
git commit -m "refactor: extrai função de calculo de desconto"
```

### 3. Push e PR
```bash
git push origin feature/sua-feature
```

### 4. Template de PR

```markdown
## Descrição
Breve descrição do que foi feito.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Atualização de docs

## Screenshots (se aplicável)
Adicione imagens se houver mudanças visuais.

## Tests
- [ ] Testes unitários adicionados
- [ ] Testes passando
- [ ] Coverage > 95%

## Checklist
- [ ] Código segue padrões
- [ ] Documentação atualizada
- [ ] Sem console.log em produção
- [ ] Sem código comentado
```

---

## 6. Linting e Formatação

### ESLint Setup
```bash
npm install --save-dev eslint
npx eslint --init
```

### Arquivo `.eslintrc.json`
```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12
  },
  "rules": {
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "no-unused-vars": ["warn"],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Prettier Setup
```bash
npm install --save-dev prettier
npx prettier --write sistema_vendas_complexo.js
```

### Executar Linting
```bash
npm run lint
npm run lint:fix
```

---

## 7. Documentação de Funções

### JSDoc Format

```javascript
/**
 * Calcula o subtotal de um item no carrinho.
 * 
 * @param {number} preco - Preço unitário do produto (ex: 150)
 * @param {number} quantidade - Quantidade de unidades (ex: 2)
 * 
 * @returns {number} Subtotal (preco × quantidade)
 * 
 * @example
 * calcularSubtotal(150, 2); // Retorna 300
 * 
 * @throws {TypeError} Se preco ou quantidade não forem números
 */
function calcularSubtotal(preco, quantidade) {
  return preco * quantidade;
}
```

### Exemplo de Documentação Completa

```javascript
/**
 * Processa um pedido completo com validações em cascata.
 * 
 * Realiza as seguintes operações em ordem:
 * 1. Valida ID do usuário
 * 2. Verifica status do usuário (deve estar ativo)
 * 3. Valida carrinho (não pode estar vazio)
 * 4. Calcula total com descontos automáticos
 * 5. Aplica cupom se válido
 * 6. Verifica saldo suficiente
 * 7. Aplica taxa de processamento
 * 
 * @async
 * @param {string} idUsuario - ID único do usuário (obrigatório)
 * @param {Array<Object>} itensCarrinho - Array de itens do carrinho
 * @param {number} itensCarrinho[].id - ID do produto
 * @param {number} itensCarrinho[].q - Quantidade
 * @param {number} itensCarrinho[].p - Preço unitário
 * @param {string} [codigoCupom] - Código de cupom (opcional)
 * @param {boolean} [temTaxaProcessamento=false] - Aplicar taxa de 5%
 * 
 * @returns {Promise<Object>} Objeto com resultado do processamento
 * @returns {boolean} resultado.sucesso - true se pedido aprovado
 * @returns {string} resultado.mensagem - Descrição do resultado
 * @returns {number} resultado.valorTotal - Valor final a pagar
 * 
 * @example
 * const resultado = await processar(
 *   'usr1',
 *   [{ id: 2, q: 2, p: 150 }],
 *   'PROMO10',
 *   true
 * );
 * // { sucesso: true, mensagem: '...', valorTotal: 514.25 }
 * 
 * @throws {Error} Em caso de exceção não prevista
 */
async function processar(
  idUsuario,
  itensCarrinho,
  codigoCupom,
  temTaxaProcessamento
) {
  // ... implementação
}
```

---

## 8. Versionamento (Semantic Versioning)

```
MAJOR.MINOR.PATCH
  1.0.0

MAJOR - Mudanças incompatíveis
MINOR - Novas funcionalidades (compatíveis)
PATCH - Correções de bug
```

**Exemplos:**
- `0.1.0` - Primeira release
- `1.0.0` - Versão estável
- `1.1.0` - Nova funcionalidade
- `1.1.1` - Correção de bug
- `2.0.0` - Breaking change

---

## 9. Changelog

### Arquivo `CHANGELOG.md`

```markdown
# Changelog

Todas as mudanças deste projeto serão documentadas neste arquivo.

## [2.0.0] - 2026-02-19

### Added
- Refatoração completa com clean code
- Nomes descritivos para parâmetros
- Separação de responsabilidades
- Constantes bem definidas

### Changed
- Estrutura de resposta (s/m/v -> sucesso/mensagem/valorTotal)
- Comparadores (== -> ===)
- Loops (for tradicional -> for...of)

### Fixed
- Bug no cálculo de desconto NORMAL

## [1.0.0] - 2026-02-01

### Added
- Sistema base de processamento de vendas
- Validações básicas
- Sistema de cupons
```

---

## 10. Checklist de Release

Antes de fazer release:

- [ ] Todos os testes passam
- [ ] Coverage > 95%
- [ ] Sem console.log em produção
- [ ] Sem código comentado
- [ ] CHANGELOG.md atualizado
- [ ] README.md atualizado
- [ ] Version bump em package.json
- [ ] Tag criada no git
- [ ] Build/Bundle testado
- [ ] Documentação revisada

---

## 11. Troubleshooting

### Erro: "Cannot find module"
```bash
# Solução
npm install
# ou
node -e "console.log(require.resolve('modulo'))"
```

### Erro: "SyntaxError"
```bash
# Validar sintaxe
node -c arquivo.js

# Usar prettier para formatar
npx prettier --write arquivo.js
```

### Testes falhando
```bash
# Limpar cache do Jest
npm test -- --clearCache

# Rodar teste específico
npm test -- --testNamePattern="seu-teste"
```

---

## 12. Links Úteis

- [Node.js Docs](https://nodejs.org/docs/)
- [JavaScript ES6+](https://es6.io/)
- [Jest Testing](https://jestjs.io/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

**Última atualização:** 19 de fevereiro de 2026
