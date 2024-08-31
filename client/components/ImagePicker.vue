<template>
    <div class="image-picker">

        <div class="menu">
            <p class="menu-label" @click="report">Images Folders</p>
            <ul class="menu-list">
                <!-- https://stackoverflow.com/questions/42629509/you-are-binding-v-model-directly-to-a-v-for-iteration-alias -->
                <li v-for="(file, index) in files" :key="file.id">
                    <folder v-if="isFolder(file)" v-model="files[index]" :selectable="true" />
                    <File v-else v-model="files[index]" :selectable="true"></File>
                </li>

            </ul>
        </div>

    </div>
</template>

<script>
export default {
    props: ['files'],
    emits: ['report'],
    methods: {
        report() {
            this.$emit('report')
        },
        isFolder(file) {
            return !!(file.contents && file.contents.length)
        },
    }
}
</script>

<style lang='scss' scoped>
.image-picker {
    transition: 0.5s ease;
    border: 1px solid $primary;

    .menu {
        max-height: 60vh;
        overflow-y: scroll;
        padding: 0.625rem;
    }
}
</style>