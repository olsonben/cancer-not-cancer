

export const useImageUpload = () => {
    const api = useApi()
    const config = useRuntimeConfig()
    const acceptableFormats = ['image/png', 'image/jpeg']
    const filesPerUploadRequest = config.public.filesPerUploadRequest

    function _onFileUpdate(onFileUpdate, fileObject) {
        if (typeof onFileUpdate === 'function') {
            onFileUpdate(fileObject)
        }
    }

    function getBaseFileObject(filename, success = null, message = null) {
        return {
            filename: filename,
            success: success,
            message: message
        }
    }

    /**
     * Upload array of image files
     */ 
    const uploadImages = async (files, endpoint, onFileUpdate) => {
        const uploadHeaders = {
            'uploadtime': new Date().toISOString()
        }

        const rawData = []

        // Add the files array object
        files.forEach((file, index) => {
            if (file.size > config.public.uploadSizeLimit) {
                console.error(`${file.name} is too large. MAX_BYTES: ${config.public.uploadSizeLimit}`)
                const failedFile = getBaseFileObject(file.name, false, 'Too large')
                _onFileUpdate(onFileUpdate, failedFile)
                return
            }

            const filename = file.webkitRelativePath === '' ? file.name : file.webkitRelativePath
            rawData.push({
                'key': `files[${index}]`,
                'file': file,
                'filename': filename
            })
        })

        try {
            for (let i = 0; i < rawData.length; i += filesPerUploadRequest) {
                const uploadBlock = rawData.slice(i, i + filesPerUploadRequest)
                // image upload requires submittion via form data 
                const formData = new FormData()
                for (const fileObj of uploadBlock) {
                    formData.append(fileObj.key, fileObj.file, fileObj.filename)
                    const submittedFile = getBaseFileObject(fileObj.filename)
                    _onFileUpdate(onFileUpdate, submittedFile)
                }
                if (i + filesPerUploadRequest >= rawData.length) {
                    uploadHeaders['finalblock'] = true
                }
                
                // TODO: Add try/catch here and responsed to failed api request
                const { response } = await api.POST(endpoint, formData, null, uploadHeaders)

                if (response.value !== 'No files uploaded.') {
                    // submission complete
                    for (const file of response.value) {
                        _onFileUpdate(onFileUpdate, file)
                    }
                } else {
                    console.log('No Files to Upload')
                }

            }
            
        } catch (error) {
            // TODO: Determine when error.data exists
            if (error.data) {
                for (const file of error.data) {
                    // update failed status
                    const failedFile = Object.assign({ 'success': false, 'message': 'FAILED' }, file)
                    _onFileUpdate(onFileUpdate, failedFile)
                    console.warn(`${file.filename} failed to upload.`)
                }
            } else {
                // TODO: HANDLE LOST CONNECTION
                // Generic Error
                console.error(error)
            }
        }
    }

    /** Filter dataTransfer items to just image files. */
    const getImageFilesFromItems = async (items) => {
        const imageFiles = []

        if (items) {
            Array.from(items).forEach(item => {
                if (item.kind === 'file' && acceptableFormats.includes(item.type)) {
                    const file = item.getAsFile()
                    imageFiles.push(file)
                }
            })
        }

        return imageFiles

    }
    
    const getAcceptableImageFiles = async (fileArray, onFileUpdate) => {
        const acceptableFiles = []

        if (fileArray) {
            fileArray.forEach(file => {
                if (acceptableFormats.includes(file.type)) {
                    acceptableFiles.push(file)
                } else {
                    const failedFile = getBaseFileObject(file.name, false, 'File type not accepted')
                    _onFileUpdate(onFileUpdate, failedFile)
                }
            })
        }

        return acceptableFiles
    }

    return {
        async uploadImageFilesForAnnotations(event, onFileUpdate) {
            const items = event.dataTransfer.items;
            const imageFiles = await getImageFilesFromItems(items)
            if (!imageFiles.length) return
            uploadImages(imageFiles, '/images/annotations/', onFileUpdate)
        },
        async uploadImageFilesForGrading(files, onFileUpdate) {
            const imageFiles = await getAcceptableImageFiles(files, onFileUpdate)
            if (!imageFiles.length) return
            uploadImages(imageFiles, '/images/', onFileUpdate)
        }
    }
}

