import {
  StatusCodes,
} from 'http-status-codes';
import http from 'node:http';
import { json } from './middlewares/json.js';
import { routes } from './routes.js';
import { extractQueryParameters } from './utils/extract-query-parameters.js';

const server = http.createServer(async (req, res) => {

  await json(req, res)

  const route = routes.find(route => {
    return route.method === req.method && route.path.test(req.url)
  })

  if (route) {
    const routeParams = req.url.match(route.path) 
    
    const { query, ...params } = routeParams.groups
    req.params = params
    req.query = query ? extractQueryParameters(query) : {}

    return route.handler(req, res)
  }

  return res.writeHead(StatusCodes.NOT_FOUND).end()
})

server.listen(3333, () => {
  console.log("Server is running on port 3333")
})