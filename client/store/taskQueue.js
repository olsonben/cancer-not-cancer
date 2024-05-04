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
    const maxPreload = 1
    /** @type { Ref<ImageQueue> } */
    const queue = ref([])
    let indexMap = new Map()
    let chained = true // chain multiple loads together
    const index = ref(0)
    const historyIndex = ref(0)
    const currentImage = ref(nullImage)
    const taskObj = ref(null)
    let allImagesLoaded = false

    const noUndos = computed(() => (index.value - historyIndex.value) === 0)
    const noRedos = computed(() => historyIndex.value === 0)

    const { getMoreImages, getOneImage } = useTaskDataFetch()
    
    function reset() {
        queue.value = []
        indexMap = new Map()
        index.value = 0
        historyIndex.value = 0
        currentImage.value = nullImage
        allImagesLoaded = false
    }

    function updateCurrentImage() {
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
            currentImage.value = nextImage

        } else if (allImagesLoaded) {
            console.log('setting null image')
            currentImage.value = nullImage
        } else {
            // load more images
            getMoreImages(taskObj.value).then((moreImages) => {
                if (moreImages.length !== 0) {
                    addImages(moreImages)
                } else {
                    allImagesLoaded = true
                }
                updateCurrentImage()
            })
        }
    }

    watch(() => index.value, (newVal, oldVal) => {
        updateCurrentImage()
    })
    watch(historyIndex, () => {
        updateCurrentImage()
    })

    function moveElementInArray(indexToMove) {
        if (indexToMove !== index.value) {
            if (indexToMove < index.value) {
                // Decrement current index
                index.value--;
            }
            // Extract the element that needs to be moved
            const elementToMove = queue.value.splice(indexToMove, 1)[0];
            // Insert the extracted element at the new current index
            queue.value.splice(index.value, 0, elementToMove);
            historyIndex.value = 0
            indexMap = new Map(queue.value.map((img, i) => [img.image_id, i]))
            // TODO: this will probably be redundant with the two index watchers
            // though there is a scenario where the indexs don't change but the
            // image needs to be updated.
            updateCurrentImage()
        }
    }

    function rearrangeQueueToId(id) {
        const imageIndex = indexMap.get(id)
        moveElementInArray(imageIndex)
    }

    /**
     * @param {BaseImageObject} initImageObject
     */
    function addImage(initImageObject) {
        const currentLength = queue.value.length
        indexMap.set(initImageObject.image_id, currentLength)
        queue.value.push({ ...initImageObject, ...additionalAttributes })
    }

    /**
     * @param {Array<BaseImageObject>} initialImageObjects 
     */
    function addImages(initialImageObjects) {
        const shouldUpdate = Boolean(historyIndex.value === 0 && index.value === queue.value.length)
        for (const initImageObject of initialImageObjects) {
            addImage(initImageObject)
        }
        if (shouldUpdate) updateCurrentImage()
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
    function preLoadImage(indx, preLoadCount = 0) {
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

    /**
     * Updates to the next image.
     */
    const nextImage = () => {
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
        return queue.value[indexMap.get(id)]
    }

    const isImageInQueue = (id) => {
        return (indexMap.get(id) !== undefined)
    }

    async function init(curTask, imageId = null) {
        if (curTask.id !== taskObj.value?.id) {
            taskObj.value = curTask
            reset()
            const imageData = await getMoreImages(curTask, imageId)
            if (imageData.length === 0) allImagesLoaded = true
            addImages(imageData)
        } else if (curTask.id === taskObj.value?.id && imageId === null) {
            // TODO: possibly update currentImage, once undo is in use
            // REPRODUCE: grade 3, undo, nav to tasks, pick same task
            historyIndex.value = 0
        } else {
            if (currentImage.value.image_id !== imageId) {
                if (!isImageInQueue(imageId)) {
                    const newImage = getOneImage(curTask, imageId)
                    addImage(newImage)
                }

                rearrangeQueueToId(imageId)
            }
        }
    }

    return {
        addImage,
        addImages,
        nextImage,
        undo,
        redo,
        noUndos,
        noRedos,
        getImageById,
        currentImage,
        reset,
        init
    }
})