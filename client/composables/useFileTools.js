export const useFileTools = () => {
    const makeRootFolder = (fileContentTree) => {
        const root = {
            id: 0,
            name: 'root',
            contents: fileContentTree,
            type: 'tag',
            selected: [],
        }
        return root
    }

    return {
        /** Get all selected files from the a nested folder structure object. */
        getSelectedFiles(folderObject) {
            // Folder structures from the api are sent as Arrays without a root folder
            // so if it is an array we can enclose it in a temp root folder.
            if (Array.isArray(folderObject)) {
                folderObject = makeRootFolder(folderObject)
            }

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
}

