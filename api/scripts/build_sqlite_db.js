import fs from "fs"
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

function buildDatabase() {
    console.log('Build SQLite3 Database via nodejs.')
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const sqliteDumpPath = path.resolve(__dirname, '../../html/temp_pathapp_for_sqlite3.sql')
    const databasePath = path.resolve(__dirname, '../../html/pathapp.sqlite3')
    try {
        fs.unlinkSync(databasePath)
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('No existing DB to remove.')
        } else {
            throw error;
        } 
    }
    
    const db = new sqlite3.Database(databasePath);
    
    const dataSql = fs.readFileSync(sqliteDumpPath, "utf8");

    db.exec(dataSql, err => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Database created successfully');
        }
    });

    db.close();

}
        
buildDatabase()

