import http from 'node:http'
import { Transform } from 'node:stream'

class InverseNumberStream extends Transform {
  _transform(chunk, encoding, callback) {
    const transformed = Number(chunk.toString()) * -1

    console.log(transformed);

    callback(null, Buffer.from(String(transformed))) 
  }
}

// req => ReadableStream
// res => WritableStream
const server = http.createServer((req, res) => {
  console.log('oi')

  const buffers = []

  for await (const chunk of req) {
    buffers.push(chunk)
  }

  const fullStreamContent = Buffer.concat(buffers).toString()
  console.log(fullStreamContent)

  return res.end(fullStreamContent)


  req
    .pipe(new InverseNumberStream()) //Transforma o dado de forma não bloqueante e sob demanda
    .pipe(res) // Envia os dados transforma da InverseNumberStream e envia para o res que é uma WritableStream
})

server.listen(3334)
