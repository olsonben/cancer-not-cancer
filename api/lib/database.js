import mysql from 'mysql'

// Basis for connecting to the db
function dbConnection(multipleStatements) {
    // Using createPool instead of createConnection fixes an issue with sql
    // server timeouts and matches api recommendations.
    const pool = mysql.createPool({
        connectionLimit: 10,
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DATABASE,
        multipleStatements: multipleStatements
    }) 
    return pool
}

export default dbConnection