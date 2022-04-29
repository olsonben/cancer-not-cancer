const express = require('express')
const path = require('path')
require('dotenv').config()

const bodyParser = require('body-parser')
const mysql = require('mysql')

// Make the server
const app = express() 
const port = process.env.PORT || 5000;

// This is vital to parsing the requests
app.use(bodyParser.json());       // to support JSON-encoded bodies

// This is for connecting to the MariaDB db
const pool = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
}) 
pool.connect()

const imageBase = process.env.IMAGE_BASE || 'https://static.milmed.ai/'

/**********************************************
 * Express REQUESTS
 **********************************************/

app.get('/nextImage', (req, res) => {
    console.log("Express server: /images"); // tracking location

    // Get random row
    // NOTE: this is not very efficient, but it works
    // TODO: only consider rows with a rule - eg. least # of hotornot entries
    query = `SELECT id, path FROM images ORDER BY RAND() LIMIT 1;`

    pool.query(query, (err, rows, fields) => {
        if (err) throw err
        res.send({
            id: rows[0].id, // imageID
            url: imageBase + rows[0].path
        })
        console.log("Successful image get");
    })

})

app.post('/archive', (req, res) => {
    console.log("Express server: /archive")
    
    // REMEMBER: the data in body is in JSON format
    
    // Get the ip address sourced from the request
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    ip = '"' + ip.substring(ip.lastIndexOf(':')+1) + '"'
    
    // query = 'INSERT INTO users (fullname, username, password) VALUES ("Maria", "mar", "i_like2db");' // insert user
    // query = `INSERT INTO images (path, from_ip, user_id) VALUES ("images/leaf-path.jpeg", ${ip}, 1);` // insert image
    
    // Insert the hotornots
    query = 'INSERT INTO hotornot (user_id, image_id, rating, comment, from_ip) VALUES '
    // TODO: handle user_id
    for (let i = 0; i < req.body.length; i++) {
        query += `(1, ${req.body[i].id}, ${req.body[i].rating}, "${req.body[i].comment}", ${ip}) `
    }
    query += ';'
    
    pool.query(query, (err, rows, fields) => {
        if (err) throw err
        console.log("Successful archive query");
    })
})

// listen to app
app.listen(port, () => {
    console.log(`CNC running on port ${port}`);
})