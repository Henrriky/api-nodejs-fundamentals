import { Readable, Writable, Transform } from 'node:stream'
class OneToHundredStream extends Readable {
  index = 1

  _read() {
    const i = this.index++
    setTimeout(() => {
      if (i > 100) {
        this.push(null)
      } else {
        const buf = new Buffer.from(String(i))
        this.push(buf)
      }
    }, 1000);
  }
}

class InverseNumberStream extends Transform {
  _transform(chunk, encoding, callback) {
    const transformed = Number(chunk.toString()) * -1
    //null no callback significa ausencia de erro
    callback(null, Buffer.from(String(transformed))) //Dado transformado
    // callback(new Error('Erro sla'), )
  }
}

class MultiplyByTenStream extends Writable {

  //chunk -> pedaço que lemos da stream de leitura (this.push)
  //encoding -> como a informação da stream está condificada
  //callback -> função que a stream de escrita termina de processar a informação
  //Não transforma os dados, apenas processar os dados
  _write(chunk, encoding, callback) {
    console.log(Number(chunk.toString()) * 10)
    callback()
  }
}

// new OneToHundredStream()
//   .pipe(new MultiplyByTenStream()) //Tentando ler a stream enquanto ele está lendo a stream ele vai escrevendo as saidas no terminal
//   //Estamos lendo os dados enquanto executamos ações com eles

new OneToHundredStream() //Stream de leitura: somente Ler dados da stream de leitura
  //É um intermediario entre os dois tipos de streams
  .pipe(new InverseNumberStream()) //Stream de transformação: Consegue ler obrigatóriamente dados de algum lugar e escrever dados para outro lugar
  .pipe(new MultiplyByTenStream()) //Stream de escrita: somente Escrever dados de stream
