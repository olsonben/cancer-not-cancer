<script setup>
let isPopState = ref(false)
const popstateHandler = (event) => {
    isPopState.value = true
}

// setup popstate listener
window.addEventListener('popstate', popstateHandler)
onBeforeUnmount(() => {
    window.removeEventListener('popstate', popstateHandler)
})

const api = useApi()
const queue = useTaskQueue(1)

const route = useRoute()
const taskId = Number(route.params.taskId) || null
let imageId = Number(route.params.imageId) || null

let firstImage = null
if (imageId) {
    try {
        const { response } = await api.GET('/images/', { imageId: imageId })
        firstImage = response.value
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(`Image ${imageId} was not found.`)
        } else {
            throw error
        }
    }
}

/*******************************
 * TASK/RATING DATA AND CONTROLS
 *******************************/
const getCurrentTask = (id) => {
    const allTasks = useState('allTasks')
    return allTasks.value.find((task) => task.id === id)
}

/** Current Task Data */
const curTask = reactive({
    ...getCurrentTask(taskId),
    noMoreImages: false,
    showGuide: false
})

const currentImage = useState('currentImage')

/** Helper for resetting the image some after rating. */
const resetTrigger = ref(false)

/** Turns on the annotation modal. */
const showAnnotationGuide = () => { curTask.showGuide = true }

/** On rating either by click or swipe. */
const onClick = async (source) => {
    // determine the message based on source
    if (source === 'yes') {
        currentImage.value.rating = 1
    } else if (source === 'no') {
        currentImage.value.rating = -1
    } else if (source === 'maybe') {
        currentImage.value.rating = 0
    } else {
        return
    }

    // record the response
    try {
        // save important data
        const ratingImageId = currentImage.value.image_id
        const rating = currentImage.value.rating
        const comment = currentImage.value.comment

        // move on to the next image, and reset comment box
        queue.nextImage()
        resetTrigger.value = !resetTrigger.value

        // record important data, this POST is async, but making the
        // request happen after the image swapping after seeing weird
        // hiccups with image loading during development
        api.POST('/hotornot', {
            id: ratingImageId,
            rating: rating,
            comment: comment,
            taskId: curTask.id
        })

    } catch (error) {
        console.error(error)
    }

}

const buildImageObject = (imgData) => {
    return {
        ...imgData,
        'chipSize': curTask.chip_size,
        'fovSize': curTask.fov_size,
        'zoomScale': curTask.zoom_scale,
    }
}

/** Populates the queue with images from the current task. */
const getNewQueue = async () => {
    try {
        const { response } = await api.GET(`/images/task/${curTask.id}`)
        if (response.value.length === 0) {
            curTask.noMoreImages = true
            // TODO: this probably shouldn't live here
            const router = useRouter()
            router.push({ path: `/pathapp/task-${curTask.id}/` })
        } else {
            const check = new Set()
            if (firstImage) check.add(firstImage.image_id)
            const imageArray = response.value.reduce((acc, imgData) => {
                if (check.has(imgData.image_id)) {
                    return acc
                } else {
                    check.add(imgData.image_id)
                    return acc.concat([buildImageObject(imgData)])
                }
            }, [])

            // shuffle the images
            shuffleArray(imageArray)
            if (firstImage) imageArray.unshift(buildImageObject(firstImage))
            firstImage = null
            queue.addImages(imageArray)
            queue.nextImage()
        }
    } catch (error) {
        console.error(error)
    }
}
getNewQueue()

/** If the next image is null, we need to pull more images from the database. */
watch(() => currentImage.value, async (newValue, oldValue) => {
    if (newValue === null && oldValue !== null) {
        // end of queue... get more images if possible
        getNewQueue()
    }
    if (newValue) {
        const router = useRouter()
        if (imageId === null) {
            // TODO: can this be done without using imageId
            imageId = currentImage.value.image_id
            router.replace({ path: `/pathapp/task-${curTask.id}/${currentImage.value.image_id}` })
        } else {
            router.push({ path: `/pathapp/task-${curTask.id}/${currentImage.value.image_id}` })
        }
        useHead({
            title: `Task: ${curTask.id} - Image: ${currentImage.value.image_id}`
        })
    }
})

