// Initialize database connection for app. Subsequent imports of dbConnection with
// be a cache of the exported connection.

import { DatabaseOps } from "../lib/dbops.js";

const dbConfig = {
    type: process.env.DB_PROTOCOL,
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    multipleStatements: true
}

const dbConnection = new DatabaseOps(dbConfig)

export default dbConnection