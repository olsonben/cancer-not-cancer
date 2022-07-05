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
        <div v-for='user in submittedUsers'>
            <div v-if="user.submittionSuccess != null && user.submittionSuccess === true" class='notification is-success is-light'>
                User {{ user.fullname }} is successfully submitted.
            </div>
            <div v-else-if="user.submittionSuccess != null && user.submittionSuccess === false" class='notification is-danger is-light'>
                User {{ user.fullname }} failed to submit: {{ user.message }}.
            </div>
            <div v-else-if="user.submittionSuccess != -1" class='notification is-warning is-light'>
                User {{ user.fullname }} is submitted, awaiting response.
            </div>
        </div>
    </section>
</template>

<script>
import env from '../../.env'
import axios from 'axios'

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
                },
                submittionSuccess: null,
                message: ''
            },

            submittedUsers: [],
            notificationTime: "5000",
        }
    },

    methods: {
        // Submit new user (activated on clicking Submit button in Users tab)
        async submitUser() {
            this.user.id = this.submittedUsers.length
            this.submittedUsers.push(structuredClone(this.user))

            let axiosData = JSON.stringify(this.user)
            const axiosConfig = {
                headers: {
                    "Content-Type": "application/json",
                }
            }
            
            try {
                const response = await axios.post(env.url.api + '/users', axiosData, axiosConfig)
                
                // This is all for notifications of successful uploads
                this.submittedUsers[response.data.id].submittionSuccess = true
                setTimeout(() => { this.submittedUsers[response.data.id].submittionSuccess = -1 }, this.notificationTime)

            } catch (error) {
                // Reroute if you aren't logged in
                if ([401, 403].includes(error.response.status)) { window.location.replace(`${env.url.client}/login`) }
                else { console.error(error) }

                this.submittedUsers[error.response.data.user.id].submittionSuccess = false
                this.submittedUsers[error.response.data.user.id].message = error.response.data.message

                setTimeout(() => { this.submittedUsers[error.response.data.user.id].submittionSuccess = -1 }, this.notificationTime)
            }
        }
    }
}
</script>

<style scoped>
label.checkbox {
    display: block;
}
</style>