# Passos iniciais

- `const http = require('http')` -> HTTP do NodeJS
  - CommonJS -> require
  - ESModules -> import/export
  ```js
  {
    "name": "api-fundamentals-nodejs",
    "type": "module",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [],
    "author": "",
    "license": "ISC"
  }
  ```

## Node watch

- `npm --watch src/server.js`

## Rotas de criação e listagem (Métodos HTTP)

- HTTP
  - Método HTTP (GET, POST, PUT, PATCH, DELETE)
  - URL

## Salvando dados em memória

- Statefull: Guarda informação em memória
  - Se for derrubada pode funcionar de forma diferente da que estava antes, pois a memória é volátil.
- Stateless: Não guarda informações em memória
- Quando devolvemos uma resposta no HTTP do NodeJS não podemos devolver um array, só podemos ter três tipos de retorno:
  - String
  - Buffer
  - UintArray
- Para o front-end saber que o back-end devolveu uma resposta em JSON enviamos os cabeçalhos
  - Cabeçalhos da requisição e da resposta são meta dados (informações para front-end e back-end lidar com eles de forma diferente)
    ```js
        return res
      .setHeader('Content-type', 'application/json')
      .end('Criação de usuário')
    ```
    - Pode ser enviado do front-end para o back-end e do back-end para o front-end.

# Conhecendo HTTP Status Code

Informational responses (100 – 199)
Successful responses (200 – 299)
Redirection messages (300 – 399)
Client error responses (400 – 499)
Server error responses (500 – 599)

# Entendo streams

Inicia uma conexão de fluxo ou datagrama com o destino especificado pelo endereço. O tipo de soquete criado é determinado pelo transporte especificado usando a formatação de URL padrão: transport://target. Para soquetes de domínio da Internet (AF_INET), como TCP e UDP, a parte de destino do parâmetro de endereço deve consistir em um nome de host ou endereço IP seguido por dois pontos e um número de porta. Para soquetes de domínio Unix, a parte de destino deve apontar para o arquivo de soquete no sistema de arquivos.

- Stream (Fluxo)
  - Ser capaz de obter pequenas parte de grandes coisas e já conseguir trabalhar com aqueles dados mesmo antes de ler o arquivo completo e de forma não bloqueante.
  - Exemplo:
    - Importação de clientes via CSV (Excel) e salva no banco de dados
      - Imagine 1GB de CSV para o servidor com um milhão de linhas, caso não usássemos o conceito de stream o usuário vai subir o CSV e o back-end sem streams vai ler o arquivo de 1GIGABYTE por completo e somente após a leitura ele vai percorrer esse arquivo de 1GB fazendo cada uma das operaçoes de escrita no banco de dados.
      - 10mb/s -> 100s (1 minuto e 40 segundos)
  - Exemplo com stream:
    - Enquanto o upload é realizado nós podemos nos primeiros segundos de upload por exemplo e já realizar as operações em cima deles, ou seja, estamos executando ações sobdemanda. Se nos primeiros segundos já recebemos 10mb por que não já inserir antes de espera o 1GB ser enviado para o servidor?
    - Conseguimos ler os dados que estão vendo do HTTP no upload e aos poucos ler o arquivo e processar ele enquanto o arquivo ainda está sendo enviado para o servidor.
- Existem dois tipos de streams:
  - Readable Streams (Recebimento de CSV) e WritableStreams (Netflix)

## Criando stream de leitura (Client enviando CSV)

- No NodeJS toda porta de entrada e saída I/O é uma stream, igual aos sockets (fluxo de dados)
  - Requisição e Resposta são Streams
    - Podemos receber um requisição e ir enviando dados para ela aos poucos
    - Podemos enviar requisição aos poucos
- Modelo de entrada e saída
  - processo do nodejs
    - `process.stdin` é uma readable stream
    - `process.stdout` é uma writable stream
    - Duplex stream
    ```js
    //Tudo que estamos recebendo como entrada estamos encaminhando como saida
    process.stdin
      .pipe(process.stdout)
    ```
  - Conseguimos trabalhar com pipes no req e res

## Criando stream de escrita (Netflix enviando lives)

- Receber dados de uma stream de leitura e fazer alguma coisa com esses dados. `proccess.stdout` é um stream que processa dados, ou seja WritableStream, conseguimos utilizar a função do node para escrever dados na tela pois ela é uma stream e por isso recebeu a outra stream como parametro para imprimir os dados
  - TransformStreams: Transformar dados
  - WritableStreams: Escrever dados
  - DuplexStreams: Tanto método de leitura e escrita, exemplo: arquivo fisico do sistema (ler e escrever ele mas não pode transformar)

## Como as streams funcionam no NodeJS

- Toda Stream de leitura possui um método de encadeamento chamado `pipe`, o que permite a leitura dos dados recebidos através de uma leitura de um Socket. Além disso, possui o método `read` que é chamado para ler os dados da stream.
  ```js
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
  ```
