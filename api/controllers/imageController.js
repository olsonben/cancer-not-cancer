import { imageOps } from '../dbOperations/database.js'

const imageBaseURL = process.env.IMAGE_URL

const nextImage = async (req, res, next) => {
    console.log("GET: nextImage");
    try {
        const img = await imageOps.getNextImage()
        // TODO: Use URLs and Path Join instead of this logic
        let imagePath = img.path
        if (imageBaseURL.slice(-1) == "/") {
            if (img.path.charAt(0) == "/") {
                imagePath = imagePath.slice(1)
            }
        } else if (img.path.charAt(0) != "/") {
            imagePath = "/" + imagePath
        }

        let url = imageBaseURL + imagePath
        res.send({
            id: img.id, // imageID
            url: imageBaseURL + img.path
        })
    } catch (err) {
        next(err)
    }
}

// TODO: update the image pipeline to use unified error handler via `next(err)`
const saveImages = async (req, res, next) => {
    if (req.files.length === 0) {
        res.status(200).send('No files uploaded.')
    } else {
        const allowedKeys = ["filename", "mimeType", "id", "relPath", "success", "message"]
        const resultData = req.files.map((file) => {
            const filteredFile = Object.keys(file)
                .filter(key => allowedKeys.includes(key))
                .reduce((obj, key) => {
                    obj[key] = file[key]
                    return obj
                }, {})
            return filteredFile
        })

        res.status(200).send(resultData)
    }
}

const imageController = {
    nextImage,
    saveImages,
}

export default imageController