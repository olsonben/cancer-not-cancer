// import Pool from 'mysql2/typings/mysql/lib/Pool'
import path from 'path'

async function buildMySqlConnection(dbConfig) {
    const { default: mysql } = await import('mysql2/promise')
    // Using createPool instead of createConnection fixes an issue with sql
    // server timeouts and matches api recommendations.
    const db = mysql.createPool({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        multipleStatements: dbConfig.multipleStatements,
    })
    
    return db
}

async function buildSqliteConnection(dbConfig) {
    const { default: sqlite3 } = await import('sqlite3')
    sqlite3.verbose()
    const sqlite = await import('sqlite')
    // Because this database file is typically created with a script,
    // it has been hard coded here.
    const databasePath = path.resolve('../html/pathapp.sqlite3')
    const db = await sqlite.open({
        filename: databasePath,
        driver: sqlite3.Database
    })
    
    return db
}

/**
 * Mysql query wrapper to flatten results to just the array of rows.
 * @param {Pool} db Mysql Pool object
 * @returns {Function} Returns an async function that extracts row results from
 * mysql's [rows, fields]
 */
function simplifyQuery(db) {
    return async (sql, values) => {
        const [rows] = await db.query(sql, values)
        return rows
    }
}

/** DatabaseOps class to handle the differences between database protocols. */
class DatabaseOps {
    /**
     * Based on the configuration ["type"], a connection with the matching
     * protocol/type is built. Currently the default type is MySql, with
     * "sqlite3" being the alternative.
     * @param {Object.<string, *>} dbConfig An object that should contain
     * information needed to build a sql database connection. (host, user,
     * password, database[name of db], multipleStatements[boolean])
     */
    constructor(dbConfig) {
        this.dbConfig = dbConfig
        
        if (this.dbConfig.type === 'sqlite3') {
            // Suitable for local development
            console.log('Using SQLITE3 as the database protocol.')
            this.db = buildSqliteConnection(dbConfig).then((db) => {
                // Sqlite specific modifications to unify methods
                db._select = db.all
                db._execute = db.run
                return db
            })
        } else {
            // Default and recommend for production
            console.log('Using MYSQL as the database protocol.')
            this.db = buildMySqlConnection(dbConfig).then((db) => {
                // Mysql specific modifications to unify methods
                db._select = simplifyQuery(db)
                db._execute = db.query
                return db
            })
        }
    }

    // TODO: Consider adding error handling here.
    /**
     * Process select queries that return rows as results.
     * @param {string} sql Sql string template - 'Select * From tbl Where id=?'
     * @param {Array.<*>} values Values to populate sql template
     * @returns {Array.<Object>} Returns an array of json result objects. Keys =
     * table column names.
     */
    async select(sql, values) {
        const db = await this.db
        const results = await db._select(sql, values)
        return results
    }

    /**
     * Process queries other than select(UPDATE, INSERT, etc.)
     * @param {string} sql Sql string template - 'Select * From tbl Where id=?'
     * @param {Array.<*>} values Values to populate sql template
     * @returns {boolean} Returns true upon completion
     */
    async execute(sql, values) {
        const db = await this.db
        await db._execute(sql, values)
        
        return true
    }

    /**
     * Process queries other than select(UPDATE, INSERT, etc.) and get results obj
     * @param {string} sql Sql string template - 'Select * From tbl Where id=?'
     * @param {Array.<*>} values Values to populate sql template
     * @returns {Object} Returns the results object which has insertId
     */
    async executeWithResults(sql, values) {
        const db = await this.db
        const [results, fields] = await db._execute(sql, values)
        return results
    }

    // NOTE: Consider adding transaction methods for more complex DB operaions.

}

export { DatabaseOps }