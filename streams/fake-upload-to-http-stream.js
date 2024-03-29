import { Readable } from 'node:stream';

//Simulação do front end enviando dados para o servidor
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

fetch('http://localhost:3334', {
  method: 'POST', //Simular envio a stream somente pode ser enviada através do método POST ou PUT
  body: new ReadableStream(), 
  duplex: 'half',
})