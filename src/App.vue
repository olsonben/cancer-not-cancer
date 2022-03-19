<script>
export default {
    data() {
        return {
            resValue: 'Hello',
            comment: '',
            lastComment: '',
            resHistory: [],
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

            // move on to the next image
            this.nextImage()
        },
        // Add response to resHistory
        addRes() {
            this.resHistory.push({ 
                // keeping track of imageID, which button was pressed, and any comments
                imageID: this.imageName,
                resValue: this.resValue,
                comment: this.comment
            })
            // check and handle an overflow og resHistory
            this.resOverflow()
        },
        // check and handle an overflow og resHistory
        resOverflow() {
            this.resComment = ''
            // after 5 responses
            if (this.resHistory.length >= 5) {
                // record the number of responses made before overflow
                this.resComment = 'Response history reached ' + this.resHistory.length + ' responses before overflowing.'
                // clear resHistory
                this.resHistory = []
            }
        },
        nextImage() {
            this.imageName = this.imageNameList[Math.floor(Math.random() * this.imageNameList.length)]
        }
    }
}
</script>

<template>
    <div class="container">
        <!-- This is the main app: the current picture + buttons + comment field -->
        <div class="app">
            <div class="picture"><img :src="'/src/assets/' + imageName + '.jpeg'" alt="peacock feather"></div>

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

                <li align='left' v-for="response in resHistory">
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