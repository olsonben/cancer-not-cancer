// Custom upload handler with busboy dependency
import * as fs from 'node:fs';
import os from 'os'
import path from 'path'
import busboy from 'busboy'

// Creates a directory if it doesn't already exist
async function createDirectory(dirPath) {
    try {
        await fs.promises.access(dirPath)
    } catch (error) {
        // ENOENT means the directory doesn't exist, so we make the directory.
        if (error.code === 'ENOENT') {
            try {
                await fs.promises.mkdir(dirPath, { recursive: true })
            } catch (err) {
                // Can't create directory
                throw err
            }
        } else {
            throw error;
        }
    }
}

// Removes a file if it can.
async function removeFile(filePath) {
    try {
        await fs.promises.rm(filePath);
    } catch (error) {
        console.error(`Error removing file: ${filePath}`, error)
    }
}

// File info is used to communicate back to the client whether a file uploaded successfully or not.
function updateFileInfo(fileInfo, success, message) {
    fileInfo.success = success !== undefined ? success : false
    fileInfo.message = message;
}

// Save a readablestream to disk. First saves to the temporary director, then
// moves the complete save to the image directory.
async function saveFile(file, fileInfo, onFinish) {
    // tmpdir stores files for 3~10 days
    const saveTo = path.join(os.tmpdir(), fileInfo.filename)
    const moveTo = path.join(process.env.IMAGES_DIR, fileInfo.filename)

    // Since we are trying to preserve the path we have to do a lot of directory creating.
    try {
        await createDirectory(path.dirname(saveTo))
    } catch (error) {
        console.log('Create directory error:', error)
        return
    }

    // file to write to, using a writableStream
    const fileWriter = fs.createWriteStream(saveTo)

    // Here connect the read and write stream. We want to wait for them to finish
    // before moving onto moving them to their final destination. Hence the new Promise.
    // With the promise we can catch all the error and have a generic failed save in the catch.
    try {
        await new Promise((resolve, reject) => {
            file.pipe(fileWriter)

            // on read stream errors (failed reading the uploading file)
            file.on('error', (err) => {
                if (err === 'ECONNRESET' ) {
                    console.error(`connection aborted for ${fileInfo.filename}`)
                } else {
                    console.error('FileStream error:', err)
                }
                file.unpipe()
                file.destroy('abort')
                fileWriter.destroy('abort')
                reject(err)
            })
            // on write stream error (failed writing the file)
            fileWriter.on('error', (err) => {
                console.error('FileWriter error:', err)
                reject(err)
            })
            // success
            fileWriter.on('finish', resolve)
        })
    } catch (error) {
        console.error('Upload write error:', error)
        await removeFile(saveTo) // remove half upload files
        updateFileInfo(fileInfo, false, `Upload Aborted: ${fileInfo.filename}`)
        onFinish()
        return
    }

    // At this point we can see if busboy limited a file because of the size limit.
    // If so we want to remove it.
    if (file.truncated) {
        console.log(`LIMIT: ${fileInfo.filename} was too large. Removing...`)
        await removeFile(saveTo)
        updateFileInfo(fileInfo, false, `File was larger than: ${process.env.UPLOAD_SIZE_LIMIT}B`)
        onFinish()
        return
    }

    // Finally we want to try and move the successfully uploaded file to its final destination.
    try {
        await createDirectory(path.dirname(moveTo)) // make sure the destination directories exist
        await fs.promises.rename(saveTo, moveTo) // move the files
        // Success
        console.log(`Moved: ${saveTo} to: ${moveTo}`)
        updateFileInfo(fileInfo, true)
    } catch (error) {
        console.error('Could not move file:', error)
        await removeFile(saveTo)
        updateFileInfo(fileInfo, false, `Could not properly save file: ${fileInfo.filename}`)
    }

    onFinish()

}

// Handle upload image(s) request for express
export function uploadImages(beforeSave) {
    return (req, res, next) => {
        console.log('Uploading images')

        // Check for proper content-type, needs to be multipart/form-data
        // busboy should error out on malformed data, be we do our own check before starting.
        if (!req.headers['content-type'].includes('multipart/form-data')) {
            res.status(415).send('Content-Type must be multipart/form-data.')
            return
        }

        const busboyConfig = {
            headers: req.headers, // pass headers to busboy
            limits: {
                fieldNameSize: 100, //typically 100
                fileSize: process.env.UPLOAD_SIZE_LIMIT // in bytes
            },
            preservePath: true
        }

        const files = [] // keep track of the files for communicating success or failure.
        let finished = false // busboy upload status
        const bb = busboy(busboyConfig)

        // When all files have the property 'succees' AND busboy is finished,
        // we can send our response.
        function onWriteFinish() {
            if (files.every(fileObj => fileObj.hasOwnProperty('success')) && finished) {
                console.log('Upload Complete, Status:')
                console.log(files)
                // res.status(200).send(files)
                req.files = files
                next()
            }
        }

        // Listen for files being uploaded
        bb.on('file', async (fieldName, fileStream, fileInfo) => {
            let isAcceptable = false

            // make sure the file is an image
            if (['image/jpeg', 'image/x-png'].includes(fileInfo.mimeType)) {
                isAcceptable = true
            }

            if (isAcceptable) {
                try {
                    isAcceptable = await beforeSave(fileInfo, req)
                } catch (error) {
                    console.error('db error:', error)   
                }
            }

            // track files
            files.push(fileInfo)

            if (!isAcceptable) {
                fileStream.resume() // skips file read stream
                updateFileInfo(fileInfo, false, 'File not accepted.')
                onWriteFinish()
                return
            }


            // TODO: using filenames is bad. Use hashes of filenames would be safer.
            // https://github.com/mscdex/busboy#special-parser-stream-events

            // Try saving the file
            try {
                console.log('saving...')
                saveFile(fileStream, fileInfo, onWriteFinish)
            } catch (error) {
                console.error('Save file error:', error)
                updateFileInfo(fileInfo, false, 'Could not save file.')
                onWriteFinish()
            }
        })

        bb.on('error', (err) => {
            console.error('busboy error:', err)
            finished = true
        })

        bb.on('finish', () => {
            finished = true
            onWriteFinish() // catch when bb finishes last

            // We could resolve the request here, but we want to wait
            // until the file writting has completed. We may want to change
            // this behavior in the future, since the client is concerned with
            // the servers abilities two write and move files around. They just
            // need to know if the files upload ok.
            
            // the exception is if an empty form is uploaded
            if (files.length == 0) {
                res.status(200).send('No files uploaded.')
            }
        })

        // busboy unused events
        // bb.on('close', () => {})
        // bb.on('unpipe', (stream) => {})

        // Used to detect if the upload connection breaks.
        req.on('error', (err) => {
            console.error('REQUEST ERROR:', err)
            req.unpipe()
            bb.destroy(err.code)
        })

        // Connect the request to busboy
        req.pipe(bb);

    }
}