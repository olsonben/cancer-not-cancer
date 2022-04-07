const util = require('util')
const express = require('express')
const app = express()
const port = process.env.PORT || 5050;

var bodyParser = require('body-parser')
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

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.get('/images', (req, res) => {
    console.log("Express server: /images");
})

app.post('/history', (req, res) => {
    console.log("Express server: /history")
    // console.log("Msg: " + req.query.msg);
    // console.log("History: " + req.params.history)

    console.log("Joe Stuff " + req.body.myParameter)
    // console.log("ID: " + req.prams.ID);
    // console.log("Name: " + req.data.name);
    // console.log(util.inspect(req.body, { showHidden: false, depth: null, colors: true }))
})

app.listen(port, () => {
    console.log(`Example app running on port ${port}`);
})