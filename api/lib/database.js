import mysql from 'mysql'

// Basis for connecting to the db
function dbConnection(multipleStatements) {
    const pool = mysql.createConnection({
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DATABASE,
        multipleStatements: multipleStatements
    }) 
    pool.connect()
    return pool
}

export default dbConnection