// /users/:id
export function buildRoutePath(path) {
  const routeParametersRegex = /:([a-zA-Z]+)/g;
  const pathWithParams = path.replaceAll(routeParametersRegex, '(?<$1>[a-z0-9\-_]+)')

  //?<> cria um novo grupo na regex
  //? opcional
  //$ precisa terminar com essa especificação da regex
  //\\?(.*) pegar tudo depois do ponto de interrogação
  const pathRegex = new RegExp(`^${pathWithParams}(?<query>\\?(.*))?$`)

  return pathRegex

}