import mysql from 'mysql'
import sqlite3 from 'sqlite3'
import path from 'node:path'
import process from 'node:process'

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

/** SQLite database class to mirror mysql connection when running locally. */
class SqliteConnection {
    /**
     * Create a sqlite3 connections to an instance of the pathapp database.
     * @param {boolean} multipleStatements - not actually used, all non SELECT
     * statements can handle multiple statments.
     */
    constructor(multipleStatements) {
        const databasePath = path.resolve('../html/pathapp.sqlite3')
        console.log(databasePath)
        this.db = new sqlite3.Database(databasePath);
    }

    /**
     * Process sql command with sqlite. If a SELECT command is detected, an
     * array or resulting rows is returned. Anything else is just executed and
     * a callback is called.
     * @param {string} queryString 
     * @param {function} callback 
     */
    query(queryString, callback) {
        // callback == (err, results, fields)
        const isNotSelect = !queryString.toUpperCase().startsWith('SELECT');
        if (isNotSelect) {
            this.db.exec(queryString, err => {
                if (err) {
                    // Error executing
                    callback(err);
                } else {
                    // Success
                    callback();
                }
            })
        } else {
            // Run as a select
            this.db.all(queryString, (error, rows) => {
                if (error) {
                    // Error;
                    callback(error);
                } else {
                    // Success
                    callback(null, rows);
                }
            });
        }
    }
}

let defaultConnection;

if (process.env.DB_PROTOCOL != 'sqlite3') {
    defaultConnection = dbConnection
} else {
    // const sqliteconn = SqliteConnection;
    console.log("!! USING SQLITE3 FOR DATABASE OPERATIONS !!")
    defaultConnection = function(...args) { return new SqliteConnection(...args) };
}

export default defaultConnection