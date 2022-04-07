const express = require('express')
const app = express()
const port = process.env.PORT || 5050;

const bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
})); 

const imageNameList = [
    'peacock-feather',
    'bridge',
    'butterfly',
    'leaf-path',
    'orange-slice',
    'tree'
]

let resHistory = {}

app.get('/images', (req, res) => {
    console.log("Express server: /images");

    res.send(imageNameList[Math.floor(Math.random() * imageNameList.length)])
})

app.post('/history', (req, res) => {
    console.log("Express server: /history")

    console.log("Joe Stuff " + req.body.myParameter)

    res.send(req.body.myParameter.toUpperCase())
})

app.listen(port, () => {
    console.log(`Example app running on port ${port}`);
})