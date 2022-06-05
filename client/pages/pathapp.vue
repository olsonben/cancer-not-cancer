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
import axios from 'axios';
import * as env from '../.env.js';
export default {
    data() {
        return {
            image: {},

            rating: '',
            comment: ''
        }
    },

    // Get the next image before rendering the page for the first time
    created() {
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

        postData(pathHistory) {
            console.log("In postdata from App.vue");
            console.log(pathHistory)
            // axiosData MUST be in JSON format before going into the API call
            let axiosData = JSON.stringify(pathHistory)
            // bc we specify that we are using JSON
            const axiosConfig = {
                headers: {
                    "Content-Type": "application/json",
                }
            }

            axios.post(env.url.api + '/hotornot', axiosData, axiosConfig)
                .then((res, err) => {
                    if (err) console.error(err)
                })
        },

        async nextImage() {
            console.log("In nextImage from App.vue"); // keeping track of location

            // try-catch is needed for async/await
            try {
                const response = await axios.get(env.url.api + '/nextImage');
                this.image = response.data
            } catch (error) {
                if (error.response.status === 401) window.location.replace(`${window.location.origin}/login`)
                console.error(error);
            }
        }
    }
}
</script>

<style>
.container {
    width: fit-content;
}
.stacked {
    display: flex;
    flex-direction: column;
}
img {
    object-fit: contain;
    width: 50vw;
    max-height: 50vh;
}
</style>