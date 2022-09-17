<template>
    <div class='app'>
        <!-- Grade bars for clear user response -->
        <span class='grade-bar no' :class="{ 'shown': moveLeft }" :style='cssVars'></span>
        <span class='grade-bar yes' :class="{ 'shown': moveRight }" :style='cssVars'></span>

        <!-- Image to grade -->
        <div class='prompt wrapper'>
            <!-- <div class='prompt focus'></div> -->
            <img class='prompt img' :src='this.image.url' :alt='image.url' />
        </div>

        <!-- Response section: grade + comment --> 
        <div class='response-area'>
            <!-- Comment -->
            <button class='button icon-button' @click='commenting = !commenting'>
                <span class='icon'>
                    <img src="~assets/icons/pencil.svg" alt="pencil" width="32" height="32">
                </span>
            </button>
            <textarea v-if='commenting' class='textarea block' placeholder="Add a comment to this image or leave blank." v-model="comment"></textarea>

            <!-- Grade buttons -->
            <div class='block buttons'>
                <button class='button no' :class="{ 'shown': moveLeft }" @click="onClick('no-cancer')">Not Cancer</button>
                <button class='button maybe' @click="onClick('maybe-cancer')">Maybe Cancer</button>
                <button class='button yes' :class="{ 'shown': moveRight }" @click="onClick('yes-cancer')">Yes, Cancer</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import * as env from '/.env.js'

