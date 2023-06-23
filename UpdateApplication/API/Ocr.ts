export namespace OpticalCharcterRecognition{
    export function createOcrCopy(file:GoogleAppsScript.Drive.File):GoogleAppsScript.Drive.Schema.File | undefined{       
        // Get a blob of the file
        const blob = file.getBlob()
        
        // Set up the parameters to use when inserting the file
        const resource = {
          title: file.getName(),
          mimeType: blob.getContentType()
        }
        const options = {
          ocr: true // This part allows us to "read" the text in images
        }
        // Insert the copy of the file.
        const ocrFile = Drive.Files?.insert(resource, blob, options)
        return ocrFile
    }
}  