<template>
    <div>
        <!-- Main upload stuff -->
        <section class='section'>
            <h1 class='title'>Upload images</h1>

            <!-- Upload box -->
            <div class='tabs'>
                <ul>
                    <li :class="{ 'is-active': folderUpload }"><a @click='uploadingFolders = true'>Upload Folders</a></li>
                    <li :class="{ 'is-active': fileUpload }"><a @click='uploadingFolders = false'>Upload Files</a></li>
                </ul>
            </div>
            <form enctype="multipart/form-data" @submit.prevent="saveImages()" novalidate>
                <div class="dropbox">
                    <!-- File input -->
                    <input type="file"
                        multiple 
                        accept="image/*" 
                        v-bind="{ 'webkitdirectory': folderUpload }"
                        name="images" 
                        :disabled="isSaving" 
                        @change="newImage"
                        class="input-file"
                    >

                    <!-- Display loaded files -->
                    <ul>
                        <li v-for="file in files">{{ file.name }}</li>
                    </ul>

                    <!-- Various prompts -->
                    <p v-if="isInitial">
                        Drag your {{ fileUpload ? 'file' : 'folder' }}(s) here to begin<br> or click to browse
                    </p>
                    <p v-else-if="isLoaded">
                        Add more {{ fileUpload ? 'file' : 'folder' }} or click submit.
                    </p>
                    <p v-if="isSaving">
                        Uploading {{ fileCount }} {{ fileUpload ? 'file' : 'folder' }}s...
                    </p>
                </div>
                <br>
                
                <!-- Submit or clear files -->
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
        <!-- Notifications of submission process -->
        <template v-for='file in submittedFiles'>
            {{ file }}
            <div v-if="file.submissionSuccess === null" class='notification is-warning is-light'>
                File {{ file.name }} is submitted, awaiting response.
            </div>
            <div v-else-if="file.submissionSuccess === true" class='notification is-success is-light'>
                File {{ file.name }} is successfully submitted.
            </div>
            <div v-else-if="file.submissionSuccess === false" class='notification is-danger is-light'>
                <!--                                             Don't add a period to messages ending w/ a period -->
                File {{ file.originalname }} failed to submit: {{ file.message + (/\.\s*$/.test(file.message) ? '' : '.')}}
            </div>
        </template>
    </div>
</template>

<script>
import * as env from '../../.env'
import axios from 'axios'
import FormData from 'form-data'

const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_FAILED = 3, STATUS_LOADED = 4

export default {
    data() {
        return {
            // Loaded files
            files: [],

            // State tracking
            currentStatus: null,
            fileCount: 0,
            uploadingFolders: true,

            // Notification stuff
            submittedFiles: {},
            notificationTime: "1000"
        }
    },

    // Shorthand for the html
    computed: {
        isInitial() {
            return this.currentStatus === STATUS_INITIAL
        },
        isSaving() {
            return this.currentStatus === STATUS_SAVING
        },
        isLoaded() {
            return this.currentStatus === STATUS_LOADED
        },
        folderUpload() {
            return this.uploadingFolders
        },
        fileUpload() {
            return !this.uploadingFolders
        }
    },

    mounted() {
        this.reset()
    },

    methods: {
        reset() {
            // reset everything except notifications
            this.currentStatus = STATUS_INITIAL
            this.files = []
            this.fileCount = 0
        },

        // Fill this.files with the files added at ref=fileInput
        newImage(event) {
            for (let i = 0; i < event.target.files.length; i++) {
                let file = event.target.files[i]
                if (/image\/*/.test(file.type)) {
                    this.files.push(file)
                    this.fileCount++
                    this.currentStatus = STATUS_LOADED
                }
            }

        },

        // Save the image to the api
        async saveImages() {
            this.currentStatus = STATUS_SAVING

            const data = new FormData()                 // multer requires submittion via form data; like this
            data.append('files', this.files)            // Add the files array object
            this.files.forEach((file, index) => {
                const fileName = file.webkitRelativePath === '' ? file.name : file.webkitRelativePath
                data.append('files', file, fileName)   // put each file into the files array in the form

                // Keep track of important information for notifications
                this.submittedFiles[fileName] = {
                    submissionSuccess: null,
                    message: null,
                    originalname: file.name
                }
            })
            
            try {
                const response = await axios.post(env.url.api + '/images', data)

                if (response.data !== 'No files uploaded.') { // Handling 0 file upload edge case
                    for (const id in response.data) {
                        this.submittedFiles[Number(id) + offset].submissionSuccess = true // Track success
                        setTimeout(() => {
                            this.submittedFiles[Number(id) + offset].submissionSuccess = -1 // Kill notification
                        }, this.notificationTime)
                    }
                }

            } catch (error) {
                if ([401, 403].includes(error.response.status)) {
                    window.location.replace(`${env.url.client}/login`)

                } else {
                    console.log("error")
                    console.log(error.response.data)
                    console.log("submittedfiles")
                    console.log(this.submittedFiles)
                    for (const file of Object.values(error.response.data)) {
                        console.log(file)
                        // Failed file
                        if (file.message !== undefined) {
                            this.submittedFiles[file.originalname].submissionSuccess = false // track failure
                            this.submittedFiles[file.originalname].message = file.message
                        // Success file
                        } else {
                            // Since we are uploading multiple files, some fail to upload, others succeed
                            this.submittedFiles[file.originalname].submissionSuccess = true
                        }

                        setTimeout(() => {
                            this.submittedFiles[file.originalname].submissionSuccess = -1
                        }, this.notificationTime)
                    }
                }
            } finally {
                // reset after submission
                this.reset()
            }
        }
    }
}
</script>

<!-- Cannot scope this for some reason -->
<style lang='scss'>
/* This is all to style the drop box */
.dropbox {
    outline: 2px dashed grey; /* the dash box */
    outline-offset: -10px; /* outline on the inside */

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
.dropbox ul {
    margin: $block-margin;
}
/* For the prompt */
.dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
}
</style>