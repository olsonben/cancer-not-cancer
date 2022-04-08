const express = require('express')
const app = express()
const port = process.env.PORT || 5050;
const path = require('path')
// This is vital to parsing the requests
const bodyParser = require('body-parser')
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

    let imageName = imageNameList[Math.floor(Math.random() * imageNameList.length)]
    let imagePath = path.join(__dirname, '/images/' + imageName + '.jpeg')

    res.sendFile(imagePath)
    // res.send(imageName) // send a random image name
})

app.get('/images/:id', (req, res) => {
    console.log("Express server: /images/:id")
    res.sendFile(path.join(__dirname, '/images/' + req.params.id))
})

app.post('/pathHistory', (req, res) => {
    console.log("Express server: /pathHistory")

    // REMEMBER: the data in body is in JSON format

    // add each obj to the pathHistory
    for (const obj in req.body) {
        pathHistory.push(obj)
    }

    res.send("pathHistory length = " + pathHistory.length) // respond with the new length of pathHistory
})

app.listen(port, () => {
    console.log(`Example app running on port ${port}`);
})