<template>
    <div class='app'>
        <div class="bg no" :style='cssVars'></div>
        <div class="bg yes" :style='cssVars'></div>
        <!-- Grade bars for clear user response -->
        <span class='grade-bar no' :class="{ 'shown': moveLeft }" :style='cssVars'></span>
        <span class='grade-bar yes' :class="{ 'shown': moveRight }" :style='cssVars'></span>

        <!-- Image to grade -->
        <div class='prompt'>
            <div class="image-container">
                <div class='roi'></div>
                <img :src='this.image.url' :alt='image.url' />
            </div>
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
import { mapGetters } from "vuex";

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
            moveLeft: false,
            percent: 0.0,
            innerWidth: window.innerWidth,
            swipeDistance: 100
        }
    },

    mounted() {
        document.documentElement.style.setProperty('--overscroll', 'none')
        
        this.nextImage()
        
        // Required for touches
        document.addEventListener('touchstart', this.handleTouchStart, false)
        document.addEventListener('touchmove', this.handleTouchMove, false)
        document.addEventListener('touchend', this.handleTouchEnd, false)
    },
    
    destroyed() {
        document.documentElement.style.setProperty('--overscroll', 'auto')

        // We need to cleanup our event listeners. So we don't have duplicates when we return.
        document.removeEventListener('touchstart', this.handleTouchStart, false)
        document.removeEventListener('touchmove', this.handleTouchMove, false)
        document.removeEventListener('touchend', this.handleTouchEnd, false)
    },

    computed: {
        ...mapGetters('user', ['isLoggedIn', 'isPathologist']),

        // give the attribute `:style='cssVars'` to anything that should have access to these variables
        cssVars() {
            return {
                // '--x-diff': (this.xMove !== null ? this.xMove - this.xDown : 0) + 'px',
                '--x-diff': '0px',
                '--bg-no-opacity': (this.percent > 0 ? this.percent : 0),
                '--bg-yes-opacity': (this.percent < 0 ? this.percent*-1.0 : 0),
            }
        }
    },
    watch: {
        isLoggedIn: {
            handler(loggedIn) {
                if (loggedIn) {
                    // Previously not logged in, and now logged in.
                    this.nextImage()
                }
            }
        },
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

        async postData(pathHistory) {
            // POST with axios
            try {
                await this.$axios.$post('/hotornot', pathHistory)
            } catch(error) {
                if ([401, 403].includes(error.response.status)) {
                    // unauthorized, update login status
                    await this.$store.dispatch('user/login')
                } else {
                    // throw other errors so they can be caught upstream
                    throw error
                }
            }
        },

        async nextImage() {
            if (this.isPathologist) {
                // try-catch is needed for async/await
                try {
                    const response = await this.$axios.get('/nextImage')
                    this.image = response.data
                } catch (error) {
                    if ([401, 403].includes(error.response.status)) this.$router.push('/')
                    console.error(error);
                }
            } else {
                console.log('Not a pathologist or not logged in.')
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
            this.innerWidth = window.innerWidth
        },

        // Handler for touchmove event
        handleTouchMove(event) {
            this.touchEvent = event
            const firstTouch = this.getTouches(event)[0]

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
            this.percent = 0.0
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
}
/* Grade Bars */
$grade-bar-radius: 1rem;
$grade-bar-speed: 200ms;
$yes-cancer-color: #5A46B9;
$no-cancer-color: #ff6184;

.bg {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0.0;
    transition: opacity 50ms;


    &.no {
        background-color: lighten($no-cancer-color, 10%);
        opacity: var(--bg-no-opacity);
    }
    
    &.yes {
        background-color: lighten($yes-cancer-color, 10%);
        opacity: var(--bg-yes-opacity);
    }
}

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
    margin: auto;
    position: relative;
    width: 50vh;

    @include for-size(mobile) {
        padding: $block-margin;
    }

    // Trick to keep aspect ratio square in .prompt
    &:after {
        content: '';
        display: block;
        padding-top: calc(100%);
    }

    .image-container {
        position: relative;
        width: 100%;
        height: 100%;
        line-height: 0;

        img {
            object-fit: contain;
            width: 100%;
            height: 100%;
        }

        /**
        * ROI is a white box centered in the image
        *
        * Important for .roi to be `position: absolute` and parent `position: relative`
        * That way the overlay will be centered on the image.
        */
        .roi {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;

            // TODO: make this sizing dynamic
            // ROI fallback
            width: 14.05%;
            height: 14.05%;
            // ROI most accurate
            width: calc(100% * 128/911);
            height: calc(100% * 128/911);
            margin: auto;
            border: 1px solid white;
            pointer-events: none;
        }
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

    /* special for extra-small mobile */
    @include for-size(small_mobile) {
        margin: 0 9px;
    }
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
</style>