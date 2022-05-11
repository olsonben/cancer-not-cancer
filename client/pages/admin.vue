<template>
    <div class="container">
        <!-- NOTE:: Just use bootstrap + components -->
        <!-- NOTE:: Just make these things components -->

        <!-- Tabs: images, users -->
        <b-tabs content-class="mt-3">
            <b-tab v-if="true" title="Images">
                <form method="post" enctype="multipart/form-data" action="/images">
                    <input type="file" name="file", accept="image/*" />
                    <input type="submit" value="Submit" />
                </form>
            </b-tab>
            <b-tab v-if="true" title="Users">
                <!-- This is just the basic idea -->
                <label for="fullname">Fullname</label>
                <input v-model="user.fullname" id="fullname" placeholder="Fullname" />

                <label for="email">Email</label>
                <input v-model="user.email" id="email" placeholder="Email" />

                <label for="password">Password</label>
                <input v-model="user.password" id="password" placeholder="Password" />

                <label for="enabled">Is Enabled</label>
                <input type="checkbox" id="enabled" v-model="user.permissions.enabled" />

                <label for="uploader">Is Uploader</label>
                <input type="checkbox" id="uploader" v-model="user.permissions.uploader" />

                <label for="pathologist">Is Pathologist</label>
                <input type="checkbox" id="pathologist" v-model="user.permissions.pathologist" />

                <label for="admin">Is Admin</label>
                <input type="checkbox" id="admin" v-model="user.permissions.admin" />

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
                    enabled: false,
                    uploader: false,
                    pathologist: false,
                    admin: false
                }
            }
        }
    },

    methods: {
        submitUser() {
            const data = {
                fullname: this.user.fullname,
                email: this.user.email,
                password: this.user.password,
                // We have to adjust permissions to be 1 or 0 instead of true or false
                permissions: {
                    enabled: this.user.permissions.enabled ? 1 : 0,
                    uploader: this.user.permissions.uploader ? 1 : 0,
                    pathologist: this.user.permissions.pathologist ? 1 : 0,
                    admin: this.user.permissions.admin ? 1 : 0
                }
            }
            
            let axiosData = JSON.stringify(data)
            const axiosConfig = {
                headers: {
                    "Content-Type": "application/json",
                }
            }

            console.log("Attempting user submition")
            
            axios.post(env.url.api + '/users', axiosData, axiosConfig)
                .then((res, err) => {
                    if (err) console.error(err)
                })
        }
    }
}
</script>

<style>
</style>