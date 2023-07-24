export namespace OpticalCharacterRecognition{
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

  export function useTempOcrCopy<A>(fileToCopy:GoogleAppsScript.Drive.File, fnToUseOcrCopy:(ocrCopyFileId:string) => A):A | never{
      const ocrCopy = createOcrCopy(fileToCopy)
      if(typeof(ocrCopy?.id) !== "string"){ throwInvalidFileContent(fileToCopy.getUrl()) }
      
      const result = fnToUseOcrCopy(ocrCopy.id)
      Drive.Files?.remove(ocrCopy.id)
      return result
    }

    function throwInvalidFileContent(url:string):never{
      throw new Error(`The Optical Character Recognition service was unable to produce a valid ocr copy for the file with url: ${url}`)
  }
}  