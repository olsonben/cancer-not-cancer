export const useDataTools = () => {
    const api = useApi()

    /** Call the api for task rating data. */
    async function pullTaskData(taskId) {
        try {
            const { response } = await api.GET('tasks/export', {
                id: taskId
            })
    
            return response.value
            
        } catch (error) {
            console.error(error)
        }
    }

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
        async downloadTaskAsCSV(taskObj, desiredFilename) {
            try {
                const ratings = await pullTaskData(taskObj.id)
                const csv = convertToCSV(ratings)
                const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

                downloadBlob(csvBlob, desiredFilename)
            } catch (error) {
                console.error('Sorry but the CSV export failed.')
            }

        },
        /** download data as json */
        async downloadTaskAsJSON(taskObj, desiredFilename) {
            try {
                const ratings = await pullTaskData(taskObj.id)
                const jsonData = {
                    task_id: taskObj.id,
                    task_name: taskObj.short_name,
                    task_prompt: taskObj.prompt,
                    num_ratings: ratings.length,
                    images: []
                }
    
                const imageMap = {}
                for (const rating of ratings) {
                    const imageId = rating.image_id
                    // get image object or create it otherwise
                    const imageObj = imageMap[imageId] || {
                        image_id: imageId,
                        original_name: rating.original_name,
                        ratings: []
                    }
                    // add rating if it exists
                    if (rating.rating !== null) {
                        imageObj.ratings.push({
                            rating: rating.rating,
                            observer_id: rating.observer_id
                        })
                    } else {
                        jsonData.num_ratings -= 1
                    }
                    // add image object to jsonData an imageMap if it isn't already
                    if (!imageMap[imageId]) {
                        jsonData.images.push(imageObj)
                        imageMap[imageId] = imageObj
                    }
                }
    
                const jsonString = JSON.stringify(jsonData)
                const jsonBlob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' })
                
                downloadBlob(jsonBlob, desiredFilename)
            } catch (error) {
                console.error('Sorry but the CSV export failed.')
            }
        },
        
    }
}