export default {
    data() {
        return {
            // Information to display and grade the current image
            image: {},

            // State information
            rating: '',
            comment: '',
            commenting: false,

            // For swiping
            xDown: null,
            yDown: null,
            xMove: null,
            yMove: null,
            touchEvent: null,
            moveRight: false,
            moveLeft: false
        }
    },

    mounted() {
        this.nextImage()

        // Required for touches
        document.addEventListener('touchstart', this.handleTouchStart, false)
        document.addEventListener('touchmove', this.handleTouchMove, false)
        document.addEventListener('touchend', this.handleTouchEnd, false)
    },

    computed: {
        // give the attribute `:style='cssVars'` to anything that should have access to these variables
        cssVars() {
            return {
                '--x-diff': (this.xMove !== null ? this.xMove - this.xDown : 0) + 'px'
            }
        }
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
            // record the response
            this.postData({
                id: this.image.id,
                rating: this.rating,
                comment: this.comment
            })

            /* reset */
            this.comment = ''
            this.commenting = false

            // move on to the next image
            this.nextImage()
        },

        async postData(pathHistory) {
            console.log(pathHistory)

            // Configure data
            let axiosData = JSON.stringify(pathHistory)
            const axiosConfig = {
                headers: {
                    "Content-Type": "application/json",
                }
            }

            // POST with axios
            try {
                axios.post(env.url.api + '/hotornot', axiosData, axiosConfig)
            } catch (error) {
                if ([401, 403].includes(error.response.status)) window.location.replace(`${window.location.origin}/login`)
                console.error(error);
            }
        },

        async nextImage() {
            // try-catch is needed for async/await
            try {
                const response = await axios.get(env.url.api + '/nextImage');
                this.image = response.data
            } catch (error) {
                if ([401, 403].includes(error.response.status)) window.location.replace(`${window.location.origin}/login`)
                console.error(error);
            }
        },

        /*************************************************************
        * Swipes
        * Modified from https://stackoverflow.com/a/23230280/16755079
        *************************************************************/

        getTouches(event) {
            return event.touches ||             // browser API
                    event.originalEvent.touches; // jQuery
        },

        // Handler for touchstart event
        handleTouchStart(event) {
            const firstTouch = this.getTouches(event)[0]
            this.xDown = firstTouch.clientX
            this.yDown = firstTouch.clientY
        },

        // Handler for touchmove event
        handleTouchMove(event) {
            this.touchEvent = event
            const firstTouch = this.getTouches(event)[0]

            // Record xMove for grade-bar css (see computed: cssVars)
            this.xMove = firstTouch.clientX
            // this.yMove = firstTouch.clientY

            this.touchMacro(event, 0, undefined, 
            () => {
                // Swapping movement flags
                console.log("right")
                this.moveLeft = false
                this.moveRight = true
            }, 
            undefined, 
            () => {
                console.log("left")
                this.moveLeft = true
                this.moveRight = false
            })
        },

        // Handler for touchend event
        handleTouchEnd(event) {
            if (this.touchEvent != null) {
                const touchList = this.touchEvent.touches ||
                                        this.touchEvent.originalEvent.touches
                if (touchList.length == 1) {
                    // touchend event has an empty `touches` list, so we pass the touchmove event instead
                    this.touchMacro(this.touchEvent, 100, () => {
                        this.commenting = true
                    }, () => {
                        this.onClick('yes-cancer')
                    }, () => {
                        // this.onClick('maybe-cancer')
                    }, () => {
                        this.onClick('no-cancer')
                    })
                } 
            }

            /* reset values */
            this.moveLeft = false
            this.moveRight = false
            this.xDown = null
            this.yDown = null
            this.xMove = null
            this.yMove = null
            this.touchEvent = null // important to clear touchmove event to avoid tapping causing submissions
        },

        touchMacro(event, margin = 0, top = undefined, right = undefined, bottom = undefined, left = undefined) {
            // Escape if the mouse isn't down or null event
            if ( !this.xDown || !this.yDown || event === null) {
                return
            }

            // Get the movement difference
            const touches = this.getTouches(event)

            const xDiff = this.xDown - touches[0].clientX
            const yDiff = this.yDown - touches[0].clientY

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
}
/* Grade Bars */
$grade-bar-radius: 1rem;
$grade-bar-speed: 200ms;
$yes-cancer-color: #5A46B9;
$no-cancer-color: #ff6184;
.grade-bar {
    /* flush with navbar and behind everything */
    position: fixed;
    bottom: 0;
    height: calc(100vh - $navbar-height); /* fullscreen */ 
    z-index: -1;

    /* "no" on the left */
    &.no {
        left: 0;
        width: calc(-1 * var(--x-diff, 0)); /* Come out opposite of a swipe */
        background-color: $no-cancer-color;
        border-top-right-radius: $grade-bar-radius;
    }
    /* "yes" on the right */
    &.yes {
        right: 0;
        width: var(--x-diff, 0);
        background-color: $yes-cancer-color;
        border-top-left-radius: $grade-bar-radius;
    }
}

/* Control image size + overlay */
.prompt {
    &.wrapper {
        margin: auto;
        /**
         * Important for .focus
         * `position: absolute` works off first parent with `position: relative`
         */
        position: relative;
    }
    /* Image sizing for large screens */
    &.img {
        object-fit: contain;
        width: 50vw;
        min-width: 100%;
        max-height: 50vh;
    }
    /* Focus is a white box + centered in the image */
    &.focus {
        $focus-border-width: 1px;
        width: 128px + 2*$focus-border-width;
        height: 128px + 2*$focus-border-width;
        margin: auto;
        border: $focus-border-width solid #00ff00;

        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }
}
/* stuck to the bottom of the screen */
.response-area {
    position: fixed;
    bottom: $button-margin;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: fit-content;

    display: flex;
    justify-content: center;
    flex-direction: column;
}
.icon-button {
    /* centered circle */
    border-radius: 50%;
    margin: 0 auto $button-margin auto;
}
.buttons {
    width: fit-content;
    justify-content: center;
}
.button {
    /* coloration for "yes" and "no" buttons to match grade bars */
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
/**
 * Adjustments for mobile
 */

/* We have to scale the image to maintain boundary */
@media screen and (min-width: 479px) and (max-width: 1024px) {
    .prompt.img {
        width: 100vw;
        min-width: 100%;
        max-height: 50vh;
    }
}
@media screen and (max-width: 479px) {
    .prompt.img {
        object-fit: contain;
        width: calc(100vw - 2 * $block-margin);

    }
}
/* special for extra-small mobile */
@media screen and (max-width: 381px) {
    .response-area {
        margin: 0 9px;
    }
}
</style>