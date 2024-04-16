import { defineStore } from "pinia"

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

export const useTaskQueue = defineStore('taskQueue', () => {
    console.log('QUEUE CREATED')
    const maxPreload = 1
    /** @type { Ref<ImageQueue> } */
    const queue = ref([])
    const indexMap = ref(new Map())
    const index = ref(0)
    const historyIndex = ref(0)
    const currentImage = ref(nullImage)
    const initialLoad = ref(false)

    watch(initialLoad, (nVal, oVal) => { console.log('init change')})

    /**
     * @param {BaseImageObject} initImageObject
     */
    const addImage = (initImageObject) => {
        indexMap.value.set(initImageObject.image_id, queue.value.length)
        queue.value.push({ ...initImageObject, ...additionalAttributes })
        initialLoad.value = true
    }

    /**
     * @param {Array<BaseImageObject>} initialImageObjects 
     */
    const addImages = (initialImageObjects) => {
        console.log('adding images')
        for (const initImageObject of initialImageObjects) {
            addImage(initImageObject)
        }
        console.log('done: adding images')
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
            if (preLoadCount < maxPreload && chained) {
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
            currentImage.value = queue.value[index.value - 1]
            historyIndex.value = 0
            return
        }

        if (index.value >= queue.value.length) {
            console.log('No more images')
            currentImage.value = nullImage
            return
        }

        const nxtImg = queue.value[index.value]

        if (!isLoaded(nxtImg)) {
            // first or newly added images
            chained = true
            loadImage(index.value, 0)
        } else if (!chained) {
            // load 1 image to keep the preloaded queue full
            loadImage(index.value + maxPreload, maxPreload - 1)
        }
        index.value += 1
        currentImage.value = nxtImg
    }

    const undo = () => {
        if (historyIndex.value === index.value - 1) {
            console.log('No more to undo.')
        } else {
            historyIndex.value++
            currentImage.value = queue.value[index.value - 1 - historyIndex.value]
        }
    }

    const redo = () => {
        if (historyIndex.value > 0) {
            historyIndex.value--
            currentImage.value = queue.value[index.value - 1 - historyIndex.value]
        } else {
            console.log('You are on the latest image.')
        }
    }

    const getImageById = (id) => {
        console.log(`getImageById: ${id}, ${queue.value.length}`)
        // ~~returns undefined if the id doesn't exist~~
        // returns nullImage if the id doesn't exist
        return queue.value[indexMap.value.get(id)] || nullImage
    }

    return { addImage, addImages, nextImage, undo, redo, getImageById, currentImage, initialLoad }
})