watch(() => isPopState.value, (popstate) => {
    if (popstate === true) {
        console.log('BACK BUTTON DETECTED')
        isPopState.value = false
    }
})

/*************************
 * SWIPE DATA AND CONTROLS
 *************************/
const swipe = reactive({
    moveRight: false,
    moveLeft: false,
    percent: 0.0
})

const cssVars = computed(() => {
    return {
        '--bg-no-opacity': (swipe.percent < 0 ? swipe.percent * -1.0 : 0),
        '--bg-yes-opacity': (swipe.percent > 0 ? swipe.percent * 1.0 : 0),
    }
})

// const disableSwipe = computed(() => !curTask.onDeck || curTask.showGuide)
const disableSwipe = computed(() => currentImage.value.image_id === null || curTask.showGuide)

const onSwipeMove = (newPercent) => {
    swipe.percent = newPercent

    if (swipe.percent >= 1) {
        swipe.moveLeft = false
        swipe.moveRight = true
    } else if (swipe.percent <= -1) {
        swipe.moveLeft = true
        swipe.moveRight = false
    } else {
        swipe.moveLeft = false
        swipe.moveRight = false
    }
}

const onSwipeEnd = (direction) => {
    if (direction === 'right') {
        onClick('yes')
    } else if (direction === 'left') {
        onClick('no')
    } else if (direction === 'up') {
        currentImage.value.commenting = true
    } else if (direction === 'down') {
        currentImage.value.commenting = false
    }
}

/**
 * Helper - Durstenfeld Shuffle
 * https://stackoverflow.com/a/12646864/3068136
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}
</script>

<template>
    <div class='app' :style="cssVars">
        <div class="bg no"></div>
        <div class="bg yes"></div>

        <!-- Image to grade -->
        <div class='prompt'>
            <div class='controls is-flex mb-5'>
                <div class="title is-4">{{ curTask.prompt }}</div>
            </div>
            <div class="has-text-danger" v-if="curTask.noMoreImages">No more images available in this task.</div>

            <ImageSwipe @swipe-move="onSwipeMove" @swipe-end="onSwipeEnd" :disabled="disableSwipe">
                <NuxtPage />
            </ImageSwipe>

            <div v-if="!curTask.noMoreImages" class='level is-flex'>
                <div class="level-left is-flex">
                    <div class="level-item">
                        <p class="help is-hidden-desktop">Tap to zoom.</p>
                        <p class="help is-hidden-touch">Click to zoom.</p>
                    </div>
                </div>
                <div class="level-right is-flex mt-0">
                    <div class="level-item">
                        <p class="help annotation-link" @click="showAnnotationGuide">
                            Annotation Guide
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Response section: grade + comment -->
        <div v-if="!curTask.noMoreImages" class='response-area'>
            <div class="has-text-centered swipe-pad" :class="{ 'shown': !currentImage.commenting }">
                <span class='icon swipe left'>
                    <img src="~assets/icons/arrow-set.svg" alt="swipe left">
                </span>
                <span class='icon swipe right'>
                    <img src="~assets/icons/arrow-set.svg" alt="swipe right">
                </span>
            </div>

            <!-- Grade buttons -->
            <div class='block grade-buttons'>
                <button class='button no' :class="{ 'shown': swipe.moveLeft }" @click="onClick('no')">No</button>
                <button class='button maybe' @click="onClick('maybe')">Maybe</button>
                <button class='button yes' :class="{ 'shown': swipe.moveRight }" @click="onClick('yes')">Yes</button>
            </div>

            <!-- Comment -->
            <button class='button icon-button comment' @click='currentImage.commenting = !currentImage.commenting'>
                <span class='icon'>
                    <fa-icon :icon="['fas', 'pencil']" class="fa-xl" />
                </span>
            </button>
            <div class="container">
                <textarea class='textarea block' :class="{ 'shown': currentImage.commenting }"
                    placeholder="Add a comment to this image or leave blank." v-model="currentImage.comment"></textarea>
            </div>

        </div>

        <AnnotationGuide v-if="curTask.showGuide" @exit="curTask.showGuide = !curTask.showGuide"
            :task-id="curTask.id" />
    </div>
</template>

<style lang='scss' scoped>
.app {
    /* To prevent scrolling */
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding-top: $block-margin;
}

