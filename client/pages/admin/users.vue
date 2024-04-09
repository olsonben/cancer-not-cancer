<template>
    <section class='section'>
        <!-- Main form -->
        <h1 class='title'>Adding Users</h1>
        <form @submit.prevent='submitUser'>
            <div class='field is-horizontal'> <!-- Formatting stuff -->
                <div class='field-label'>
                    <label class='label'>Information</label>
                </div>
                <div class='field-body'>
                    <!-- Name -->
                    <div class="field">
                        <label class="label">Name</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Fullname" v-model="user.fullname" />
                        </div>
                    </div>
                    <!-- Email -->
                    <div class="field">
                        <label class="label">Email</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Email" v-model="user.email" />
                        </div>
                    </div>
                    <!-- Password (technically optional for functionality) -->
                    <div class="field">
                        <label class="label">Password</label>
                        <div class="control">
                            <input class="input" type="password" placeholder="Password" v-model="user.password" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Permissions -->
            <!-- NOTE: values for permissions must be truthy -->
            <div class="field is-horizontal"> <!-- More formatting stuff -->
                <div class="field-label">
                    <label class="label">Permissions</label>
                </div>
                <div class="field-body">
                    <div class="field">
                        <div class="control">
                            <!-- Enabled -->
                            <label class="checkbox">
                                <input type="checkbox" value='1' v-model="user.permissions.enabled">
                                Is Enabled
                            </label>
                            <!-- Uploader -->
                            <label class="checkbox">
                                <input type="checkbox" value='1' v-model="user.permissions.uploader">
                                Is Uploader
                            </label>
                            <!-- Pathologist -->
                            <label class="checkbox">
                                <input type="checkbox" value='1' v-model="user.permissions.pathologist">
                                Is Pathologist
                            </label>
                            <!-- Admin -->
                            <label class="checkbox">
                                <input type="checkbox" value='1' v-model="user.permissions.admin">
                                Is Admin
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Submit -->
            <input class='button is-primary' type="submit" value="Submit" />
        </form>
        
        <!-- Feedback after submission -->
        <div v-for='user in submittedUsers'>
            <div v-if="user.submittionSuccess != null && user.submittionSuccess === true" class='notification is-success is-light'>
                User {{ user.fullname }} was successfully submitted.
            </div>
            <div v-else-if="user.submittionSuccess != null && user.submittionSuccess === false" class='notification is-danger is-light'>
                User {{ user.fullname }} failed to submit: {{ user.message }}
            </div>
            <div v-else-if="user.submittionSuccess === null" class='notification is-warning is-light'>
                User {{ user.fullname }} is submitted, awaiting response.
            </div>
        </div>
    </section>
</template>

<script>
const api = useApi()
const router = useRouter()
let submitCounter = 0;

export default {
    data() {
        return {
            // User object template
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
            
            // Keeping track of submission responses
            submittedUsers: {},
            notificationTime: "5000",
        }
    },
    created() {
        useHead({
            title: 'Admin - Users'
        })
    },

    methods: {
        addSubmittedUser(submitId, propObj) {
            this.submittedUsers[submitId] = Object.assign({}, propObj)
        },

        removeSubmittedUser(submitId) {
            // Remove user and notification after timeout
            setTimeout(() => {
                delete this.submittedUsers[submitId]
            }, this.notificationTime)
        },
        validEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },
        // Submit new user (activated on clicking Submit button in Users tab)
        async submitUser() {
            // valid email required
            if (!this.validEmail(this.user.email)) {
                // TODO: visualize the validation in the form
                console.log('A valid email is needed.')
                return
            }

            // Remember the submission for notification
            const submissionId = submitCounter++
            this.addSubmittedUser(submissionId, this.user)

            // POST to /users
            try {
                // unique identifier to keep multiple request submissions unique
                const key = `submitUser_${this.user.fullname}_${this.user.email}`
                await api.POST('/users/', this.user, key)

                // This is all for notifications of successful uploads
                this.submittedUsers[submissionId].submittionSuccess = true // Note success
                
                // Clear the form for more user entries
                this.user.fullname = ''
                this.user.email =''
                this.user.password =''
                this.user.permissions.enabled = 0
                this.user.permissions.uploader = 0
                this.user.permissions.pathologist = 0
                this.user.permissions.admin = 0

                // clear user from message queue
                this.removeSubmittedUser(submissionId)

            } catch (error) {
                // Note failure
                this.submittedUsers[submissionId].submittionSuccess = false

                if (error.value.statusCode == 409) {
                    // email already exists
                    // TODO: test error.data, it might exist at error.value.data
                    this.submittedUsers[submissionId].message = error.data.message
                } else {
                    this.submittedUsers[submissionId].message = 'Something went wrong.'
                    console.error(error)
                }

                // clear user from message queue
                this.removeSubmittedUser(submissionId)
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