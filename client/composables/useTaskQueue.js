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
 * @typedef {Object} ImageObject
 * @extends BaseImageObject
 * @property {boolean} loaded - Indicates whether the image is loaded. 
 * @property {?HTMLImageElement} imgHtml - The created HTMLImageElement
 * @property {?number} rating - The rating a view assigns to the image. 
 * @property {?string} comment - Comments the observer would like to leave. 
 * @property {boolean} commenting - Is the observer making a comment. 
 */

/**
 * @typedef {Array<ImageObject>} ImageQueue 
 */

let chained = true // chain multiple loads together

/** @type { ImageObject } */
const nullImage = {
    imageUrl: '',
    chipSize: null,
    fovSize: null,
    zoomScale: null,
    name: 'null',
    image_id: null,
    loaded: false,
    imgHtml: null,
    rating: null,
    comment: '',
    commenting: false
}

const additionalAttributes = {
    loaded: false,
    imgHtml: null,
    rating: null,
    comment: '',
    commenting: false
}

export const useTaskQueue = (iMaxPreload = 1) => {
    const maxPreload = useState('maxPreload', () => iMaxPreload)

    /** @type {Ref<ImageQueue>} */
    const queue = useState('imageQueue', () => [])
    /** @type { Ref<Number> } */
    const index = useState('imageQueueIndex', () => 0)
    /** @type { Ref<Number> } */
    const historyIndex = useState('historyIndex', () => 0)
    /** @type { ImageObject } */
    const currentImage = useState('currentImage', () => nullImage)

    /**
     * @param {BaseImageObject} initImageObject
     */
    const addImage = (initImageObject) => {
        queue.value.push({...initImageObject, ...additionalAttributes})
    }

    /**
     * @param {Array<BaseImageObject>} initialImageObjects 
     */
    const addImages = (initialImageObjects) => {
        for (const initImageObject of initialImageObjects) {
            addImage(initImageObject)
        }
    }    

    /**
     * Is this image object loaded?
     * @param {ImageObject} imgObj 
     * @returns {boolean}
     */
    const isLoaded = (imgObj) => imgObj.loaded || imgObj.imgHtml     

    /**
     * Loads an image in the background with a HTMLImageElement. Also depending on
     * maxPreload and chained, it will load the following image sequentially.
     * @param {Number} indx The next image to load
     * @param {Number} preLoadCount - number of images currently preloaded
     */
    const loadImage = (indx, preLoadCount = 0) => {
        // no more images to load
        if (indx >= queue.value.length) return

        // image data object to be loaded
        const imageObj = queue.value[indx]

        // Already loaded
        if (isLoaded(imageObj)) return

        const imgElement = new Image()
        imageObj.imgHtml = imgElement
        imgElement.loading = 'eager' // prevent lazy loading
        imgElement.src = imageObj.imageUrl
        imgElement.onload = () => {
            imageObj.loaded = true
            delete imageObj.imgHtml // remove HTMLImageElement to save memory

            // chain together to queue up multiple preloaded images
            if (preLoadCount < maxPreload.value && chained) {
                loadImage(indx + 1, preLoadCount + 1)
            } else {
                chained = false
            }
        }
    }

    /**
     * Updates to the next image.
     */
    const nextImage = () => {
        if (historyIndex.value > 0) {
            currentImage.value = queue.value[index.value-1]
            historyIndex.value = 0
            return
        }

        if (index.value >= queue.value.length) {
            console.log('No more images')
            currentImage.value = nullImage
            return
        }

        const nextImage = queue.value[index.value]

        if (!isLoaded(nextImage)) {
            // first or newly added images
            chained = true
            loadImage(index.value, 0)
        } else if (!chained) {
            // load 1 image to keep the preloaded queue full
            loadImage(index.value + maxPreload.value, maxPreload.value - 1)
        }
        index.value += 1
        currentImage.value = nextImage
    }

    const undo = () => {
        if (historyIndex.value === index.value-1) {
            console.log('No more to undo.')
        } else {
            historyIndex.value++
            currentImage.value = queue.value[index.value-1 - historyIndex.value]
        }
    }

    const redo = () => {
        if (historyIndex.value > 0) {
            historyIndex.value--
            currentImage.value = queue.value[index.value-1 - historyIndex.value]
        } else {
            console.log('You are on the latest image.')
        }
    }

    /**
     * Reset/Empty the image queue for a new set of images
     */
    const reset = () => {
        queue.value = []
        index.value = 0
        currentImage.value = nullImage
        historyIndex.value = 0
    }

    return {
        addImage,
        addImages,
        nextImage,
        currentImage,
        undo,
        redo,
        reset,
    }

}