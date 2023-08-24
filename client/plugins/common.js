export default ({ app }, inject) => {
    const apiURL = app.$axios.defaults.baseURL.replace(/\/+$/, '')

    const common = {
        getLoginURL() {
            const isLogout = app.router.currentRoute.name == 'logout'
            const loginParams = new URLSearchParams({
                'ref_path': !isLogout ? app.router.currentRoute.fullPath : '/'
            })
            const loginURL = new URL(`${apiURL}/auth/google?${loginParams}`)
            return loginURL.href
        },
        getSelectedFiles(folderObject) {
            let allSelectedFiles = folderObject.contents.reduce(function recur(selected, child) {
                let childSelect = []
                if (child.type === 'tag') {
                    childSelect.push(...child.contents.reduce(recur, []))
                } else if (child.selected === true) {
                    childSelect.push(child.id)
                }
                selected.push(...childSelect)

                return selected
            }, [])

            return allSelectedFiles
        },
        getDecendantFiles(folderObject) {
            let allFiles = folderObject.contents.reduce(function recur(selected, child) {
                let childSelect = []
                if (child.type === 'tag') {
                    childSelect.push(...child.contents.reduce(recur, []))
                } else if (child.type !== 'tag') {
                    childSelect.push(child.id)
                }
                selected.push(...childSelect)

                return selected
            }, [])

            return allFiles
        },
        getSelectedState(folderObject) {
            let selectedFiles = this.getSelectedFiles(folderObject)
            if (selectedFiles.length === 0) {
                return 'none'
            } else {
                let allFiles = this.getDecendantFiles(folderObject)
                if (selectedFiles.length === allFiles.length) {
                    return 'all'
                } else {
                    return 'partial'
                }
            }
        }
    }
    inject('common', common)
}