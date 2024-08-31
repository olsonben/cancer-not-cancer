export const useTaskDataFetch = () => {
    const api = useApi()
    
    const buildImageObject = (curTask, imgData) => {
        return {
            ...imgData,
            'chipSize': curTask.chip_size,
            'fovSize': curTask.fov_size,
            'zoomScale': curTask.zoom_scale,
        }
    }

    const getFirstImage = async (imageId = null) => {
        let firstImage = null
        if (imageId === null) return firstImage
        try {
            firstImage = await api.$fetch('/images/', {
                'imageId': imageId
            })
        } catch (error) {
            if (error.statusCode === 404) {
                console.warn(`Image ${imageId} was not found.`)
            } else {
                throw error
            }
        }

        return firstImage
    }

    const getImages = async (taskId) => {
        let imageData = []
        try {
            imageData = await api.$fetch(`/images/task/${taskId}`, {}, null, { "Cache-Control": "no-cache" })
        } catch (error) {
            console.error('Image data error.')
            console.error(error)
        }
        return imageData
    }

    const processImageData = (curTask, imageDataArray, firstImage = null) => {
        const check = new Set()
        if (firstImage) check.add(firstImage.image_id)
        const imageArray = imageDataArray.reduce((acc, imgData) => {
            if (check.has(imgData.image_id)) {
                return acc
            } else {
                check.add(imgData.image_id)
                return acc.concat([buildImageObject(curTask, imgData)])
            }
        }, [])

        // shuffle the images
        shuffleArray(imageArray)
        if (firstImage) {
            imageArray.unshift(buildImageObject(curTask, firstImage))
        }
        return imageArray
    }
    
    const getSingleImage = async (curTask, imageId) => {
        if (curTask && imageId) {
            try {
                const newImage = await getFirstImage(imageId)
                return processImageData(curTask, [], newImage)[0]
            } catch (error) {
                console.error(error)
            }
        }
    }

    const getBatchOfImages = async (curTask, initImageId = null) => {
        try {
            const [firstImage, imageData] = await Promise.all([
                getFirstImage(initImageId),
                getImages(curTask.id)
            ])
            return processImageData(curTask, imageData, firstImage)
        } catch (error) {
            console.error(error)
            return []
        }
    }

    return {
        getBatchOfImages,
        getSingleImage
    }
}