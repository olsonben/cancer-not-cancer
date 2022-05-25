<template>
    <div class="container">
        <!-- NOTE:: Just use bootstrap + components -->
        <!-- NOTE:: Just make these things components -->

        <!-- Tabs: images, users -->
        <b-tabs content-class="mt-3">
            <b-tab v-if="true" title="Images">
                <p> This is posting with html form tab</p>
                <form method="post" enctype="multipart/form-data" action="/images">
                    <input type="file" name="file", accept="image/*" />
                    <input type="submit" value="Submit" />
                </form>

                <p> This is posting with axios post</p>
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
export default {
    data() {
        return {
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

        // async uploadFile(event) {
        //     const formData = new FormData();
        //     const imagefile = document.querySelector('#file');
        //     formData.append("image", imagefile.files[0]);
            
        //     console.log(formData)

        //     const axiosConfig = {
        //         headers: {
        //             'Content-Type': 'multipart/form-data'
        //         }
        //     }
        //     try {
        //         const response = await axios.post(env.url.api + '/images', formData, axiosConfig)
        //     } catch (err) {
        //         console.error(err)
        //     }
        // }
    }
}
</script>

<!-- <style lang="scss">
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
</style> -->