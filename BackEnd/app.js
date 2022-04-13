const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const fs = require('fs')

const app = express()
const port = process.env.PORT || 5050;

// This is vital to parsing the requests
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
})); 

// this should match the name names of the images in assets
const imageNameList = [
    'peacock-feather',
    'bridge',
    'butterfly',
    'leaf-path',
    'orange-slice',
    'tree'
]

// TODO: store the history as a solid database, not holding it in memory
let pathHistory = []

app.get('/images', (req, res) => {
    console.log("Express server: /images"); // tracking location

    let selectedImage = imageNameList[Math.floor(Math.random() * imageNameList.length)]
    let imageURL = 'http://localhost:' + port + '/images/' + selectedImage + '.jpeg' // baseURL + route/to/myImage.jpeg
    res.send(imageURL) // send a random image name
})

app.get('/images/:id', (req, res) => {
    console.log("Express server: /images/:id")
    res.sendFile(path.join(__dirname, '/images/' + req.params.id))
})

app.post('/pathHistory', (req, res) => {
    console.log("Express server: /pathHistory")

    // REMEMBER: the data in body is in JSON format

    // add each obj to the pathHistory
    for (let i = 0; i < req.body.length; i++) {
        pathHistory.push(req.body[i])
    }

    /* TODO: decide btw list vs object for the json 
    list
    [
        {
            'id': '0001',
            'value': 'cancer',
            'comment': 'This is a list'
        },
        ...
    ]
    object
    {
        '0001': {
            'value': 'cancer',
            'comment': 'This is an object'
        }
    }
    */

    // we are constantly appending to the archive json so you have to read, write, then save
    fs.readFile('archive.json', (err, data) => {
        const json = JSON.parse(data)
        json.push(pathHistory[0])

        fs.writeFile("archive.json", JSON.stringify(json), (err) => {if (err) throw err}) // save to archive
    })

    res.send("pathHistory length = " + pathHistory.length) // respond with the new length of pathHistory
    console.log(pathHistory)
})

app.listen(port, () => {
    console.log(`CNC running on port ${port}`);
})