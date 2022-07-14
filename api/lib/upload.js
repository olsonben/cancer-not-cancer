import fs from 'fs'
import multer from 'multer'

/**
 * MULTER FILE UPLOADS
 */

export default multer({
    storage: multer.diskStorage({
        // Where to files
        destination: (req, file, cb) => {
            // Get the directory path
            console.log(file.originalname)
            const paths = file.originalname.match(/^.*[\\\/]/)
            const dirpath = './images/' + (paths !== null ? paths[0] : '')

            // Check if it already exists
            fs.access(dirpath, err => {
                // If not, make the dir
                if (err) {
                    fs.mkdirSync(dirpath, { recursive: true })
                }
                // Use the dir as the destination
                cb(null, dirpath) // We are only interested in images
            })
        },

        filename: (req, file, cb) => {
            // Joe is setting the files to have unique names
            // Just get the file name
            cb(null, file.originalname.replace(/^.*[\\\/]/, ''))
        }
    }),

    // Multer completely ignores anything that doesn't pass this test, not even being noted in req.files
    fileFilter: (req, file, cb) => {
        const ext = file.originalname.split('.').pop()
        // Only allow png, jpg, and jpeg
        if ([ 'png', 'jpg', 'jpeg' ].includes(ext)) {
            cb(null, true)
        } else {
            cb(null, false)
        }
    },

    // Busboy (what multer uses to upload) will just use the file name if this is not set
    preservePath: true
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
})