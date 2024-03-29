import { Database } from './database.js';
import { randomUUID } from "node:crypto";
import { buildRoutePath } from './utils/build-route-path.js';
import { StatusCodes } from 'http-status-codes';

const database = new Database();
export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/users'),
    handler: (req, res) => {

      const { search } = req.query

      const users = database.select('users', search ? {
        username: search,
        email: search
      } : null)

      return res
      .end(JSON.stringify(users))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/users'),
    handler: (req, res) => {
      const { name, email } = req.body

      const user = {
          id: randomUUID(),
          username: name,
          email: email
      }
  
      database.insert("users", user)
  
      return res
        .writeHead(StatusCodes.CREATED)
        .end('Criação de usuário')
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/users/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { name, email } = req.body

      const user = {
          username: name,
          email: email
      }
  
      database.update("users", id, user)
  
      return res
        .writeHead(StatusCodes.NO_CONTENT)
        .end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/users/:id'),
    handler: (req, res) => {
      const { id } = req.params

      database.delete("users", id)

      return res
        .writeHead(StatusCodes.NO_CONTENT)
        .end()
      }
  },
  {

  }
]