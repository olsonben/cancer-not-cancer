<template>
    <tr>
        <td v-for="propName in order">{{ row[propName] }}</td>
    </tr>
</template>

<script>
    export default {
        props: ['row', 'order']
    }
</script>