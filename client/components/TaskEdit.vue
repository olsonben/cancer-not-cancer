<template>
    <div class="modal" v-bind:class="{ 'is-active': true }">
        <div class="modal-background"></div>
        <div class="modal-content">
            <div class="section">
                <div class="box p-5">
                    <div class="field">
                        <label class="label">Name</label>
                        <div class="control is-large ">
                            <input class="input is-large has-text-weight-bold" type="text" value="task A">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Prompt</label>
                        <div class="control is-medium">
                            <textarea class="textarea has-text-weight-medium">Is the ROI cancer?</textarea>
                        </div>
                    </div>
                        <div class="field">
                            <label class="label">Group Adder</label>
                            <Adder />
                        </div>
                        <div class="field">
                            <label class="label">Observer Adders</label>
                            <Adder />
                        </div>
                        <div class="field">
                            <label class="label">Image Adder</label>
                            <Adder />
                        </div>
                    <div class="block">
                        <a class="button">Save</a>
                    </div>
                </div>
            </div>
        </div>
        <!-- <button class="modal-close is-large" aria-label="close"></button> -->
    </div>
</template>

<script>
export default {
    data() {
        return {
        }
    },
    computed: {
    },
    watch: {
    }
}

</script>


<style lang='scss' scoped>
.modal-background {
    // background-color: white;
}
</style>