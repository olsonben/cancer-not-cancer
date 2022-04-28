const express = require('express')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const bodyParser = require('body-parser')
const mysql = require('mysql')

const app = express()
const port = process.env.PORT || 5000;

// This is vital to parsing the requests
app.use(bodyParser.json());       // to support JSON-encoded bodies
const pool = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'pathapptest'
})
pool.connect()

const imageNameList = fs.readdirSync('./images/') // list of image names in the images directory
const imageBase = process.env.IMAGE_BASE || 'https://static.milmed.ai'

app.get('/nextImage', (req, res) => {
    console.log("Express server: /images"); // tracking location

    let selectedImage = imageNameList[Math.floor(Math.random() * imageNameList.length)]
    let imageURL = imageBase + '/images/' + selectedImage // baseURL + route/to/myImage
    res.send(imageURL) // send a random image name
})

app.get('/images/:id', (req, res) => {
    console.log("Express server: /images/:id")
    res.sendFile(path.join(__dirname, '/images/' + req.params.id))
})

app.post('/archive', (req, res) => {
    console.log("Express server: /archive")

    // REMEMBER: the data in body is in JSON format

    // query = 'INSERT INTO hotornot (user_id rating, comment) VALUES (0, 5, "Is this working?");'
    query = 'INSERT INTO users (fullname, username, password) VALUES ("Jason", "jaz", "pass");'

    pool.query(query, (err, rows, fields) => {
        if (err) throw err
        else console.log("Successful query");
    })

    // we are constantly appending to the archive json so you have to read, write, then save
    fs.readFile('archive.json', (err, data) => {
        const json = JSON.parse(data)
        json.push(req.body[0])

        if (!err) {
            fs.writeFile("archive.json", JSON.stringify(json), (err) => {
                if (!err) {
                    res.sendStatus(200) // the response has to have something, even when everything works
                } else {
                    res.status(500).send('Could not write to archive')
                    throw err
                }
            }) // save to archive
        } else {
            res.status(500).send('Could not read archive')
        }
    })
})

app.get('/archive', (req, res) => {
    res.sendStatus(200);
})

app.listen(port, () => {
    console.log(`CNC running on port ${port}`);
})