export const useDataTools = () => {

    /** convert data to csv */
    function convertToCSV(dataObjectArray, withHeaders = true) {
        const dataArray = typeof dataObjectArray !== 'object' ? JSON.parse(dataObjectArray) : dataObjectArray
        let csvStr = '';

        // Add headers
        if (withHeaders) {
            for (const key in dataArray[0]) {
                if (dataArray[0].hasOwnProperty(key)) {
                    csvStr += key + ','
                }
            }
            csvStr = csvStr.slice(0, -1) + '\r\n'
        }

        // Add rows
        for (let i = 0; i < dataArray.length; i++) {
            let row = ''
            for (const key in dataArray[i]) {
                if (dataArray[i].hasOwnProperty(key)) {
                    row += dataArray[i][key] + ','
                }
            }
            row = row.slice(0, -1)
            csvStr += row + '\r\n'
        }

        return csvStr
    }

    /** Download a blob as a file. */
    function downloadBlob(blob, filename) {
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return {
        /** download data as csv */
        downloadAsCSV(dataObjectArray, desiredFilename) {
            const csv = convertToCSV(dataObjectArray)
            const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            
            downloadBlob(csvBlob, desiredFilename)
        },
        /** download data as json */
        downloadAsJSON(dataObjectArray, desiredFilename) {
            const jsonString = JSON.stringify(dataObjectArray)
            const jsonBlob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' })
            
            downloadBlob(jsonBlob, desiredFilename)
        },
        
    }
}

