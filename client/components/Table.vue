<template>
    <table class="table is-striped is-narrow">
        <thead>
            <th v-for="header in headers">{{ header }}</th>
        </thead>
        <tbody>
            <Row v-for="row in body" :key="row[indexProp]" :row="row" :order="order" />
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
                order: []
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