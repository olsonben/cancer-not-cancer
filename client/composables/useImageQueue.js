/**
 * @typedef {Object} BaseImageObject 
 * @property {string} imageUrl - the source url of the image
 * @property {?number} chipSize - size of the roi
 * @property {?number} fovSize - size of the chip and surrounding context
 * @property {?number} zoomScale - the amount to zoom when clicked
 * @property {string} name - image name
 * @property {number} image_id - image id
 */

/**
 * @typedef {BaseImageObject & Object} QueueObject
 * @property {boolean} loaded - Indicates whether the image is loaded. 
 * @property {?HTMLImageElement} imgHtml - The created HTMLImageElement
 * @property {?number} rating - The rating a view assigns to the image. 
 */

/**
 * 
 * @typedef {Array<QueueObject>} ImageQueue 
 */

export const useImageQueue = (maxPreload) => {
    const additionalAttributes = {
        loaded: false,
        imgHtml: null,
        rating: null
    }

    /**
     * @type {Ref<ImageQueue>}
     */
    const queue = ref([])
    const index = ref(0)
    let processing = false

    /**
     * 
     * @param {BaseImageObject} imageObject
     */
    const addImage = (imageObject) => {
        queue.value.push({...imageObject, ...additionalAttributes})
    }

    /**
     * 
     * @param {Array<BaseImageObject} arrayOfImageObjects 
     */
    const addImages = (arrayOfImageObjects) => {
        for (const imageObject of arrayOfImageObjects) {
            addImage(imageObject)
        }
    }

    /**
     * Create the HTMLImageElement for an image.
     * @param {QueueObject} queueObject 
     */
    const loadImage = async (queueObject) => {
        var imageTag = new Image()
        queueObject.loaded = true
        imageTag.onload = () => {
            // do stuff on load
            // TODO: Consider initiating processImages here to make them load sequentially.
        }
        imageTag.src = queueObject.imageUrl
        imageTag.alt = queueObject.imageUrl
        queueObject.imgHtml = imageTag
    }

    const processImages = () => {
        if (processing) return
        
        processing = true
        for (let i = index.value; i < queue.value.length; i++) {
            if (i - index.value >= maxPreload) break
            if (queue.value[i].loaded) continue

            loadImage(queue.value[i])
        }
        processing = false
    }

    watch(queue, () => {
        processImages()
    })

    /**
     * Returns the next image for rating/grading.
     * @returns {QueueObject}
     */
    const getNextImage = () => {
        if (index.value > queue.value.length) {
            index.value = 0
            console.log('Back to the beginning')
        }

        const nextImage = queue.value[index.value]
        index.value += 1

        processImages()

        return nextImage
    }

    const reset = () => {
        queue.value = []
        index.value = 0
        processing = false
    }


    return {
        addImage,
        addImages,
        getNextImage,
        reset
    }

}