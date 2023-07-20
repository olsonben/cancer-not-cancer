<template>
    <div>
        <strong>View as user:</strong><div class="select is-medium" :class="{ 'is-loading': $fetchState.pending }">
            <select v-model="selectedUser">
                <option v-for="user in users" :value="user.id">{{ user.fullname }}</option>
            </select>
        </div>
    </div>
</template>

<script>
// this.$store.state.user.permissions.admin
const defaultUserArray = () => {
    return [{
        'id': null,
        'fullname': 'Self',
        'username': null
    }]
}
export default {
    data() {
        return {
            users: defaultUserArray(),
            selectedUser: null,
        }
    },
    async fetch() {
        const response = await this.$axios.$get('/getUsers')
        this.users = defaultUserArray().concat(response)
    },
    fetchOnServer: false,
    watch: {
        selectedUser: {
            immediate: true,
            handler(newUserID) {
                // Allows us to pass the data to the parent component
                this.$emit('update:userId', newUserID)
            }
        }
    },
}
</script>

<style lang="scss" scoped>
</style>
