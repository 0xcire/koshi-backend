import { DataSource } from "typeorm";

//TODO: extract
const KOSHI_AUTH_DB_PATH = 'koshi_auth_db.sqlite'

export const koshiAuthDataSource = new DataSource({
  type: 'better-sqlite3',
  database: KOSHI_AUTH_DB_PATH
})

