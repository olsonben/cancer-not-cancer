<script>
import axios from 'axios';
export default {
    data() {
        return {
            resValue: 'Hello',
            comment: '',
            lastComment: '',
            history: [],
            resComment: '',

            imageName: 'peacock-feather',
            imageNameList: [
                'peacock-feather',
                'bridge',
                'butterfly',
                'leaf-path',
                'orange-slice',
                'tree'
            ]
        }
    },

    methods: {
        // when a button is clicked
        onClick(source) {
            // determine the message based on source
            if (source === 'yes-cancer') {
                this.resValue = 'Yes Cancer'
            } else if (source === 'no-cancer') {
                this.resValue = 'No Cancer'
            } else if (source === 'maybe-cancer') {
                this.resValue = 'Maybe Cancer'
            }
            // record the response
            this.addRes()
            this.lastComment = this.comment
            this.comment = '' // clear the last comment
            // post test
            this.postData()

            // move on to the next image
            this.nextImage()
        },
        // Add response to history
        addRes() {
            this.history.push({
                // keeping track of imageID, which button was pressed, and any comments
                imageID: this.imageName,
                resValue: this.resValue,
                comment: this.comment
            })
            // check and handle an overflow og history
            this.resOverflow()
        },
        // check and handle an overflow og history
        resOverflow() {
            this.resComment = ''
            // after 5 responses
            if (this.history.length >= 5) {
                // record the number of responses made before overflow
                this.resComment = 'Response history reached ' + this.history.length + ' responses before overflowing.'
                // clear history
                this.history = []
            }
        },
        nextImage() {
            console.log("In nextImage from App.vue");
            // axios.get('http://localho.st:5050/images')
            //     .then((res) => {
            //         console.log(res)
            //         console.log("Response Get")
            //     })
            //     .catch((err) => {
            //         console.error(err)
            //     })
            //     .then(() => {
            //         console.log("final");
            //     })
            // console.log(this.imageName);
        },

        async postData() {
            console.log("In postdata from App.vue");
            // let axiosParams = {
            //     history: this.history
            // }
            // const axiosConfig = {
            //     headers: {
            //         "Content-Type": "application/json",
            //     }
            // }
            console.log("hello" + history);

            try {
                const response = await axios.post('http://localho.st:5050/history?msg=1234')
                console.log(response);
            } catch (error) {
                console.error(error);
            }

            // axios.post('http://localhost:5050', {
            //     params: {
            //         msg: "My Message is neeku"
            //     }
            // })
            //     .then((res) => {
            //         console.log(res)
            //         console.log("Response Post")
            //     })
            //     .catch((err) => {
            //         console.error(err)
            //     })
            //     .then(() => {
            //         console.log("final");
            //     })
        }
    }
}
</script>

<template>
    <div class="container">
        <!-- This is the main app: the current picture + buttons + comment field -->
        <div class="app">
            <div class="picture"><img :src="'/src/assets/' + imageName + '.jpeg'" :alt="imageName"></div>

            <div class="button-row">
                <div class="button a"><button @click="onClick('yes-cancer')">Yes Cancer</button></div>
                <div class="button b"><button @click="onClick('no-cancer')">No Cancer</button></div>
                <div class="button c"><button @click="onClick('maybe-cancer')">Maybe Cancer</button></div>
            </div>
            
            <div class="comment-field">
                <textarea v-model="comment" placeholder="Add a comment to this image or leave blank."></textarea>
            </div>
        </div>
        <!-- This is for debugging and keeping track of responses made -->
        <div class="response">
            <p align='center'>
                Last response: {{ resValue }} <br>
                Last comment: {{ lastComment }} <br><br>

                <li align='left' v-for="response in history">
                    {{ response }}
                </li>
                {{ resComment }}
            </p>
        </div>
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