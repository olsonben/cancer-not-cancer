import path from 'node:path'

async function buildSqliteConnection() {
    const { default: sqlite3 } = await import('sqlite3')
    const sqlite = await import('sqlite')
    const databasePath = path.resolve('../html/pathapp.sqlite3')
    const db = await sqlite.open({
        filename: databasePath,
        driver: sqlite3.Database
    })
    return db
}

class DatabaseOps {
    constructor(dbConfig) {
        this.dbConfig = dbConfig
        
        if (this.dbConfig.type !== 'sqlite3') {
            console.log('USING MYSQL')
            this.db = import('mysql2/promise').then((mysql) => {
                // Using createPool instead of createConnection fixes an issue with sql
                // server timeouts and matches api recommendations.
                return mysql.createPool({
                    host: dbConfig.host,
                    user: dbConfig.user,
                    password: dbConfig.password,
                    database: dbConfig.database,
                    multipleStatements: dbConfig.multipleStatements,
                })
            })
        } else if (this.dbConfig.type === 'sqlite3') {
            console.log('USING SQLITE3')
            this.db = buildSqliteConnection()
        } else {
            throw new Error(`Invalid database type: ${this.dbConfig.type}`)
        }
    }

    async query(sql, values) {
        console.log(sql)
        console.log(values)
        const db = await this.db
        // const rows = await db.all(sql, values) // sqlite3
        const [rows, fields] = await db.query(sql, values) // mysql2
        return rows
    }

}

export { DatabaseOps }