<script setup>
import { useTaskQueue } from '@/store/taskQueue'
const config = useRuntimeConfig()
const router = useRouter()
const api = useApi()

useOnBackButton(() => {
    console.log('BACK BUTTON DETECTED')
})

const route = useRoute()
const taskId = Number(route.params.taskId) || null
const imageId = computed(() => (Number(route.params.imageId) || null))

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

const queue = useTaskQueue()

/** If the next image is null, we need to pull more images from the database. */
watch(() => queue.currentImage, async (newValue, oldValue) => {
    if (newValue.image_id === null && oldValue.image_id !== null) {
        // end of queue... get more images if possible
        navigateTo({ path: `/pathapp/task-${curTask.id}/` })
        useHead({
            title: `Task: ${curTask.id} - Image: --`
        })
    }
    if (newValue.image_id !== null) {
        // const router = useRouter()
        if (imageId.value === null) {
            // previously different task
            router.replace({ path: `/pathapp/task-${curTask.id}/${newValue.image_id}` })
        } else {
            // After grading the previous slide OR first load with imageId defined
            navigateTo({ path: `/pathapp/task-${curTask.id}/${newValue.image_id}` })
        }
        useHead({
            title: `Task: ${curTask.id} - Image: ${newValue.image_id}`
        })
    }
})

// Wait for the store to initate during ssr
await useAsyncData('initialQueue', async () => {
    await queue.init(curTask, imageId.value)
    return true
})

if (queue.currentImage.image_id) {
    // revisit
    router.replace({ path: `/pathapp/task-${curTask.id}/${queue.currentImage.image_id}` })
    useHead({
        title: `Task: ${curTask.id} - Image: ${queue.currentImage.image_id}`
    })
}

/** Turns on the annotation modal. */
const showAnnotationGuide = () => { curTask.showGuide = true }

const preRatingClass = computed(() => {
    switch (queue.currentImage.rating) {
        case -1:
            return 'prev-no'
        case 0:
            return 'prev-maybe'
        case 1:
            return 'prev-yes'
        default:
            return ''
    }
})

/** On rating either by click or swipe. */
const onClick = async (source) => {
    // determine the message based on source
    if (source === 'yes') {
        queue.currentImage.rating = 1
    } else if (source === 'no') {
        queue.currentImage.rating = -1
    } else if (source === 'maybe') {
        queue.currentImage.rating = 0
    } else {
        return
    }


    // record the response
    try {
        // save important data
        const ratingImageId = queue.currentImage.image_id
        const rating = queue.currentImage.rating
        const comment = queue.currentImage.comment

        // move on to the next image, and reset comment box
        queue.nextImage()

        // record important data, this POST is async, but making the
        // request happen after the image swapping after seeing weird
        // hiccups with image loading during development

        // TODO: Update useAPI to have a $fetch method for this kind of instance.
        $fetch('/hotornot', {
                method: 'POST',
                baseURL: config.public.apiUrl,
                credentials: 'include',
                body: {
                    id: ratingImageId,
                    rating: rating,
                    comment: comment,
                    taskId: curTask.id
                }
            }
        )

    } catch (error) {
        console.error(error)
    }

}


function useOnBackButton(onBackButtonCallback) {
    let isPopState = ref(false)

    onMounted(() => {
        const popstateHandler = (event) => {
            isPopState.value = true
        }
    
        // setup popstate listener
        window.addEventListener('popstate', popstateHandler)
        onBeforeUnmount(() => {
            window.removeEventListener('popstate', popstateHandler)
        })
    })

    watch(() => isPopState.value, (popstate) => {
        if (popstate === true) {
            onBackButtonCallback()
            isPopState.value = false
        }
    })
}

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
const disableSwipe = computed(() => queue.currentImage.image_id === null || curTask.showGuide)

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
        queue.currentImage.commenting = true
    } else if (direction === 'down') {
        queue.currentImage.commenting = false
    }
}

</script>

