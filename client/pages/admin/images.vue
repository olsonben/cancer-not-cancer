<template>
    <div>
        <!--UPLOAD-->
        <section class='section'>
            <h1 class='title'>Upload images</h1>

            <form enctype="multipart/form-data" @submit.prevent="saveImages()" novalidate>
                <div class="dropbox">
                    <input type="file" multiple name="images" :disabled="isSaving" 
                            @change="newImage"
                            accept="image/*" class="input-file">

                    <ul>
                        <li v-for="file in files">{{ file.name }}</li>
                    </ul>

                    <p v-if="isInitial">
                        Drag your file(s) here to begin<br> or click to browse
                    </p>
                    <p v-else-if="isLoaded">
                        Add more files or click submit.
                    </p>

                    <p v-if="isSaving">
                        Uploading {{ fileCount }} files...
                    </p>
                </div>
                <br>
                
                <div class='level'>
                    <div class='level-left'>
                        <input class='level-item button is-primary'type="submit" value="Submit" />
                    </div>
                    <div class='level-right'>
                        <button class='level-item button is-light' @click='reset'>Clear Choices</button>
                    </div>
                </div>
            </form>
        </section>
        <template v-for='file in submittedFiles'>
            <div v-if="file.submittionSuccess === null" class='notification is-warning is-light'>
                File {{ file.name }} is submitted, awaiting response.
            </div>
            <div v-else-if="file.submittionSuccess === true" class='notification is-success is-light'>
                File {{ file.name }} is successfully submitted.
            </div>
            <div v-else-if="file.submittionSuccess === false" class='notification is-danger is-light'>
                File {{ file.name }} failed to submit: {{ file.message + (/\.\s*$/.test(file.message) ? '' : '.')}}
            </div>
        </template>
    </div>
</template>

<script>
import * as env from '../../.env'
import axios from 'axios'
import FormData from 'form-data'

const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3, STATUS_LOADED = 4

export default {
    data() {
        return {
            files: [],

            currentStatus: null,
            fileCount: 0,

            submittedFiles: [],
            notificationTime: "5000"
        }
    },

    computed: {
        isInitial() {
            return this.currentStatus === STATUS_INITIAL
        },
        isSaving() {
            return this.currentStatus === STATUS_SAVING
        },
        isSuccess() {
            return this.currentStatus === STATUS_SUCCESS
        },
        isFailed() {
            return this.currentStatus === STATUS_FAILED
        },
        isLoaded() {
            return this.currentStatus === STATUS_LOADED
        }
    },

    mounted() {
        this.reset()
    },

    methods: {
        reset() {
            // reset form to initial state
            this.currentStatus = STATUS_INITIAL
            this.files = []
            this.fileCount = 0
        },

        newImage(event) {
            // Fill this.files with the files added at ref=fileInput
            for (let i = 0; i < event.target.files.length; i++) {
                this.files.push(event.target.files[i])
                this.fileCount++
            }

            this.currentStatus = STATUS_LOADED
        },

        async saveImages() {
            this.currentStatus = STATUS_SAVING
            if (this.files.length === 0) {
                this.reset()
                return
            }

            const offset = this.submittedFiles.length

            const data = new FormData()
            data.append('files', this.files)            // Add the files array object
            this.files.forEach((file, index) => {
                data.append('files', file, file.name)   // put each file into the files array in the form

                const i = {
                    submittionSuccess: null,
                    message: null,
                    name: file.name
                }
                this.submittedFiles.push(i)
            })
            
            try {
                const response = await axios.post(env.url.api + '/images', data)
                
                for (const id in response.data) {
                    this.submittedFiles[Number(id) + offset].submittionSuccess = true
                    setTimeout(() => {
                        this.submittedFiles[Number(id) + offset].submittionSuccess = -1
                    }, this.notificationTime)
                }
                console.log(response)
                this.currentStatus = STATUS_SUCCESS

            } catch (error) {
                if ([401, 403].includes(error.response.status)) {
                    window.location.replace(`${env.url.client}/login`)

                } else {
                    console.log(offset)
                    for (const id in error.response.data) {
                        if (error.response.data[id].message !== undefined) {
                            this.submittedFiles[Number(id) + offset].submittionSuccess = false
                            this.submittedFiles[Number(id) + offset].message = error.response.data[id].message
                        } else {
                            this.submittedFiles[Number(id) + offset].submittionSuccess = true
                        }

                        setTimeout(() => {
                            this.submittedFiles[Number(id) + offset].submittionSuccess = -1
                        }, this.notificationTime)
                    }
                }
            } finally {
                this.reset()
            }
        }
    }
}
</script>

<style lang="scss">
.dropbox {
    outline: 2px dashed grey; /* the dash box */
    outline-offset: -10px;
    background: lightcyan;
    color: dimgray;
    padding: 10px 10px;
    min-height: 200px; /* minimum height */
    position: relative;
    cursor: pointer;
}

.input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    height: 200px;
    position: absolute;
    left: 0;
    top: 0;
    cursor: pointer;
}

.dropbox:hover {
    background: lightblue; /* when mouse over to the drop zone, change color */
}

.dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
}
</style>