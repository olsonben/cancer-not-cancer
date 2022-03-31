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
//     // res.send({imageName: imageNameList[Math.floor(Math.random() * imageNameList.length)]})
//     res.send("hello")
//     console.log("req get: " + req)
//     console.log("get success");
})

app.post('/', (req, res) => {
    console.log("req post: " + req)
    res.send("post hello")
    // for (const values of req.history) {
    //     resHistory.push(values);
    // }
    console.log("post success");
})

app.listen(port, () => {
    console.log(`Example app running on port ${port}`);
})