<template>
    <div class='app' :style="cssVars">
        <div class="bg no"></div>
        <div class="bg yes"></div>

        <!-- Image to grade -->
        <div class='prompt'>
            <div class="level mb-1 is-mobile is-flex">
                <div class="level-left is-flex-grow-1 is-flex-shrink-1">
                    <div class="back-link is-size-4 mt-2">
                        <NuxtLink to="/pathapp">
                            <span class="icon">
                                <fa-icon :icon="['fas', 'chevron-left']" />
                            </span>
                        </NuxtLink>
                    </div>
                    <div id="prompt-question" class="title is-5">
                        {{ curTask.prompt }}
                    </div>
                </div>
                <div class="level-right mt-0 is-flex-grow-0 is-flex-shrink-0">
                    <button class="button is-small" :disabled="queue.noUndos" title="undo" type="button"
                        @click="queue.undo">
                        <span class="icon"><fa-icon :icon="['fas', 'reply']" /></span>
                    </button>
                    <button class="button is-small" :disabled="queue.noRedos" title="redo" type="button"
                        @click="queue.redo">
                        <span class="icon mirror"><fa-icon :icon="['fas', 'reply']" /></span>
                    </button>
                </div>
            </div>
            <div class="has-text-danger" v-if="curTask.noMoreImages">No more images available in this task.</div>

            <ImageSwipe :class="preRatingClass" @swipe-move="onSwipeMove" @swipe-end="onSwipeEnd"
                :disabled="disableSwipe">
                <NuxtPage />
            </ImageSwipe>

            <div v-if="!curTask.noMoreImages" class='level is-flex'>
                <div class="level-left is-flex">
                    <div class="level-item">
                        <p class="help is-hidden-desktop">Tap to Zoom</p>
                        <p class="help is-hidden-touch">Click to Zoom</p>
                    </div>
                </div>
                <div id="swipe-tip" class="is-hidden-desktop level-item mb-0">
                    <span class='icon swipe left mt-1'>
                        <img src="~assets/icons/arrow-set.svg" alt="swipe left">
                    </span>
                    <p class="help pl-1 pr-1">
                        Swipe to Grade
                    </p>
                    <span class='icon swipe right mt-1'>
                        <img src="~assets/icons/arrow-set.svg" alt="swipe right">
                    </span>
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
        <div v-if="!curTask.noMoreImages" class='response-area pt-4'>
            <!-- <div class="has-text-centered swipe-pad" :class="{ 'shown': !queue.currentImage.commenting }">
                <span class='icon swipe left'>
                    <img src="~assets/icons/arrow-set.svg" alt="swipe left">
                </span>
                <span class='icon swipe right'>
                    <img src="~assets/icons/arrow-set.svg" alt="swipe right">
                </span>
            </div> -->

            <!-- Grade buttons -->
            <div class='block grade-buttons'>
                <button class='button no' :class="{ 'shown': swipe.moveLeft }" @click="onClick('no')">No</button>
                <button class='button maybe' @click="onClick('maybe')">Maybe</button>
                <button class='button yes' :class="{ 'shown': swipe.moveRight }" @click="onClick('yes')">Yes</button>
            </div>

            <!-- Comment -->
            <button class='button icon-button comment'
                @click='queue.currentImage.commenting = !queue.currentImage.commenting'>
                <span class='icon'>
                    <fa-icon :icon="['fas', 'pencil']" class="fa-xl" />
                </span>
            </button>
            <div class="container">
                <textarea class='textarea block' :class="{ 'shown': queue.currentImage.commenting }"
                    placeholder="Add a comment to this image or leave blank."
                    v-model="queue.currentImage.comment"></textarea>
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

.icon.swipe.right {
    transform: rotate(180deg);
}
#swipe-tip .swipe {
    opacity: 0.4;
}

.icon-button {
    /* centered circle */
    border-radius: 50%;
    margin: 0 auto $button-margin auto;

    &.comment {
        background-color: rgba(0, 0, 0, 0);
    }
}

.mirror {
    transform: scale(-1,1);
}

.back-link a {
    color: hsl(0, 0%, 50%);
}
.back-link:hover a {
    color: hsl(0, 0%, 21%);
}

// NOTE: text-wrap is super new!
// https://developer.chrome.com/docs/css-ui/css-text-wrap-balance
#prompt-question {
    // white-space: unset;
    text-wrap: balance;
}
.prev-yes {
    border: 4px solid $yes-cancer-color;
}

.prev-no {
    border: 4px solid $no-cancer-color;
}

.prev-maybe {
    border: 4px solid black;
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