<script>
import Tab from './components/Tab.vue'
import Tabs from './components/Tabs.vue'

  export default {
    components: {
      Tab,
      Tabs
    },

    data() {
        return {
            users: [],
            images: []
        }
    },

    methods: {
        createUserTemplate() {

        }
    }
}
</script>

<template>
    <div class="container">
        <tabs>
            <tab title="Tab 1">Hello From Tab 1</tab>
            <tab title="Tab 2">Hello From Tab 2</tab>
            <tab title="Tab 3">Hello From Tab 3</tab>
            <tab title="Tab 4">Hello From Tab 4</tab>
        </tabs>

        <div id="users" class="tabcontent">
            <h3>Adding New Users</h3>
            
            <!-- Just make this a component -->
            <ul class="display">
                <li class="user" v-for="user in users" :key="user.username">{{ user.username }}</li>
                <li class="user"><button class="new" @onClick="createUserTemplate()">Add new user</button></li>
            </ul>
        </div>

        <div id="images" class="tabcontent">
            <h3>Adding New Images</h3>

        </div>
    </div>
</template>

<style>
</style>