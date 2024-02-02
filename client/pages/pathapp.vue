<template>
    <div class='app' :style='cssVars'>
        <div class="bg no" :class="{'fade-out': transitioningOut}"></div>
        <div class="bg yes" :class="{'fade-out': transitioningOut}"></div>

        <!-- Image to grade -->
        <div class='prompt'>
            <div class='controls level'>
                <TaskPicker @taskSelected="(newTaskId) => { selectedTask = newTaskId }"></TaskPicker>
            </div>
            <div class="has-text-danger" v-if="!image.id">No more images available in this task.</div>

            <ImageSwipe @swipeMove="" @swipe-move="updatePercent" @swipe-end="swipeEnd" :disabled="!image.id">
                <ImageDisplay v-if="this.currentTask && image.id" :imageUrl="image.url" :chipSize="this.currentTask.chip_size" :fovSize="this.currentTask.fov_size" :zoomScale="this.currentTask.zoom_scale"/>
            </ImageSwipe>  

            <div v-if='image.id' class='controls level'>
                <p class="help is-hidden-desktop">Tap to zoom.</p>
                <p class="help is-hidden-touch">Click to zoom.</p>
            </div>
        </div>
        
        <!-- Response section: grade + comment --> 
        <div v-if="image.id" class='response-area'>
            <div class="has-text-centered swipe-pad" :class="{ 'shown': !commenting }">
                <span class='icon swipe left'>
                    <img src="~assets/icons/arrow-set.svg" alt="swipe left">
                </span>
                <span class='icon swipe right'>
                    <img src="~assets/icons/arrow-set.svg" alt="swipe right">
                </span>
            </div>

            <!-- Grade buttons -->
            <div class='block grade-buttons'>
                <button class='button no' :class="{ 'shown': moveLeft }" @click="onClick('no')">No</button>
                <button class='button maybe' @click="onClick('maybe')">Maybe</button>
                <button class='button yes' :class="{ 'shown': moveRight }" @click="onClick('yes')">Yes</button>
            </div>

            <!-- Comment -->
            <button class='button icon-button comment' @click='commenting = !commenting'>
                <span class='icon'>
                    <fa-icon :icon="['fas', 'pencil']" class="fa-xl" />
                </span>
            </button>
            <div class="container">
                <textarea class='textarea block' :class="{ 'shown': commenting }" placeholder="Add a comment to this image or leave blank." v-model="comment"></textarea>
            </div>

        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia'
import { useUserStore } from '~/store/user'
const api = useApi()

const IMAGE_TRANSITION_TIME = 250 // ms
// const IMAGE_TRANSITION_TIME = 2000 // ms

