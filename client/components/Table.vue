<template>
    <table class="table is-striped is-narrow">
        <thead>
            <th v-for="header in headers">{{ header }}</th>
        </thead>
        <tbody>
            <Row v-for="row in body" :key="row[indexProp]" :class="{ 'is-selected': false}"  :row="row" :order="order"/>
        </tbody>
    </table>
</template>

<script>
    export default {
        props: {
            tableData: {
                type: Object
            }
        },
        data() {
            return {
                headers:[],
                body: [],
                indexProp: '',
                order: [],
                selected: null
            }
        },
        watch: {
            tableData: {
                immediate: true,
                handler(newTableData) {
                    this.headers = newTableData.columns
                    this.body = newTableData.bodyData
                    this.indexProp = newTableData.indexProp
                    this.order = newTableData.order
                }
            }
        },
        methods: {
            // TODO: get row clicks working
            selectRow(row) {
                console.log('Selected', row)
            }
        }
    }
</script>

<style lang="scss" scoped>
/* CSS for the current page */
.table {
    font-size: 0.8rem;
    width: 100%;
    border-color: hsl(0deg, 0%, 86%);
    border-width: 1px;
    border-style: solid;
}
</style>