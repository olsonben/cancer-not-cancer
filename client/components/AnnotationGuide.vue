<script setup>
// const props = defineProps({
//     label: String,
//     sizeClass: String,
// })

const emit = defineEmits(['exit'])

const selectedTask = ref(null)

const exit = () => {
    console.log('exit')
    emit('exit')
}

// watch(selectedTask, async (newTask, oldTask) => {
//     emit('taskSelected', newTask)
// })
</script>

<template>
    <div class="modal is-active on-top-nav">
        <div class="modal-background" @click="exit"></div>
        <div class="modal-content max-height-100" @click="exit">
            <div class="section p-0">
                <div class="box">
                    <div class="title is-5">
                        Hello Annotation Guide
                    </div>
    
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus enim turpis, pharetra id porta in, fringilla id dui. In at mauris est. In ullamcorper turpis at ipsum interdum, vel eleifend ipsum aliquet. Quisque vitae odio in tortor consectetur dapibus ut vel ante. Pellentesque lacus lorem, dapibus sed mattis vitae, dignissim sit amet arcu. Curabitur suscipit magna nunc, vel egestas est lacinia id. Morbi sagittis, nunc vitae pharetra ultrices, odio eros ullamcorper arcu, a suscipit massa lorem eget ex.
                    </p>
                    <br/>
                    <p>
                        In viverra ipsum sed mi pellentesque, et efficitur sem volutpat. Nunc volutpat augue id maximus finibus. Nullam lorem dolor, molestie vel rutrum a, tempus nec sem. Nam pretium tempor quam non ornare. Donec aliquam sit amet nisl sodales gravida. Vivamus porttitor felis vitae feugiat feugiat. Aliquam erat volutpat. Donec gravida dignissim vulputate. Aenean luctus nisi ante, ut interdum ligula faucibus eu.
                    </p>
                    <br/>
                    <p>    
                        Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Cras a euismod nulla. Praesent a quam laoreet, sodales purus vel, auctor sapien. Cras turpis sapien, ornare et velit non, cursus pellentesque purus. Cras commodo, ex eu viverra dictum, velit dolor ornare mi, eu laoreet enim ipsum volutpat risus. Nullam eleifend tellus nec accumsan semper. Duis faucibus ultricies nisl suscipit varius. Morbi luctus, nisl ac iaculis dictum, urna ligula rutrum lacus, quis placerat ipsum dui sed risus. 
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.on-top-nav {
    z-index: 10000;
}
.max-height-100 {
    max-height: 100%;
}
</style>