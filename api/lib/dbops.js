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

    // NOTE: Not tested with sqlite
    // https://github.com/sidorares/node-mysql2/issues/384#issuecomment-673726520
    async executeTransactions(sqlQueries, queryValues) {
        let conn = null;
        try {
            const db = await this.db // the await is needed to enter the promise chain
            conn = await db.getConnection()
            await conn.beginTransaction()
            for (let i in sqlQueries) {
                // check if there are queryValues
                if (queryValues[i] && queryValues[i].length) {
                    await conn.query(sqlQueries[i], queryValues[i])
                } else {
                    // NOTE: It is up to the user not to submit an empty query
                    await conn.query(sqlQueries[i])
                }
            }
            // const [response, meta] = await conn.query('')
            await conn.commit()
        } catch (error) {
            if (conn) await conn.rollback()
            throw error
        } finally {
            if (conn) await conn.release()
        }
    }

    async startTransaction() {
        let connection = null
        try {
            const db = await this.db
            connection = await db.getConnection()
            await connection.beginTransaction()
            const transaction = new TransactionContainer(connection)
            return transaction
        } catch (error) {
            if (connection) connection.release()
            throw error
        }
    }

}

/**
 * Contains a mysql transaction that has already been started.
 */
class TransactionContainer {
    constructor(dbConnection) {
        this.dbConnection = dbConnection
    }

    async query(sqlQuery, queryValues) {
        try {
            const [results] = await this.dbConnection.query(sqlQuery, queryValues)
            return results
        } catch (error) {
            if (this.dbConnection) {
                await this.dbConnection.rollback()
                await this.dbConnection.release()
            }
            throw error
        }
    }

    async commit() {
        try {
            await this.dbConnection.commit()
        } catch (error) {
            if (this.dbConnection) await this.dbConnection.rollback()
            throw error
        } finally {
            if (this.dbConnection) {
                this.dbConnection.release()
            }
        }
    }
}

export { DatabaseOps }