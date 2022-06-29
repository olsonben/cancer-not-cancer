<template>
    <div class='container stacked'>
        <img class='block' :src='this.image.url' :alt='image.url' />

        <textarea class='textarea block' placeholder="Add a comment to this image or leave blank." v-model="comment"></textarea>

        <div class='container block buttons'>
            <button class='button' @click="onClick('yes-cancer')">Yes Cancer</button>
            <button class='button' @click="onClick('maybe-cancer')">Maybe Cancer</button>
            <button class='button' @click="onClick('no-cancer')">No Cancer</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import * as env from '../.env.js'
export default {
    data() {
        return {
            image: {},

            rating: '',
            comment: ''
        }
    },

    // Get the next image before rendering the page for the first time
    mounted() {
        this.nextImage()
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
        }
    }
}
</script>

<style scoped>
.container {
    width: fit-content;
}
.buttons {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    justify-content: center;
}
.stacked {
    display: flex;
    flex-direction: column;
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
        margin-left: 1.5rem;
        margin-right: 1.5rem;
    }
}
</style>