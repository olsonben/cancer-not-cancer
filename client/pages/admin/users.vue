<script setup>
useHead({
    title: 'Admin - Users'
})
const api = useApi()


// User object template
const curUser = reactive({
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
})

// Keeping track of submission responses
let submitCounter = 0
const submittedUsers = ref({})
const notificationTime = 5000


const addSubmittedUser = (submitId, propObj) => {
    submittedUsers.value[submitId] = Object.assign({}, propObj)
}

const removeSubmittedUser = (submitId) => {
    // Remove user and notification after timeout
    setTimeout(() => {
        delete submittedUsers.value[submitId]
    }, notificationTime)
}

const validEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// Submit new user (activated on clicking Submit button in Users tab)
const submitUser = async (event) => {
    // valid email required
    if (!validEmail(curUser.email)) {
        // TODO: visualize the validation in the form
        console.log('A valid email is needed.')
        return
    }

    // Remember the submission for notification
    const submissionId = submitCounter++
    addSubmittedUser(submissionId, curUser)

    // POST to /users
    try {
        // unique identifier to keep multiple request submissions unique
        const key = `submitUser_${curUser.fullname}_${curUser.email}`
        await api.POST('/users/', curUser, key)

        // This is all for notifications of successful uploads
        submittedUsers.value[submissionId].submittionSuccess = true // Note success

        // Clear the form for more user entries
        curUser.fullname = ''
        curUser.email = ''
        curUser.password = ''
        curUser.permissions.enabled = 0
        curUser.permissions.uploader = 0
        curUser.permissions.pathologist = 0
        curUser.permissions.admin = 0

        // clear user from message queue
        removeSubmittedUser(submissionId)

    } catch (error) {
        // Note failure
        submittedUsers.value[submissionId].submittionSuccess = false

        if (error.value.statusCode == 409) {
            // email already exists
            // TODO: test error.data, it might exist at error.value.data
            submittedUsers.value[submissionId].message = error.data.message
        } else {
            submittedUsers.value[submissionId].message = 'Something went wrong.'
            console.error(error)
        }

        // clear user from message queue
        removeSubmittedUser(submissionId)
    }
    return false
}
</script>

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
                            <input class="input" type="text" placeholder="Fullname" v-model="curUser.fullname" />
                        </div>
                    </div>
                    <!-- Email -->
                    <div class="field">
                        <label class="label">Email</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Email" v-model="curUser.email" />
                        </div>
                    </div>
                    <!-- Password (technically optional for functionality) -->
                    <div class="field">
                        <label class="label">Password</label>
                        <div class="control">
                            <input class="input" type="password" placeholder="Password" v-model="curUser.password" />
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
                                <input type="checkbox" value='1' v-model="curUser.permissions.enabled">
                                Is Enabled
                            </label>
                            <!-- Uploader -->
                            <label class="checkbox">
                                <input type="checkbox" value='1' v-model="curUser.permissions.uploader">
                                Is Uploader
                            </label>
                            <!-- Pathologist -->
                            <label class="checkbox">
                                <input type="checkbox" value='1' v-model="curUser.permissions.pathologist">
                                Is Pathologist
                            </label>
                            <!-- Admin -->
                            <label class="checkbox">
                                <input type="checkbox" value='1' v-model="curUser.permissions.admin">
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
            <div v-if="user.submittionSuccess != null && user.submittionSuccess === true"
                class='notification is-success is-light'>
                User {{ user.fullname }} was successfully submitted.
            </div>
            <div v-else-if="user.submittionSuccess != null && user.submittionSuccess === false"
                class='notification is-danger is-light'>
                User {{ user.fullname }} failed to submit: {{ user.message }}
            </div>
            <div v-else-if="user.submittionSuccess === null" class='notification is-warning is-light'>
                User {{ user.fullname }} is submitted, awaiting response.
            </div>
        </div>
    </section>
</template>

<style scoped>
label.checkbox {
    display: block;
}
</style>