- Toda Stream de leitura possui um método de encadeamento chamado `pipe`, o que permite a leitura dos dados recebidos através de uma leitura de um Socket. Além disso, possui o método `write` que é chamado para escrever os dados na stream.
  ```js
  class MultiplyByTenStream extends Writable {
    _write(chunk, encoding, callback) {
      console.log(Number(chunk.toString()) * 10)
      callback()
    }
  }
  ```
  - //chunk -> pedaço que lemos da stream de leitura (this.push)
  - //encoding -> como a informação da stream está condificada
  - //callback -> função que a stream de escrita termina de processar a informação
- Toda Stream de Transformação possui um método de encadeamento chamado `pipe`, o que permite a leitura dos dados recebidos através de uma leitura de um Socket. Além disso, possui o método `transform` que é chamado para transformar os dados da stream.
  ```js
  class InverseNumberStream extends Transform {
    _transform(chunk, encoding, callback) {
      const transformed = Number(chunk.toString()) * -1

      console.log(transformed);

      callback(null, Buffer.from(String(transformed))) 
    }
  }
  ```

## Aplicando streams no HTTP

- Criar um servidor ficticio para receber upload de arquivos 
- Podemos manter um canal de envio de dados aberto e manter esse canal enquanto o dado está sendo enviado
- Servidor:
  ```js
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
    req
      .pipe(new InverseNumberStream()) //Transforma o dado de forma não bloqueante e sob demanda
      .pipe(res) // Envia os dados transformados da InverseNumberStream e envia para o res que é uma WritableStream
  })
  server.listen(3334)
  ```
- Cliente:
  ```js
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
  ```
## Trabalhando com streams completos

- Para guardar toda a informação recebida e agir apenas após o envio completo dos dados é necessário criar um array com todos os buffers de entradas que forem sendo recebidos
  - Utilizar `for await (const chunk of req) {}` -> Sintaxe para aguardar a atual para ir para a próxima
  ```js
  const buffers = []

  for await (const chunk of req) {
    buffers.push(chunk)
  }

  const fullStreamContent = Buffer.concat(buffers).toString()
  console.log(fullStreamContent)

  return res.end(fullStreamContent)
  ```
  - Cliente:
  ```js
  fetch('http://localhost:3334', {
    method: 'POST', //Simular envio a stream somente pode ser enviada através do método POST ou PUT
    body: new ReadableStream(), 
    duplex: 'half',
  })
  .then(response => response.text())
  .then(data => {
    console.log(data)
  })
  ```

## Buffers

- Uma representação de um espaço na memória do computador usado especificamente para transitar dados de maneira eficientes. São lugares para os dados serem tratados e serem enviados para outro lugar e removidos. São maneiras de salvar e ler dados na memória de forma eficiente.
- É mais performático ler uma informação aos poucos de forma binária do que um texto.
```js
const buf = Buffer.from("ok");
console.log(buf) //<Buffer 6f 6b>
console.log(buf.toJSON()) //{ type: 'Buffer', data: [104, 101, 108, 108, 111] } -> Representação decimal EX (104 -> H), (101 -> e), (108 -> l), (108 -> l), (111 -> o)
//32 bits -> 4 bytes -> menos casas decimais
```
- Decimal
  - 1 Byte  (int de 8 bits)
  - 2 Bytes (int de 16 bits)
  - 4 Bytes (int de 32 Bits)
  - 8 Bytes (int de 64 Bits)
- Hexadecimal aonde cada um deles representam uma letra
  - 1 Byte: Representado por dois dígitos hexadecimais (0-255 em decimal)
  - 2 Bytes: Representado por quatro dígitos hexadecimais (0-65535 em decimal)
  - 4 Bytes: Representado por oito dígitos hexadecimais (0-4294967295 em decimal)
  - 8 Bytes: Representado por dezesseis dígitos hexadecimais (0-18446744073709551615 em decimal)
- ASCII
  - Usa 1 byte (8 bits) para representar um caractere
  - 2^8 = 256 caracteres
  - 0 - 127 -> Caracteres comuns
  - 128 - 255 -> Caracteres especiais
  - UTF-8
# Servidor HTTP com persistência dos dados

- Para criar um servidor HTTP com persistência dos dados podemos utilizar o fs em conjunto com a classe database
  ```js
  import fs from "node:fs/promises"

  const databasePath = new URL('database.json', import.meta.url) // Concatena com a url do arquivo com o nome do arquivo

  export class Database {

    #database = {}

    constructor () {
      fs.readFile(databasePath, 'utf-8', )
        .then(data => {
          this.#database = JSON.parse(data)
        })
    }

    #persist() {
      fs.writeFile(databasePath, JSON.stringify(this.#database))
    }

    insert (table, data) {
      if (Array.isArray(this.#database[table])) {
        this.#database[table].push(data) 
      } else {
        this.#database[table] = [data]
      }

      this.#persist();

      return data
    }

    select (table) {
      const data = this.#database[table] ?? []
      
      return data
    }
  }

  ```
