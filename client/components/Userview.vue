<template>
    <div>
        <strong>{{ label }}</strong><div class="select is-medium" :class="{ 'is-loading': loading }">
            <select v-model="selectedUser">
                <option v-for="user in users" :value="user.id">{{ user.fullname }}</option>
            </select>
        </div>
    </div>
</template>

<script>
const api = useApi()
// this.$store.state.user.permissions.admin
const defaultUserArray = () => {
    return [{
        'id': null,
        'fullname': 'Self',
        'username': null
    }]
}
export default {
    props: {
        userId: Number,
        label: {
            default: 'View as user:',
            type: String
        },
    },
    emits: ['update:userId'],
    data() {
        return {
            users: defaultUserArray(),
            selectedUser: null,
            loading: true
        }
    },
    async mounted() {
        const { response } = await api.GET('/users/')
        this.loading = false
        this.users = defaultUserArray().concat(response.value)
    },
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
