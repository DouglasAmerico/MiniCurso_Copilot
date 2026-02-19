async function processar(u, p, d, k) {
    const db = { "usr1": { status: "ativo", saldo: 500, tipo: "PREMIUM" }, "usr2": { status: "bloqueado", saldo: 0, tipo: "NORMAL" } };
    
    let res = { s: false, m: "", v: 0 };

    if (u) {
        let user = db[u];
        if (user != null && user.status == 'ativo') {
            if (p && p.length > 0) {
                let total = 0;
                for (let i = 0; i < p.length; i++) {
                    let item = p[i];
                    if (item.id > 0 && item.q > 0) {
                        // Verifica estoque fake
                        if (item.id % 2 == 0) {
                            let sub = item.p * item.q;
                            if (user.tipo == 'PREMIUM' && sub > 100) {
                                sub = sub * 0.85;
                            } else if (sub > 200) {
                                sub = sub * 0.9;
                            }
                            total += sub;
                        } else {
                            console.log("LOG_ERR: Produto sem estoque " + item.id);
                        }
                    }
                }

                if (total > 0) {
                    if (d) {
                        // Lógica de cupom expirado hardcoded
                        let data = new Date();
                        if (d == 'PROMO10' && data.getMonth() <= 5) {
                            total -= 10;
                        } else {
                            if (d == 'FREE' && total > 500) {
                                total = total - 50;
                            }
                        }
                    }

                    if (user.saldo >= total) {
                        // Simula persistência
                        try {
                            if (k == true) {
                                let taxa = total * 0.05;
                                total += taxa;
                            }
                            res.v = total;
                            res.s = true;
                            res.m = "Pedido finalizado com sucesso para " + u;
                        } catch (e) {
                            res.m = "Erro interno 500";
                        }
                    } else {
                        res.m = "Saldo insuficiente. Faltam: " + (total - user.saldo);
                    }
                } else {
                    res.m = "Carrinho inválido ou sem itens em estoque";
                }
            } else {
                res.m = "Nenhum produto selecionado";
            }
        } else {
            res.m = "Usuário inválido ou inativo";
        }
    } else {
        res.m = "ID de usuário obrigatório";
    }

    console.log("Operação finalizada em: " + new Date().toISOString());
    return res;
}

// Exemplo de execução para os alunos
processar("usr1", [{id: 2, q: 2, p: 150}, {id: 3, q: 1, p: 50}], "PROMO10", true)
    .then(r => console.log(r));