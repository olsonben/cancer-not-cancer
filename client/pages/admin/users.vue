<template>
    <section class='section'>
        <h1 class='title'>Adding Users</h1>
        <form @submit.prevent='submitUser()'>
            <div class='field is-horizontal'>
                <div class='field-label'>
                    <label class='label'>Information</label>
                </div>
                <div class='field-body'>
                    <div class="field">
                        <label class="label">Name</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Fullname" v-model="user.fullname" />
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Email</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Email" v-model="user.email" />
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Password</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Password" v-model="user.password" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Permissions -->
            <!-- NOTE: values for permissions MUST be `value='1'` -->
            <div class="field is-horizontal">
                <div class="field-label">
                    <label class="label">Permissions</label>
                </div>
                <div class="field-body">
                    <div class="field">
                        <div class="control">
                            <label class="checkbox">
                                <input type="checkbox" value='1' v-model="user.permissions.enabled">
                                Is Enabled
                            </label>
                            <label class="checkbox">
                                <input type="checkbox" value='1' v-model="user.permissions.uploader">
                                Is Uploader
                            </label>
                            <label class="checkbox">
                                <input type="checkbox" value='1' v-model="user.permissions.pathologist">
                                Is Pathologist
                            </label>
                            <label class="checkbox">
                                <input type="checkbox" value='1' v-model="user.permissions.admin">
                                Is Admin
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <input class='button is-primary' type="submit" value="Submit" />
        </form>
    </section>
</template>

<script>
import env from '../../.env'
import axios from 'axios'

export default {
    layout: 'admin',

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
                const response = await axios.post(env.url.api + '/users', axiosData, axiosConfig)

            } catch (error) {
                if (error.response.status === 401) window.location.replace(`${env.url.base}/login`)
                console.error(error)
            }
        }
    }
}
</script>

<style>
label.checkbox {
    display: block;
}
</style>