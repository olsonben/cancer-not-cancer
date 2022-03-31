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

app.get('/', (req, res) => {
    res.send({imageName: imageNameList[Math.floor(Math.random() * imageNameList.length)]})
    console.log("get success");
})

app.post('/', (req, res) => {
    for (const values of req.history) {
        resHistory.push(values);
    }
    console.log("post success");
})

app.listen(port, () => {
    console.log(`Example app running on port ${port}`);
})