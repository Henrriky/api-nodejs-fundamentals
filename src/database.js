import fs from "node:fs/promises"

const databasePath = new URL('database.json', import.meta.url) // Concatena com a url do arquivo com o nome do arquivo

export class Database {

  #database = {}

  constructor () {
    fs.readFile(databasePath, 'utf-8', )
      .then(data => {
        this.#database = JSON.parse(data)
      })
      .catch(() => {
        this.#persist()
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

  select (table, search) {

    let data = this.#database[table] ?? []

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase())
        })
        // return Object.entries(search).every(([key, value]) => item[key] === value)
      })
    }

    return data
  }

  delete (table, id) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table] = this.#database[table].filter(data => data.id !== id)
      this.#persist()
      //or const rowIndex = this.#database[table].findIndex(item => item.id === id)
      //or this.#database[table].splice(rowIndex, 1)
    }
  }

  update (table, id, data) {
    if (Array.isArray(this.#database[table])) {

      const rowIndex = this.#database[table].findIndex(row => row.id === id);

      if (rowIndex > -1) {
        this.#database[table][rowIndex] = { id, ...data }
        this.#persist()
      }
      // this.#database[table] = this.#database[table].map(userData => {
      //   if (userData.id === id) {
      //     userData = { ...data }
      //     return userData
      //   }

      //   return userData
      // })

    }
  }
}