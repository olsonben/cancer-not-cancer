import mysql from 'mysql'
import envLocal from '../.env.local.js'

// Basis for connecting to the db
function dbConnection(multipleStatements) {
    const pool = mysql.createConnection({
        host: 'localhost',
        user: envLocal.db.user,
        password: envLocal.db.password,
        database: envLocal.db.database,
        multipleStatements: multipleStatements
    }) 
    pool.connect()
    return pool

}

export default dbConnection