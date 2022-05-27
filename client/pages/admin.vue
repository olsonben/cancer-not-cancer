<template>
    <div class="container">
        <!-- NOTE:: Just use bootstrap + components -->
        <!-- NOTE:: Just make these things components -->

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
                
                <section v-if="true">
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
        </b-tabs>
    </div>
</template>

<script>
import * as env from '../.env.js';
import axios from 'axios';
import FormData from 'form-data';

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
            }
        }
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
            }
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

<style>
</style>