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
import { mapState } from "pinia";
import { useUserStore } from "~/store/user"

const authPaths = ['pathapp', 'admin', 'admin-images', 'admin-users', 'admin-dataview', 'admin-tasks']

export default {
    data() {
        return {
            loginLink: getLoginUrl(),
            loginPath: authPaths.includes(this.$route.name),
        }
    },
    computed: {
        ...mapState(useUserStore, ['isLoggedIn'])
    },
    watch:{
        $route: {
            handler(to, from) {
                this.loginLink = getLoginUrl()
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