<template>
    <div class='app' :style='cssVars'>
        <div class="bg no" :class="{'fade-out': transitioningOut}"></div>
        <div class="bg yes" :class="{'fade-out': transitioningOut}"></div>

        <!-- Image to grade -->
        <div class='prompt'>
            <div class='controls level'>
                <TaskPicker @taskSelected="(newTaskId) => { selectedTask = newTaskId }"></TaskPicker>
            </div>
            <div ref="test" class="has-text-danger" v-if="!image.id">No more images available in this task.</div>
            
            <!-- OLD -->
            <!-- <div v-if="image.id" class="image-container" @click="zoom=!zoom" :style="imageContainerStyle">
                <Transition
                    name="swap-img"
                    @after-leave="afterLeave"
                    @before-leave="beforeLeave"
                    appear
                >
                    <ImageDisplay v-if="this.currentTask" :imageUrl="image.url" :chipSize="this.currentTask.chip_size" :fovSize="this.currentTask.fov_size" :zoomScale="this.currentTask.zoom_scale"/>
                </Transition>
            </div> -->

            <!-- NEW -->
            <ImageSwipe>
                <ImageDisplay v-if="this.currentTask" :imageUrl="image.url" :chipSize="this.currentTask.chip_size" :fovSize="this.currentTask.fov_size" :zoomScale="this.currentTask.zoom_scale"/>
            </ImageSwipe>  

            <div class='controls level'>
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
                <button class='button no' :class="{ 'shown': moveLeft }" @click="onClick('no-cancer')">No</button>
                <button class='button maybe' @click="onClick('maybe-cancer')">Maybe</button>
                <button class='button yes' :class="{ 'shown': moveRight }" @click="onClick('yes-cancer')">Yes</button>
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
// const swipe = useSwipe()
// console.log(document.documentElement)
// console.log(window)
let swipe = null

const IMAGE_TRANSITION_TIME = 250 // ms
// const IMAGE_TRANSITION_TIME = 2000 // ms

