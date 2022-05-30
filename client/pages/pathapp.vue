<template>
    <div class="container">
        <!-- This is the main app: the current picture + buttons + comment field -->
        <div class="app">
            <div class="picture"><img :src="this.image.url" :alt="image.url"></div>

            <div class="comment-field">
                <textarea v-model="comment" placeholder="Add a comment to this image or leave blank."></textarea>
            </div>

            <div class="button-row">
                <div class="button a"><button @click="onClick('yes-cancer')">Yes Cancer</button></div>
                <div class="button b"><button @click="onClick('no-cancer')">No Cancer</button></div>
                <div class="button c"><button @click="onClick('maybe-cancer')">Maybe Cancer</button></div>
            </div>
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
    beforeMount() {
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
                console.error(error);
            }
        },

        /**********************************************
        * User Authentication
        **********************************************/

        
    }
}
</script>

<style>
#app {
    width: 100%;
    display: flex;
    justify-content: center;
}
.container {
    justify-content: center;
    display: flex;
    width: 100%;
}
/* I am using indentation to roughly match the indentation of the html template */
.app {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 9fr repeat(2, 1fr);
    gap: 10px;
}
    .picture {
        grid-column: 1;
        grid-row: 1;
        display: flex;
        justify-content: center;
    }
    .comment-field {
        grid-column: 1;
        grid-row: 2;
        display: flex;
        justify-content: center;
    }
    .button-row {
        grid-column: 1;
        grid-row: 3;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: 1fr;
        gap: 10px;
    }
        .button {
            display: flex;
            justify-content: center;
        }
        .a {
            grid-column: 1;
            grid-row: 1;
        }
        .b {
            grid-column: 2;
            grid-row: 1;
        }
        .c {
            grid-column: 3;
            grid-row: 1;
        }
        .d {
            grid-column: 4;
            grid-row: 1;
        }
</style>