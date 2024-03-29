// Streams -> 

import { Readable } from 'node:stream'

//Criando uma stream de leitura
//Tem como propósito enviar dados/fornecer informações
/*  Os dados colocados na stream com push não podem ser tipos primitivos e sim chunks
  - No nosso caso vamos transformar o int em um buffer

*/

//===========1
// class OneToHundredStream extends Readable {
//   index = 1

//   _read() {
//     const i = this.index++
//     if (i > 100) {
//       //push -> método de uma readable stream para fornecer informações para quem estiver consumindo ela
//       this.push(null)
//     } else {
//       const buf = new Buffer.from(String(i))
//       this.push(buf)
//     }
//   }
// }

//============2
class OneToHundredStream extends Readable {
  index = 1

  _read() {
    const i = this.index++
    setTimeout(() => { // Vai ficar recebdno os dados da stream de forma assincrona e não bloquante, conforme ela vai recebendo dados até o fim (null)
      if (i > 100) {
        //push -> método de uma readable stream para fornecer informações para quem estiver consumindo ela
        this.push(null)
      } else {
        const buf = new Buffer.from(String(i))
        this.push(buf)
      }
    }, 1000);
  }
}


new OneToHundredStream()
  .pipe(process.stdout) //Tentando ler a stream enquanto ele está lendo a stream ele vai escrevendo as saidas no terminal