$yes-cancer-color: #5A46B9;
$no-cancer-color: #ff6184;

@mixin bg-fade-out {
    transition: opacity 250ms ease-out;
    opacity: 0;
}

.bg {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0.0;
    transition: opacity 50ms;
    // display: none;


    &.no {
        background-color: lighten($no-cancer-color, 10%);
        opacity: var(--bg-no-opacity);

        // override existing transtion for transitioning image
        &.fade-out {
            @include bg-fade-out;
        }
    }

    &.yes {
        background-color: lighten($yes-cancer-color, 10%);
        opacity: var(--bg-yes-opacity);

        // override existing transtion for transitioning image
        &.fade-out {
            @include bg-fade-out;
        }
    }
}

/* Control image size + overlay */
.prompt {
    margin: auto;
    position: relative;
    max-width: 50vh;
    padding-bottom: $block-margin;
    width: 100%;

    @include for-size(mobile) {
        padding: 0 $block-margin 0;
        max-width: 100%;
    }

    .controls {
        color: hsl(0deg, 0%, 29%);
        // width: 100%;

        @include for-size(mobile) {
            padding: 0 0;
        }

        strong {
            padding-top: 0.8rem;
            display: inline-block;
        }
    }

}

.annotation-link {
    text-decoration: underline;
    cursor: pointer;
}

/* stuck to the bottom of the screen */
.response-area {
    margin: 0 auto;
    width: 100%;
    max-width: 50vh;

    display: flex;
    justify-content: center;
    flex-direction: column;

    @include for-size(mobile) {
        padding: 0 $block-margin $block-margin;
        max-width: 100%;
    }

    /* special for extra-small mobile */
    @include for-size(small_mobile) {
        margin: 0 9px;
        max-width: 100%;
    }

    & .swipe-pad {
        width: 100%;
        padding-bottom: 1.25rem;
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        // Don't show the swipe arrows on none touch devices
        // https://stackoverflow.com/a/11387852
        @media (hover: hover) {
            display: none;
        }

        .icon.swipe {
            width: 6.625rem;
            height: 0rem;
            pointer-events: none;
            opacity: 0;

            transition-property: height, opacity;
            transition-duration: 0.25s;
            transition-timing-function: ease-out;


            &.left {
                align-self: flex-start;
            }

            &.right {
                align-self: flex-end;
                transform: rotate(180deg);
            }
        }

        &.shown {
            .icon.swipe {
                height: 3.125rem;
                opacity: 0.4;
            }
        }
    }

    .container {
        margin: 0;

        textarea {
            min-height: 0;
            height: 0px;
            opacity: 0;
            // transition: height 0.25s ease-out;
            transition-property: height, opacity;
            transition-duration: 0.25s;
            transition-timing-function: ease-out;

            &.shown {
                height: 70px;
                opacity: 1;
            }
        }
    }
}

.icon-button {
    /* centered circle */
    border-radius: 50%;
    margin: 0 auto $button-margin auto;

    &.comment {
        background-color: rgba(0, 0, 0, 0);
    }
}

.grade-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    flex-wrap: nowrap;
    width: 100%;
    // margin-bottom: 0.75rem;

    .button {
        /* coloration for "yes" and "no" buttons to match grade bars */
        border-color: #00000033;
        padding: 0.75rem 0.875rem;
        width: 5.5rem;

        &.no {
            /* lighten is a native sass function */
            background-color: lighten($no-cancer-color, 20%);

            &.shown {
                background-color: $no-cancer-color;
            }
        }

        &.yes {
            background-color: lighten($yes-cancer-color, 30%);

            &.shown {
                background-color: $yes-cancer-color;
            }
        }
    }

}
</style>