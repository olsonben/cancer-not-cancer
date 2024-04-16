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

export const bkuseTaskQueue = (maxPreload = 1) => {
    
    /** @type { ImageQueue } */
    const queue = useState('imageQueue', () => [])
    const indexMap = useState('imageQueueIndexMap', () => ({}))
    let index = useState('imageQueueIndex', () => 0)
    let historyIndex = useState('imageQueueHistoryIndex', () => 0)
    /** @type { ImageObject } */
    const curImg = useState('currentImage', () => nullImage)

    const updateCurrentImage = () => {
        console.log('updateCurrentImage')
        const position = index.value - historyIndex.value
        if (position < queue.value.length) {
            const nextImage = queue.value[position]
            if (!isLoaded(nextImage)) {
                // first or newly added images
                chained = true
                preLoadImage(position, 0)
            } else if (!chained) {
                // load 1 image to keep the preloaded queue full
                preLoadImage(position + maxPreload, maxPreload - 1)
            }
            curImg.value = nextImage

        } else {
            console.log('setting null image')
            curImg.value = nullImage
        }
    }

    watch(() => index.value, (newVal, oldVal) => {
        console.log('watch index', newVal, oldVal)
        updateCurrentImage()
    })
    watch(historyIndex, () => {
        console.log('watch historyIndex')
        updateCurrentImage()
    })


    /**
     * @param {BaseImageObject} initImageObject
     */
    const addImage = (initImageObject) => {
        const currentLength = queue.value.length
        indexMap.value[initImageObject.image_id] = currentLength
        queue.value.push({...initImageObject, ...additionalAttributes})
        if (historyIndex.value === 0 && index.value === currentLength) {
            // new/first load
            console.log('taskQueue: new/first load')
            updateCurrentImage()
            // chained = true
            // preLoadImage(index.value, 0)
        }
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
    const preLoadImage = (indx, preLoadCount = 0) => {
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
            if (preLoadCount < maxPreload && chained) {
                preLoadImage(indx + 1, preLoadCount + 1)
            } else {
                chained = false
            }
        }
    }

    /** Updates to the next image. */
    const nextImage = () => {
        console.log('taskQueue: nextImage')
        if (historyIndex.value === 0) {
            index.value++
        } else {
            historyIndex.value--
        }
    }

    const undo = () => {
        if (historyIndex.value === index.value) {
            console.log('No more to undo.')
        } else {
            historyIndex.value++
        }
    }

    const redo = () => {
        if (historyIndex.value > 0) {
           nextImage()
        } else {
            console.log('You are on the latest image.')
        }
    }

    const getImageById = (id) => {
        // returns undefined if the id doesn't exist
        return queue.value[indexMap.value[id]]
    }

    return {
        addImage,
        addImages,
        nextImage,
        undo,
        redo,
        getImageById,
        get currentImage() {
            return curImg
        }
    }

}