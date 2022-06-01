<template>
    <div class="container">

        <!-- Tabs: images, users -->
        <b-tabs content-class="mt-3">
            <b-tab v-if="true" title="Images">
                <section v-if="false">
                    <p>This is posting via html form</p>
                    <form method="post" enctype="multipart/form-data" action='/images'>
                        <input type="file" name="files" multiple accept="image/*" />
                        <input type="submit" value="Submit" />
                    </form>
                    <br/>
                </section>
                <section v-if="false">
                    <div>
                        <p>This is posting via axios</p>
                        <form @submit.prevent="uploadImage()">
                            <input type="file" name="files" multiple accept="image/*" ref="fileInput" @change="newImage"/>
                            <input type="submit" value="Submit" />
                        </form>
                    </div>
                    <br/>
                    <div v-if="formSubmitted">
                        <span v-for="file in files">
                            {{file.name}} submitted <br/>
                        </span>
                    </div>
                </section>
                
                <div class="container">
                    <!--UPLOAD-->
                    <h1>Upload images</h1>

                    <b-button variant='outline-primary' size='sm' @click='reset()'>Clear Choices</b-button>

                    <form enctype="multipart/form-data" @submit.prevent="saveImages()" novalidate v-if="isInitial || isSaving">
                        <div class="dropbox">
                            <input type="file" multiple :name="uploadFieldName" :disabled="isSaving" 
                                    @change="newImage"
                                    accept="image/*" class="input-file">
                            <p v-if="isInitial">
                                <ul>
                                    <li v-for="file in files">{{ file.name }}</li>
                                </ul>
                                </li>
                                Drag your file(s) here to begin<br> or click to browse
                            </p>
                            <p v-if="isSaving">
                                Uploading {{ fileCount }} files...
                            </p>
                        </div>
                        <br>
                        <input class='btn btn-outline-primary btn-sm' type="submit" value="Submit" />
                    </form>
                    <!--SUCCESS-->
                    <div v-if="isSuccess">
                        <h2>Uploaded {{ uploadedFiles }} file(s) successfully.</h2>
                        <p>
                            <a href="javascript:void(0)" @click="reset()">Upload again</a>
                        </p>
                    </div>
                    <!--FAILED-->
                    <div v-if="isFailed">
                        <h2>Upload failed.</h2>
                        <p>
                            <a href="javascript:void(0)" @click="reset()">Try again</a>
                        </p>
                        <pre>{{ uploadError }}</pre>
                    </div>
                </div>
            </b-tab>
            
            <b-tab v-if="true" title="Users">
                <!-- This is just the basic idea -->
                <!-- User info -->
                <label for="fullname">Fullname</label>
                <input id="fullname" placeholder="Fullname" v-model="user.fullname" />

                <label for="email">Email</label>
                <input id="email" placeholder="Email" v-model="user.email" />

                <label for="password">Password</label>
                <input id="password" placeholder="Password" v-model="user.password" />

                <!-- Permissions -->
                <!-- NOTE: values for permissions MUST be `value='1'` -->
                <label for="enabled">Is Enabled</label>
                <input type="checkbox" id="enabled" value='1' v-model="user.permissions.enabled" />

                <label for="uploader">Is Uploader</label>
                <input type="checkbox" id="uploader" value='1' v-model="user.permissions.uploader" />

                <label for="pathologist">Is Pathologist</label>
                <input type="checkbox" id="pathologist" value='1' v-model="user.permissions.pathologist" />

                <label for="admin">Is Admin</label>
                <input type="checkbox" id="admin" value='1' v-model="user.permissions.admin" />

                <button @click='submitUser()'>Submit</button>
            </b-tab>
            <b-tab title='Testing'>
                <b-form-checkbox
                    id="checkbox-1"
                    v-model="checked"
                    name="checkbox-1"
                    value="accepted"
                    unchecked-value="not_accepted"
                >
                    I accept the terms and use
                </b-form-checkbox>
                <b-button v-b-modal.modal-1>Launch demo modal</b-button>

                <b-modal id="modal-1" title="BootstrapVue">
                <p class="my-4">Hello from modal!</p>

                <b-dropdown id="dropdown-1" text="Dropdown Button" class="m-md-2">
                    <b-dropdown-item>First Action</b-dropdown-item>
                    <b-dropdown-item>Second Action</b-dropdown-item>
                    <b-dropdown-item>Third Action</b-dropdown-item>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dryopdown-item active>Active action</b-dryopdown-item>
                    <b-dropdown-item disabled>Disabled action</b-dropdown-item>
                </b-dropdown>
                </b-modal>
            </b-tab>
        </b-tabs>
    </div>
</template>

<script>
import * as env from '../.env.js';
import axios from 'axios';
import FormData from 'form-data';

const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;

export default {
    data() {
        return {
            files: [],
            responseData: '',
            formSubmitted: false,
            user: {
                fullname: '',
                email: '',
                password: '',
                permissions: {
                    enabled: 0,
                    uploader: 0,
                    pathologist: 0,
                    admin: 0
                }
            },

            uploadedFiles: 0,
            uploadError: null,
            currentStatus: null,
            uploadFieldName: 'photos',
            fileCount: 0,

            checked: false
        }
    },

    computed: {
        isInitial() {
            return this.currentStatus === STATUS_INITIAL;
        },
        isSaving() {
            return this.currentStatus === STATUS_SAVING;
        },
        isSuccess() {
            return this.currentStatus === STATUS_SUCCESS;
        },
        isFailed() {
            return this.currentStatus === STATUS_FAILED;
        }
    },

    mounted() {
        this.reset();
    },

    methods: {
        // Submit new user (activated on clicking Submit button in Users tab)
        async submitUser() {
            let axiosData = JSON.stringify(this.user)
            const axiosConfig = {
                headers: {
                    "Content-Type": "application/json",
                }
            }
            
            try {
                const res = await axios.post(env.url.api + '/users', axiosData, axiosConfig)
            } catch (err) {
                console.error(err)
            }
        },

        newImage(event) {
            this.formSubmitted=false
            
            // Fill this.files with the files added at ref=fileInput
            for (let i = 0; i < event.target.files.length; i++) {
                this.files.push(event.target.files[i])
                this.fileCount++
            }
        },

        reset() {
            // reset form to initial state
            this.currentStatus = STATUS_INITIAL
            this.uploadedFiles = 0
            this.uploadError = null
            this.files = []
            this.fileCount = 0
        },

        saveImages() {
            this.currentStatus = STATUS_SAVING

            const data = new FormData()
            data.append('files', this.files)            // Add the files array object
            this.files.forEach(file => {
                data.append('files', file, file.name)   // put each file into the files array in the form
            });

            axios.post(env.url.api + '/images', data)
                .then(response => {
                    console.log(response.data)
                    this.uploadedFiles = response.data.uploaded
                    this.currentStatus = STATUS_SUCCESS
                })
                .catch(error => {
                    console.log(error.message)

                    this.uploadError = error.response
                    this.currentStatus = STATUS_FAILED
                })

        },


        uploadImage() {       
            // Called upon images submition

            // Add the files
            const data = new FormData()
            data.append('files', this.files)            // Add the files array object
            this.files.forEach(file => {
                data.append('files', file, file.name)   // put each file into the files array in the form
            });

            // axios autmatically handles the headers for FormData object
            axios.post(env.url.api + '/images', data)
                .then(response => {
                    this.responseData = response.data
                    this.formSubmitted = true
                })
                .catch(error => {
                    console.log(error.message)
                })
            console.log(this.responseData)
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