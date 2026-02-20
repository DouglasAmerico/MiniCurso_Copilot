"use strict";

console.log('Hello, world!');

const prompt = require('prompt-sync')({ sigint: true });

const nome = prompt('Digite seu nome: ') || 'mundo';
const disciplina = prompt('Digite a disciplina: ') || 'Sem disciplina';
const nota = prompt('Digite a nota final: ') || '0';

console.log('\nResumo:');
console.log('Nome: ' + nome);
console.log('Disciplina: ' + disciplina);
console.log('Nota final: ' + nota);