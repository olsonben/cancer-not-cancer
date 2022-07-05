<template>
    <section>
        <div class='app'>
            <span class='grade-bar no' :class="{ 'shown': moveLeft }"></span>
            <div class='container app'>
                <img class='block' :src='this.image.url' :alt='image.url' />

                <div class='response-area'>
                    <button class='button icon-button' @click='commenting = !commenting'>
                        <span class='icon'>
                            <img src="~assets/icons/pencil.svg" alt="pencil" width="32" height="32">
                        </span>
                    </button>
                    <textarea v-if='commenting' class='textarea block' placeholder="Add a comment to this image or leave blank." v-model="comment"></textarea>

                    <div class='container block buttons'>
                        <button class='button no' :class="{ 'shown': moveLeft }" @click="onClick('no-cancer')">Not Cancer</button>
                        <button class='button maybe' @click="onClick('maybe-cancer')">Maybe Cancer</button>
                        <button class='button yes' :class="{ 'shown': moveRight }" @click="onClick('yes-cancer')">Yes, Cancer</button>
                    </div>
                </div>
            </div>
            <span class='grade-bar yes' :class="{ 'shown': moveRight }"></span>
        </div>
    </section>
</template>

<script>
import axios from 'axios'
import * as env from '../.env.js'

export default {
    data() {
        return {
            image: {},

            rating: '',
            comment: '',
            commenting: false,

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

        document.addEventListener('touchstart', this.handleTouchStart, false)
        document.addEventListener('touchmove', this.handleTouchMove, false)
        document.addEventListener('touchend', this.handleTouchEnd, false)
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
            this.comment = '' // clear the last comment
            this.commenting = false

            // move on to the next image
            this.nextImage()
        },

        async postData(pathHistory) {
            console.log(pathHistory)
            // axiosData MUST be in JSON format before going into the API call
            let axiosData = JSON.stringify(pathHistory)
            // bc we specify that we are using JSON
            const axiosConfig = {
                headers: {
                    "Content-Type": "application/json",
                }
            }

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

        /**********************************************
        * Swipes
        * https://stackoverflow.com/a/23230280/16755079
        **********************************************/

        getTouches(event) {
            return event.touches ||             // browser API
                    event.originalEvent.touches; // jQuery
        },

        handleTouchStart(event) {
            const firstTouch = this.getTouches(event)[0]
            this.xDown = firstTouch.clientX
            this.yDown = firstTouch.clientY
        },

        handleTouchMove(event) {
            console.log("move")
            this.touchEvent = event
            const firstTouch = this.getTouches(event)[0]
            this.xMove = firstTouch.clientX
            this.yMove = firstTouch.clientY

            this.touchMacro(event, () => {

            }, () => {
                this.moveLeft = false
                this.moveRight = true
            }, () => {

            }, () => {
                this.moveLeft = true
                this.moveRight = false
            })
        },

        handleTouchEnd(event) {
            console.log("end")
            this.touchMacro(this.touchEvent, 10, () => {
                this.commenting = true
            }, () => {
                this.onClick('yes-cancer')
            }, () => {
                // this.onClick('maybe-cancer')
            }, () => {
                this.onClick('no-cancer')
            })

            /* reset values */
            this.moveLeft = false
            this.moveRight = false
            this.xDown = null
            this.yDown = null
            this.xMove = null
            this.yMove = null
        },

        touchMacro(event, margin=0, up=() => {}, right=() => {}, down=() => {}, left=() => {}) {
            if ( !this.xDown || !this.yDown || event === null) {
                return
            }

            let xUp = event.touches[0].clientX
            let yUp = event.touches[0].clientY

            let xDiff = this.xDown - xUp
            let yDiff = this.yDown - yUp

            if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
                if ( xDiff > margin ) {
                    /* left swipe */
                    left()
                } else if ( xDiff <= -margin ) {
                    /* right swipe */
                    right()
                }
            } else {
                if ( yDiff > margin ) {
                    /* up swipe */ 
                    up()
                } else if ( yDiff <= -margin ) { 
                    /* down swipe */
                    down()
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

$grade-bar-width: 1rem;
$grade-bar-speed: 200ms;
$yes-cancer-color: #5A46B9;
$no-cancer-color: #ff6184;
.grade-bar {
    position: fixed;
    bottom: 0;
    height: calc(100vh - $navbar-height - $block-margin); /* top of app to bottom of screen */
    width: $grade-bar-width;
    z-index: -1;

    &.yes {
        right: -$grade-bar-width;
        background-color: $yes-cancer-color;
        border-top-left-radius: $grade-bar-width;
        transition: right $grade-bar-speed;

        &.shown {
            right: 0;
        }
    }
    &.no {
        left: -$grade-bar-width;
        background-color: $no-cancer-color;
        border-top-right-radius: $grade-bar-width;
        transition: left $grade-bar-speed;

        &.shown {
            left: 0;
        }  
    }
}

.container {
    width: fit-content;
}
.response-area {
    position: fixed;
    bottom: $button-margin;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: fit-content;
}
.icon-button {
    background-color: #fff;   
    border-radius: 50%;
    margin: 0 auto $button-margin auto;
}
.buttons {
    justify-content: center;
}
.button {
    &.no {
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
img {
    object-fit: contain;
    width: 50vw;
    min-width: 100%;
    max-height: 50vh;
}
@media screen and (max-width: 1024px) {
    img {
        width: 100vw;
        min-width: 100%;
        max-height: 50vh;
    }
    .container:not(.buttons) {
        margin-left: $block-margin;
        margin-right: $block-margin;
    }
}
@media screen and (max-width: 381px) {
    .response-area {
        margin: 0 9px;
    }
}
</style>