<script>
export default {
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
        <!-- NOTE:: Just use bootstrap + components -->
        <!-- NOTE:: Just make these things components -->

        <!-- Tabs: images, users -->

        <!-- images tab -->
        <div id="images">
            <h3>Adding New Images</h3>
            <!-- Display for new images -->
                <!-- List of new images -->
                    <!-- Each image has a miniaturized version, the name, and the path: path field (prefilled with "/images/[image name]") -->
                <!-- Button to add new images -->
                <!-- Click or drag & drop to add new images from file system -->
            <!-- Submit button -->
        </div>


        <!-- users tab -->
        <div id="users">
            <h3>Adding New Users</h3>
            
            <!-- Display box for new users -->
            <ul class="display">
                <!-- List of new users -->
                    <!-- Each user contains fullname and is pathologist when closed and fields for username and password when open (default) -->
                <!-- Button to add new users (Make this an item in the list?) -->
                <li class="user" v-for="user in users" :key="user.username">{{ user.username }}</li>
                <li class="user"><button class="new" @onClick="createUserTemplate()">Add new user</button></li>
            </ul>
            <!-- Submit button -->
        </div>

    </div>
</template>

<style>
</style>