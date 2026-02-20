"use strict";

const prompt = require('prompt-sync')({ sigint: true });

// Verifica se a string segue o formato DD/MM/YYYY (apenas formato)
function testeDeFormatoData(testeDeDataEntrada) {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  return regex.test(testeDeDataEntrada);
}

// Verifica se a data realmente existe no calendário (ex.: 31/02 -> inválido)
function testeDeExistenciaData(testeDeDataEntrada) {
  const partes = testeDeDataEntrada.split('/');
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const ano = parseInt(partes[2], 10);

  // Meses no objeto Date são 0-11
  const dataObj = new Date(ano, mes - 1, dia);

  return (
    dataObj.getFullYear() === ano &&
    dataObj.getMonth() === mes - 1 &&
    dataObj.getDate() === dia
  );
}

// Compara a data fornecida com a data atual e informa passado/presente/futuro
function testeDeComparacaoData(testeDeDataEntrada) {
  const partes = testeDeDataEntrada.split('/');
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const ano = parseInt(partes[2], 10);

  const dataFornecida = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  dataFornecida.setHours(0, 0, 0, 0);

  if (dataFornecida.getTime() === hoje.getTime()) {
    return 'hoje';
  }
  if (dataFornecida.getTime() < hoje.getTime()) {
    return 'passado';
  }
  return 'futuro';
}

// Loop: solicita ao usuário até receber uma data com formato correto e que exista
let testeDeDataEntrada = '';
while (true) {
  testeDeDataEntrada = prompt('Digite uma data no formato DD/MM/YYYY (ex: 19/02/2026): ');

  if (!testeDeFormatoData(testeDeDataEntrada)) {
    console.log('Formato inválido. Use DD/MM/YYYY. Tente novamente.');
    continue;
  }

  if (!testeDeExistenciaData(testeDeDataEntrada)) {
    console.log('Data inválida (não existe no calendário). Tente novamente.');
    continue;
  }

  // Se chegou aqui, formato e existência estão OK
  break;
}

// Após receber data válida, informa se é válida e se está no passado/hoje/futuro
console.log('\nResultado:');
console.log('Data informada: ' + testeDeDataEntrada);
console.log('A data é válida.');
const situacao = testeDeComparacaoData(testeDeDataEntrada);
if (situacao === 'hoje') {
  console.log('A data corresponde à data de hoje.');
} else if (situacao === 'passado') {
  console.log('A data está no passado.');
} else {
  console.log('A data está no futuro.');
}