import path from 'node:path'

async function buildSqliteConnection() {
    const { default: sqlite3 } = await import('sqlite3')
    sqlite3.verbose()
    const sqlite = await import('sqlite')
    const databasePath = path.resolve('../html/pathapp.sqlite3')
    const db = await sqlite.open({
        filename: databasePath,
        driver: sqlite3.Database
    })
    // Not the best location to make these declarations, but easiest given async nature.
    db._select = db.all
    db._execute = db.run
    return db
}

function simplifyQuery(dbPool) {
    return async (sql, values) => {
        const [rows] = await dbPool.query(sql, values)
        return rows
    }
}

class DatabaseOps {
    constructor(dbConfig) {
        this.dbConfig = dbConfig
        
        if (this.dbConfig.type !== 'sqlite3') {
            console.log('Using MYSQL as the database protocol.')
            this.db = import('mysql2/promise').then((mysql) => {
                // Using createPool instead of createConnection fixes an issue with sql
                // server timeouts and matches api recommendations.
                const pool = mysql.createPool({
                    host: dbConfig.host,
                    user: dbConfig.user,
                    password: dbConfig.password,
                    database: dbConfig.database,
                    multipleStatements: dbConfig.multipleStatements,
                })
                // Again, is there a better place to assign these given async?
                pool._select = simplifyQuery(pool)
                pool._execute = pool.query
                return pool
            })
        } else if (this.dbConfig.type === 'sqlite3') {
            console.log('Using SQLITE3 as the database protocol.')
            this.db = buildSqliteConnection()
        } else {
            throw new Error(`Invalid database type: ${this.dbConfig.type}`)
        }
    }

    // TODO: Consider adding error handling here.
    async select(sql, values) {
        const db = await this.db
        const results = await db._select(sql, values)
        return results
    }

    async execute(sql, values) {
        const db = await this.db
        await db._execute(sql, values)
        return true
    }

    // NOTE: Consider adding transaction methods for more complex DB operaions.

}

export { DatabaseOps }