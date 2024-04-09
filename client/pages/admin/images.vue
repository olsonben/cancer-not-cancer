<template>
    <div>
        <!-- Main upload stuff -->
        <section class='section pt-3 pb-3'>
            <h1 class='title'>Upload images</h1>

            <!-- Upload box -->
            <div class='tabs'>
                <ul>
                    <li :class="{ 'upload-active': folderUpload }"><a @click='uploadingFolders = true'>Upload Folders</a></li>
                    <li :class="{ 'upload-active': fileUpload }"><a @click='uploadingFolders = false'>Upload Files</a></li>
                </ul>
            </div>
            <div>

                <div class="dropbox mb-3">

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

                <div v-if="files.length > 0" class="">
                    <h1 class="title is-6 mb-1">
                        {{ files.length }} Files selected for upload:
                    </h1>
                    <!-- Display loaded files -->
                    <ul class="box selected-files">
                        <li v-for="file in files">{{ file.name }}</li>
                    </ul>
                </div>

                <br>
                
                <!-- Submit or clear files -->
                <div class='level'>
                    <div class='level-left'>
                        <button class='level-item button is-primary' @click='saveImages'>Submit</button>
                    </div>
                    <div class='level-right'>
                        <button class='level-item button is-light' @click='reset'>Clear Choices</button>
                    </div>
                </div>
            </div>
        </section>
        <!-- Notifications of submission process -->
        <section v-if="isSaving" class="section pt-3 pb-3 is-flex is-flex-direction-row">
            <h2 class="title is-5 is-flex-shrink-0 pr-3">
                Upload Progress:
            </h2>
            <progress class="progress is-info" :value="progress" max="100">{{ progress }}%</progress>
        </section>
        <section class="notification-container section pb-0 pt-0">
            <template v-for='file in submittedFiles'>
                <div v-if="file.success === null" class='notification is-warning is-light'>
                    File {{ file.filename }} is submitted, awaiting response.
                </div>
                <div v-else-if="file.success === true" class='notification is-success is-light'>
                    File {{ file.filename }} is successfully submitted.
                </div>
                <div v-else-if="file.success === false" class='notification is-danger is-light'>
                    <!--                                             Don't add a period to messages ending w/ a period -->
                    File {{ file.filename }} failed to submit: {{ file.message + (/\.\s*$/.test(file.message) ? '' : '.')}}
                </div>
            </template>
        </section>
        <div class="section pt-3">
            <ImageManager :key="imageManagerKey"/>
        </div>
    </div>
</template>

<script>
const { uploadImageFilesForGrading } = useImageUpload()

const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_FAILED = 3, STATUS_LOADED = 4

const notificationTime = "10000" // 10 sec in ms

export default {
    data() {
        return {
            // Loaded files
            files: [],

            // State tracking
            currentStatus: STATUS_INITIAL,
            fileCount: 0,
            uploadingFolders: true,

            // Notification stuff
            submittedFiles: {},
            imageManagerKey: 1, // we can force and update by incrementing this on upload complete
            completed: 0
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
        },
        progress() {
            return Math.min(Math.max(100 * (this.completed / this.fileCount), 0), 100)
        }
    },

    created() {
        useHead({
            title: 'Admin - Images'
        })
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
            this.completed = 0
        },

        removeSubmittedFile(filename) {
            delete this.submittedFiles[filename]
        },

        onFileUpdate(fileObject) {
            this.submittedFiles[fileObject.filename] = fileObject
            if (this.submittedFiles[fileObject.filename].success === null) {
                // pending
            } else {
                // success or failure, clear notification
                // sets a timer to kill the notification
                setTimeout(() => {
                    this.removeSubmittedFile(fileObject.filename)
                }, notificationTime)

                this.completed += 1
                if (this.completed === this.fileCount) {
                    // finished
                    this.reset()
                    this.imageManagerKey += 1
                }
            }
        },

        // Fill this.files with the files added at ref=fileInput
        newImage(event) {
            for (let i = 0; i < event.target.files.length; i++) {
                let file = event.target.files[i]
                // This is a quick filter for image files, not the final filter
                if (/image\/*/.test(file.type)) {
                    this.files.push(file)
                    this.fileCount++
                    this.currentStatus = STATUS_LOADED
                }
            }

        },

        // Save the image
        async saveImages() {
            this.currentStatus = STATUS_SAVING
            uploadImageFilesForGrading(this.files, this.onFileUpdate)
        }
    }
}
</script>

<!-- Cannot scope this for some reason -->
<style lang='scss'>
li.upload-active a,
li.upload-active a:hover{
    color: $info;
    // font-weight: bold;
    border-bottom-color: $info;
}


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
.selected-files {
    max-height: 220px;
    overflow-y: auto;
}
/* For the prompt */
.dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
}

.notification-container {
    max-height: 300px;
    overflow-y: auto;
    margin-right: 3rem;
}
</style>