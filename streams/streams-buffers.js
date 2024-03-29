import {
	StatusCodes,
} from 'http-status-codes';
import { faker } from '@faker-js/faker';
import http from 'node:http';

const users = []

const server = http.createServer(async (req, res) => {

  const { method, url } = req

  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk)
  }

  try {
     const body = JSON.parse(Buffer.concat(buffers).toString())
     req.body = body
  } catch (error) {
     req.body = null
  }


  if (method === 'GET' && url === '/users') {
    return res
      .setHeader('Content-type', 'application/json')
      .end(JSON.stringify(users))
  }

  if (method === 'POST' && url === '/users') {
    const { name, email } = req.body
    users.push({
      id: faker.string.uuid(),
      username: name,
      email: email
      // id: faker.string.uuid(),
      // username: faker.internet.userName(),
      // email: faker.internet.email()
    })
    console.log(users)
    return res
      .writeHead(StatusCodes.CREATED)
      .end('Criação de usuário')
  }

  return res.writeHead(StatusCodes.NOT_FOUND)
})

server.listen(3333, () => {
  console.log("Server is running on port 3333")
})