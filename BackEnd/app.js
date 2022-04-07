const util = require('util')
const express = require('express')
const app = express()
const port = process.env.PORT || 5050;

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
})

app.post('/history', (req, res) => {
    console.log("Express server: /history")
    console.log(req.query.msg);
    // console.log(util.inspect(req.body, { showHidden: false, depth: null, colors: true }))
})

app.listen(port, () => {
    console.log(`Example app running on port ${port}`);
})