export default {
    data() {
        return {
            // Information to display and grade the current image
            image: { url: '' },
            onDeck: null,
            queue: null,
            selectedTask: null,
            currentTask: null,
            tasks: [],

            // State information
            rating: '',
            comment: '',
            commenting: false,
            transitioningOut: false,

            // For swiping
            moveRight: false,
            moveLeft: false,
            percent: 0.0,
        }
    },
    async mounted() {
        if (this.isLoggedIn) {
            const { response } = await api.GET('/tasks/')
            this.tasks = response.value // because response is a ref object
            this.selectedTask = this.tasks[0].id
            this.currentTask = this.tasks[0]
        }

        this.nextImage()
        
    },
    

    computed: {
        ...mapState(useUserStore, ['isLoggedIn', 'isPathologist']),
        // give the attribute `:style='cssVars'` to anything that should have access to these variables
        cssVars() {
            return {
                '--bg-no-opacity': (this.percent < 0 ? this.percent*-1.0 : 0),
                '--bg-yes-opacity': (this.percent > 0 ? this.percent*1.0 : 0),
                '--img-trans': IMAGE_TRANSITION_TIME + 'ms'
            }
        }
    },
    watch: {
        isLoggedIn: {
            async handler(loggedIn) {
                if (loggedIn) {
                    // Previously not logged in, and now logged in.
                    const { response } = await api.GET('/tasks/')
                    this.tasks = response.value // because response is a ref object
                    this.selectedTask = this.tasks[0].id
                    this.currentTask = this.tasks[0]
                    this.nextImage()

                }
            }
        },
        selectedTask: {
            handler(newTaskId) {
                this.queue = null
                this.currentTask = this.tasks.find((task) => task.id === newTaskId)
                this.nextImage()
            }
        }
    },
    methods: {
        updatePercent(newPercent) {
            this.percent = newPercent
            
            if (this.percent >= 1) {
                this.moveLeft = false
                this.moveRight = true
            } else if (this.percent <= -1) {
                this.moveLeft = true
                this.moveRight = false
            } else {
                this.moveLeft = false
                this.moveRight = false
            }
        },

        swipeEnd(direction) {
            if (direction === 'right') {
                this.onClick('yes')
            } else if (direction === 'left') {
                this.onClick('no')
            } else if (direction === 'up') {
                this.commenting = true
            } else if (direction === 'down') {
                this.commenting = false
            }
        },
        /**********************************************
        * App Control
        **********************************************/
        // when a button is clicked
        async onClick(source) {
            // determine the message based on source
            if (source === 'yes') {
                this.rating = 1
            } else if (source === 'no') {
                this.rating = -1
            } else if (source === 'maybe') {
                this.rating = 0
            } else {
                return
            }

            // record the response
            try {
                await api.POST('/hotornot', {
                    id: this.image.id,
                    rating: this.rating,
                    comment: this.comment,
                    taskId: this.selectedTask
                })
                // move on to the next image
                this.nextImage()
            } catch (error) {
                console.error(error)
            }

            /* reset */
            this.comment = ''
            this.commenting = false

        },

        async getImageQueue() {
            try {
                const { response } = await api.GET('/images/queue', {
                    taskId: this.selectedTask
                })
                this.queue = response.value
            } catch (error) {
                console.error(error)
            }
        },

        getNextImageId() {
            const nextImageIndex = Math.floor(Math.random() * this.queue.length)
            const nextImageId = this.queue[nextImageIndex]
            this.queue.splice(nextImageIndex, 1)

            return nextImageId
        },

        async nextImage() { 
            if (this.selectedTask == null) {
                return
            }

            if (this.isPathologist) {
                try {
                    if (this.queue == null) {
                        await this.getImageQueue()
                    }
                    
                    // if the image queue is empty, do not proceed
                    if (this.queue && !this.queue.length) {
                        // TODO: handle the last image more gracefully with transitions.
                        this.image = { url: '' } // reset main image
                        return
                    }
                    // console.log('nextImage')
                    const nextImageId = this.getNextImageId()

                    const { response } = await api.GET('/images/', {
                        imageId: nextImageId,
                    })
                    // console.log(response.value)
                    // We preload the image asynchronously allowing for smooth
                    // fade in and out between images. The image is loaded
                    // outside the DOM, but that data will be cached for the
                    // actually image load.
                    // if (Object.keys(this.image).length === 0) {
                        // don't preload
                        // console.log("Don't Preload")
                        this.onDeck = response.value
                        this.updateImage()
                    // } else {
                    //     // preload
                    //     console.log("Preloading")
                    //     var preloadImage = new Image()
                    //     preloadImage.onload = () => {
                    //         this.onDeck = response.value
                    //         this.updateImage()
                    //     }
                    //     preloadImage.src = response.value.url
                    // }
                    
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.log('Not a pathologist or not logged in.')
            }
        },

        // Called at the end of image transition out and upon completion of 
        // image preloading. If both are complete we can move ahead with
        // updating the image element.
        updateImage() {
            if (!this.transitioningOut && this.onDeck) {
                this.image = this.onDeck
                this.onDeck = null
            }
        },

        // After the image fully transitions out. 
        afterLeave() {
            console.log('after leave')
            // reset img props here
            this.resetImagePos()
            this.transitioningOut = false
            this.updateImage()
        },
        // Before the image starts transitioning out.
        beforeLeave() {
            console.log('before leave')
            this.transitioningOut = true
        }
    }
}
</script>

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
            transition: opacity var(--img-trans) ease-out;
            opacity: 0;
        }
    }
    
    &.yes {
        background-color: lighten($yes-cancer-color, 10%);
        opacity: var(--bg-yes-opacity);

        // override existing transtion for transitioning image
        &.fade-out {
            transition: opacity var(--img-trans) ease-out;
            opacity: 0;
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
        padding: 0 $block-margin $block-margin;
        max-width: 100%;
    }

    .controls {
        color: hsl(0deg, 0%, 29%);
        width: 100%;
        padding: 0 $block-margin;


        @include for-size(mobile) {
            padding: 0 0;
        }

        strong {
            padding-top: 0.8rem;
            display: inline-block;
        }
    }
 
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
                height: 99px;
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
        background-color: rgba(0,0,0,0);
    }
}
.grade-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    flex-wrap: nowrap;
    width: 100%;

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