- O `fs´ salva se a gente não especificar o caminho do arquivo na raiz da onde é o arquivo raiz do projeto
  - Para resolver esses problemas precisamos usar o `__dirname` ou `__filename`, no entanto, com os ESModules essas funções deixaram de existir, então precisamos usar o `import.meta.url` para resolver esses problemas, que retorna o caminho do arquivo atual.

## Gerando UUID.

- No NodeJS temos uma função da biblioteca chamada `crypto`

## Separando rotas da aplicação.

- Criar um arquivo routes:
  ```js
  const server = http.createServer(async (req, res) => {

    await json(req, res)

    const route = routes.find(route => {
      return route.method === req.method && route.path === req.url
    })

    if (route) {
      return route.handler(req, res)
    }

    return res.writeHead(StatusCodes.NOT_FOUND)


  })


  import { Database } from './database.js';
  import { randomUUID } from "node:crypto";

  const database = new Database();
  export const routes = [
    {
      method: 'GET',
      path: '/users',
      handler: (req, res) => {
        return res
        .end(JSON.stringify(database.select("users")))
      }
    },
    {
      method: 'POST',
      path: '/users',
      handler: (req, res) => {
        const { name, email } = req.body

        const user = {
            id: randomUUID(),
            username: name,
            email: email
        }
    
        database.insert("users", user)
    
        // users.push({
        //   id: faker.string.uuid(),
        //   username: name,
        //   email: email
        //   // id: faker.string.uuid(),
        //   // username: faker.internet.userName(),
        //   // email: faker.internet.email()
        // })
        return res
          .writeHead(StatusCodes.CREATED)
          .end('Criação de usuário')
      }
    },
  ]
  ```
## Route e Query Parameters

- Três formas de enviar informações para o front-end enviar para o back-end
  - Query parameters (Usados em filtros, paginação, não obrigatórios)
    - `http://localhost:3333/users?userId=1
  - Route parameters (Usados para identificar um recurso específico)
    - `http://localhost:3333/users/1
  - Request Body (Usados para enviar informações sensíveis e não sensíveis)
    - Envio de informações de um formulário HTTPs
    - `http://localhost:3333/users`
    - JSON
      {
        "userId": 1
      }
    - Formulário
      userId=1
    - Multipart
      userId=1

## Criando Regex para o Route params

- Expressão regular é uma forma da gente encontrar textos que seguem um formato especifico, dentro de um texto maior.
- Regex para verificar todo texto que possui `:` e uma sequencia de caracteres de A a Z: 
  - `/:([a-zA-Z]+)/`
- Regex que não para na primeira ocorrencia e verifica todas as ocorrências (REGEX GLOBAL):
  - `/:([a-zA-Z]+)/g`
- Com o método do JS path.matchAll nós conseguimos achar todas as ocorrencias que seguem aquele padrão de busca que definimos para a Regex, agora o nosso objetivo é trocar dentro do path todo o lugar que está definido com o parametro dinamico por uma outra regex que possa aceitar qualquer campo que possa vir com valor
- Para atingir isso vamos usar o método `replaceAll()`, que vai permitir que a URL base seja substituida por uma regex em todas as ocorrencias da regex previamente definida. Isso vai fazer com que caso o usuário insira no index exato de aceitação daquela regex nova um valor válido o path será valido e a rota será chamada.
  ```js
  const path = '/users/:userId'
  const regex = /:([a-zA-Z]+)/g
  const matches = path.matchAll(regex)

  for (const match of matches) {
    const [full, group] = match
    path = path.replaceAll(full, `(?<${group}>[a-zA-Z0-9-]+)`)
  }

  console.log(path)
  ```
- Depois disso, agora nossa função de verificação da rota da aplicação deverá ser substituida pelo método `.test()` da regex retornada por buildRoutePath, isso tornará a busca da rota considerando os paths dinâmicos. Além disso, precisaremos identificar os possíveis grupos (parâmetros dinâmicos) e seus valores, para atingir esse comportamento vamos utilizar o método `req.url.match(route.path)`, esse método vai retornar um array com todas as ocorrências que a regex encontrou, e a partir disso vamos conseguir identificar os grupos e seus valores. No entanto, antes disso precisamos identificar esses grupos no build route path anterior
  - Para fazer esses grupos precisamos fazer o seguinte:
    - Após a definição da Regex de busca dos parâmetros dinâmicos das rotas nós vamos substituir por essa regex:
      ```js
        const pathWithParams = path.replaceAll(routeParametersRegex, '(?<$1>[a-z0-9\-_]+)')
      ```
    - Essa regex de substituição fará com que para cada ocorrência encontrada no nosso path ele vai atribuir ao grupo o indice 1, ou seja, sempre ele irá pegar o que vier após o `:`. Isso permitirá que para cada parâmetro dinamico após ele encontrar o regex ele vai ter uma chave com grupo + valor.