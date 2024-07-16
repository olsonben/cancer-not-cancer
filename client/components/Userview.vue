<script setup>
const api = useApi()

const defaultUserArray = () => {
    return [{
        'id': null,
        'fullname': 'Self',
        'username': null
    }]
}
const { userId, label } = defineProps({
     userId: { type: Number },
     label: { type: String, default: 'View as user:' },
})

const emit = defineEmits(['update:userId'])

const users = ref(defaultUserArray())
const selectedUser = ref(null)
const loading = ref(true)

const { data } = await api.GET('/users/')
loading.value = false
users.value = defaultUserArray().concat(data.value)

watch(selectedUser, (newUserID) => {
        // Allows us to pass the data to the parent component
        emit('update:userId', newUserID)
    },
    { immediate: true }
)
</script>

<template>
    <div>
        <strong>{{ label }}</strong><div class="select is-medium" :class="{ 'is-loading': loading }">
            <select v-model="selectedUser">
                <option v-for="user in users" :value="user.id">{{ user.fullname }}</option>
            </select>
        </div>
    </div>
</template>

<style lang="scss" scoped>
</style>
