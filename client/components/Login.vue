<template>
    <div class="modal" v-bind:class="{ 'is-active' : loginPath && !isLoggedIn }">
        <div class="modal-background"></div>
        <div class="modal-content">
            <div class="section">
                <div class="box has-text-centered">
                    <div class="block">
                        <p>
                            Please login to view this page.
                        </p>
                    </div>
                    <div class="block">
                        <a class="button" :href='loginLink'>Login with Google</a>
                    </div>
                </div>
            </div>
        </div>
        <!-- <button class="modal-close is-large" aria-label="close"></button> -->
    </div>
</template>

<script>
import { mapGetters } from "vuex";

const authPaths = ['pathapp', 'admin', 'admin-images', 'admin-users', 'admin-dataview']

export default {
    data() {
        return {
            loginLink: this.$common.getLoginURL(),
            loginPath: authPaths.includes(this.$route.name)
        }
    },
    computed: {
        ...mapGetters('user', ['isLoggedIn'])
    },
    watch:{
        $route: {
            handler(to, from) {
                this.loginLink = this.$common.getLoginURL()
                this.loginPath = authPaths.includes(this.$route.name)
            },
        }
    }
}

</script>


<style lang='scss' scoped>
.modal-background {
    background-color: white;
}

</style>