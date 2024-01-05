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


    return {
        /** download data as csv */
        downloadAsCSV(dataObjectArray, desiredFilename) {
            const csv = convertToCSV(dataObjectArray)
            const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')

            const url = URL.createObjectURL(csvBlob)
            link.href = url
            link.download = desiredFilename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        },
        
    }
}

