export default defineNuxtPlugin((app) => {
    const route = useRoute()
    const config = useRuntimeConfig()
    const apiUrlNoSlash = config.public.apiUrl.replace(/\/+$/, '')


    const common = {
        /** Create a login URL that has current page as a parameter for redirecting after logged in. */
        getLoginURL() {
            const isLogout = route.name == 'logout'
            const loginParams = new URLSearchParams({
                'ref_path': !isLogout ? route.fullPath : '/'
            })
            const loginURL = new URL(`${apiUrlNoSlash}/auth/google?${loginParams}`)
            return loginURL.href
        },
        /** Get all selected files from the a nested folder structure object. */
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
        /** Get all nested files within a nested folder structure object. */
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
        /** Get a folder's selected state. 'all', 'partial', or 'none' decendant files selected. */
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
    return {
        provide: {
            common: common
        }
    }
})