export default {
    setup() {
        console.log('setup')
        // console.log(this.$refs.test)
        // const test = ref(null)
        // swipe = useSwipe(test)
        // return {
        //     test,
        //     xDistance: swipe.xDistance
        // }
    },
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
            zoom: false,
            showImage: true,
            transitioningOut: false,

            // For swiping
            xDown: null,
            yDown: null,
            xMove: null,
            yMove: null,
            touchEvent: null,
            moveRight: false,
            moveLeft: false,
            percent: 0.0,
            innerWidth: window.innerWidth,
            swipeDistance: 100
        }
    },
    async mounted() {
        // console.log(this.$refs.test)
        if (this.isLoggedIn) {
            const { response } = await api.GET('/tasks/')
            this.tasks = response.value // because response is a ref object
            this.selectedTask = this.tasks[0].id
            this.currentTask = this.tasks[0]
        }

        // Fixes a firefox swipe conflict. When swiping if the reload page
        // swipe starts to engage, other animations freeze and hang. The
        // following line deactivates swiping to reload page.
        // document.documentElement.style.setProperty('--overscroll', 'none')
        // // Turn scrolling off
        // document.documentElement.style.setProperty('--overflow', 'hidden')

        this.nextImage()
        
        // // Required for touches
        // document.addEventListener('touchstart', this.handleTouchStart, false)
        // document.addEventListener('touchmove', this.handleTouchMove, false)
        // document.addEventListener('touchend', this.handleTouchEnd, false)
        // swipe.activate()
    },
    
    unmounted() {
        // // Reactivates swipe to reload (deactivated in the mount method)
        // document.documentElement.style.setProperty('--overscroll', 'auto')
        // // Allowing scrolling
        // document.documentElement.style.setProperty('--overflow', 'initial')

        // // We need to cleanup our event listeners. So we don't have duplicates when we return.
        // document.removeEventListener('touchstart', this.handleTouchStart, false)
        // document.removeEventListener('touchmove', this.handleTouchMove, false)
        // document.removeEventListener('touchend', this.handleTouchEnd, false)
        // swipe.deactivate()
    },

    computed: {
        ...mapState(useUserStore, ['isLoggedIn', 'isPathologist']),
        // give the attribute `:style='cssVars'` to anything that should have access to these variables
        cssVars() {
            return {
                '--bg-no-opacity': (this.percent > 0 ? this.percent : 0),
                '--bg-yes-opacity': (this.percent < 0 ? this.percent*-1.0 : 0),
                '--img-trans': IMAGE_TRANSITION_TIME + 'ms'
            }
            // '--roi-ratio': this.roiRatio,
            // '--zoom-scale': this.zoomScale
        },
        imageContainerStyle() {
            const xDiff = this.xMove !== null ? this.xMove - this.xDown : 0
            const yDiff = this.xMove !== null ? Math.abs(this.xMove - this.xDown) * -1 : 0
            // the numbers -6 and -12 are aesthetically chosen
            const yAmount = yDiff / -6
            const rotation = this.percent * -12

            return {
                transform: `translate(${xDiff}px, ${yAmount}px) rotate(${rotation}deg)`
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
        },
        // xDistance: {
        //     handler(distance) {
        //         // console.log('xDistance:', distance)
        //     }
        // }
    },
    methods: {
        /**********************************************
        * App Control
        **********************************************/
        // when a button is clicked
        onClick(source) {
            // determine the message based on source
            if (source === 'yes-cancer') {
                this.rating = 1
            } else if (source === 'no-cancer') {
                this.rating = -1
            } else if (source === 'maybe-cancer') {
                this.rating = 0
            }

            // Begin Image swap
            this.showImage = false

            // record the response
            this.postData({
                id: this.image.id,
                rating: this.rating,
                comment: this.comment,
                taskId: this.selectedTask,
            }).then((res) => {

                // move on to the next image
                this.nextImage()
            }).catch((error) => {
                console.error(error)
            })

            /* reset */
            this.comment = ''
            this.commenting = false

        },

        async postData(bodyData) {
            // POST with axios
            try {
                // api
                await api.POST('/hotornot', bodyData)
            } catch(error) {
                console.error(error)
            }
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
                this.zoom = false
                this.showImage = true
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
        },

        /*************************************************************
        * Swipes
        * Modified from https://stackoverflow.com/a/23230280/16755079
        *************************************************************/

        // Handler for touchstart event
        handleTouchStart(event) {
            const firstTouch = event.touches[0]
            this.xDown = firstTouch.clientX
            this.yDown = firstTouch.clientY
            this.innerWidth = window.innerWidth
        },

        // Handler for touchmove event
        handleTouchMove(event) {
            this.touchEvent = event
            const firstTouch = event.touches[0]

            // Record xMove for grade-bar css (see computed: cssVars)
            this.xMove = firstTouch.clientX
            this.yMove = firstTouch.clientY

            this.touchMacro(event, 0, undefined, 
            () => {
                // Swapping movement flags
                // console.log("right")
                if (this.percent <= -1) {
                    this.moveLeft = false
                    this.moveRight = true
                } else {
                    this.moveLeft = false
                    this.moveRight = false
                }
            }, 
            undefined, 
            () => {
                // console.log("left")
                if (this.percent >= 1) {
                    this.moveLeft = true
                    this.moveRight = false
                } else {
                    this.moveLeft = false
                    this.moveRight = false
                }
            })
        },

        resetImagePos() {
            /* reset values */
            this.moveLeft = false
            this.moveRight = false
            this.xDown = null
            this.yDown = null
            this.xMove = null
            this.yMove = null
            this.touchEvent = null // important to clear touchmove event to avoid tapping causing submissions
            this.percent = 0.0
        },

        // Handler for touchend event
        handleTouchEnd(event) {
            if (this.touchEvent != null) {
                const touchList = this.touchEvent.touches ||
                                        this.touchEvent.originalEvent.touches
                if (touchList.length == 1) {
                    // touchend event has an empty `touches` list, so we pass the touchmove event instead
                    this.touchMacro(this.touchEvent, this.swipeDistance, () => {
                        this.commenting = true
                    }, () => {
                        this.onClick('yes-cancer')
                    }, () => {
                        // this.onClick('maybe-cancer')
                        this.commenting = false
                    }, () => {
                        this.onClick('no-cancer')
                    })
                } 
            }

            if (this.showImage) {
                this.resetImagePos()
            }
        },

        touchMacro(event, margin = 0, top = undefined, right = undefined, bottom = undefined, left = undefined) {
            // Escape if the mouse isn't down or null event
            if ( !this.xDown || !this.yDown || event === null) {
                return
            }

            // Get the movement difference
            const touches = event.touches

            const xDiff = this.xDown - touches[0].clientX
            const yDiff = this.yDown - touches[0].clientY
            
            // this.percent = xDiff/(this.innerWidth*0.5)
            this.percent = xDiff/(this.swipeDistance)
            

            // Interesting callbacks are not undefined and they are not empty functions
            const interesting = {
                top: top !== undefined && ''+top !== ''+(() => {}),
                right: right !== undefined && ''+right !== ''+(() => {}),
                bottom: bottom !== undefined && ''+bottom !== ''+(() => {}),
                left: left !== undefined && ''+left !== ''+(() => {})
            }
            
            // Basically, whichever axis is bigger, unless there is nothing to do on that axis
            if (Math.abs(xDiff) > Math.abs(yDiff) && (interesting.right || interesting.left) || 
                    !(interesting.top || interesting.bottom)) {                                      /*most significant*/
                if ( xDiff > margin ) {
                    /* right-to-left swipe */
                    left()
                } else if ( xDiff <= -margin ) {
                    /* left-to-right swipe */
                    right()
                }
            } else {
                if ( yDiff > margin ) {
                    /* bottom-to-top swipe */ 
                    top()
                } else if ( yDiff <= -margin ) { 
                    /* top-to-bottom swipe */
                    bottom()
                }
            }
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

    // .image-container {
    //     position: relative;
    //     width: 100%;
    //     // TODO: Figure out how to handle rectangular images and their ROIs
    //     height: calc(50vh - $block-margin - $block-margin);
    //     line-height: 0;
    //     overflow: hidden;


    //     // transform: translate(var(--x-diff), calc(var(--y-diff) / -6)) rotate(calc( var(--rot-diff) * -12deg));

    //     @include for-size(mobile) {
    //         height: calc(100vw - $block-margin - $block-margin);
    //     }

    // }    
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