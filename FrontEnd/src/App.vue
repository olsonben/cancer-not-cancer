<script>
import axios from 'axios';
export default {
    data() {
        return {
            imageURL: '',

            pathHistory: [],

            value: '',
            comment: '',
            lastComment: '',
            // resComment: '',

            fromServer: '', // this should be temporary, used for checking responses from the server
        }
    },

    // Get the next image before rendering the page for the first time
    beforeMount() {
        this.nextImage()
    },

    methods: {
        // when a button is clicked
        onClick(source) {
            // determine the message based on source
            if (source === 'yes-cancer') {
                this.value = 'Yes Cancer'
            } else if (source === 'no-cancer') {
                this.value = 'No Cancer'
            } else if (source === 'maybe-cancer') {
                this.value = 'Maybe Cancer'
            }
            // record the response
            this.addRes()
            this.comment = '' // clear the last comment
            // this.lastComment = this.comment
            // post test

            // move on to the next image
            this.nextImage()
        },

        // Add response to pathHistory
        addRes() {
            let strippedID = this.stripID(this.imageURL)
            // the client should keep a copy of the results until successfully passed to server
            this.pathHistory.push({
                id: strippedID,
                value: this.value,
                comment: this.comment
            })
            this.postData()
        },

        stripID(imageURL) {
            // just want the image name (w/out extension)
            return imageURL.slice(imageURL.lastIndexOf('/')+1, imageURL.lastIndexOf('.'))
        },

        async nextImage() {
            console.log("In nextImage from App.vue"); // keeping track of location

            // try-catch is needed for async/await
            try {
                const response = await axios.get('http://localhost:5050/nextImage');
                this.imageURL = response.data

            } catch (error) {
                console.error(error);
            }
        },

        async postData() {
            console.log("In postdata from App.vue");
            try {
                console.log(this.pathHistory)
                // axiosData MUST be in JSON format before going into the API call
                let axiosData = JSON.stringify(this.pathHistory)
                // bc we specify that we are using JSON
                const axiosConfig = {
                    headers: {
                        "Content-Type": "application/json",
                    }
                }

                const response = await axios.post('http://localhost:5050/pathHistory', axiosData, axiosConfig)
                
                this.pathHistory = [] // reset pathHistory
                this.fromServer = response.data
            } catch (error) {
                console.error(error);
            }
        }
    }
}
</script>

<template>
    <div class="container">
        <!-- This is the main app: the current picture + buttons + comment field -->
        <div class="app">
            <div class="picture"><img :src="this.imageURL" :alt="imageURL"></div>

            <div class="button-row">
                <div class="button a"><button @click="onClick('yes-cancer')">Yes Cancer</button></div>
                <div class="button b"><button @click="onClick('no-cancer')">No Cancer</button></div>
                <div class="button c"><button @click="onClick('maybe-cancer')">Maybe Cancer</button></div>
            </div>
            
            <div class="comment-field">
                <textarea v-model="comment" placeholder="Add a comment to this image or leave blank."></textarea>
            </div>
        </div>
        <!-- // Below is for debugging and keeping track of responses made
        // recording the response from the server

        <p>{{fromServer}}</p> 

        // recording the response from the pathologist

        <div class="response">
            <p align='center'>
                Last response: {{ value }} <br>
                Last comment: {{ lastComment }} <br><br>

                <li align='left' v-for="response in pathHistory">
                    {{ response }}
                </li>
                {{ resComment }}
            </p>
        </div> -->
    </div>
</template>

<style>
#app {
    width: 100%;
    display: flex;
    justify-content: center;
}
.container {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: repeat(2, auto);
    gap: 10px;
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
    .button-row {
        grid-column: 1;
        grid-row: 2;
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
    .comment-field {
        grid-column: 1;
        grid-row: 3;
        display: flex;
        justify-content: center;
    }
.response {
    display: flex;
    justify-content: center;
}
</style>