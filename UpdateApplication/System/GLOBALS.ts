import { Credentials } from "./Credentials"
import { DynamicGrid } from "./DynamicGrid"
import { Maybe } from "./Maybe"
import { Utility } from "./Utility"

export namespace MyGlobals{
    export type Student = {
        firstName:string
        lastName:string
        fullName:string
        assessmentDate:string
        phone:string
        email:string
        employer:string
        job:string
        inConstruction:string
        hasOsha10Card:string
        address:string
        formattedAddress:string
        borough:string
        councilDistrict:string
        isNychaResident:string
        development:string
        hasValidId:string
        assessment:RichText
        photoId:RichText
        completionCertificate:RichText
        osha30Card:RichText
    }
    
    export interface RichText{
        text:string, 
        url?:string | null
    }

    type Headers<T> = {
        [k in keyof T]: number
    }

    export function getOsha30TrackerSheet():GoogleAppsScript.Spreadsheet.Sheet{
        return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('OSHA 30 Tracker') as GoogleAppsScript.Spreadsheet.Sheet 
    }
    
    export function getMockStudent():{emptyProps:Student, filledProps:Student}{
        return {
            emptyProps: {
                firstName:"",
                lastName:"",
                fullName:"",
                assessmentDate:"",
                phone:"",
                email:"",
                employer:"",
                job:"",
                inConstruction:"",
                hasOsha10Card:"",
                formattedAddress:"",
                address:"",
                borough:"",
                councilDistrict:"",
                isNychaResident:"",
                development:"",
                hasValidId:"",
                assessment:{text:""},
                photoId:{text:""},
                completionCertificate:{text:""},
                osha30Card:{text:""}
            },
            filledProps:{
                firstName:"firstName",
                lastName:"lastName",
                fullName:"fullName",
                assessmentDate:"assessmentDate",
                phone:"phone",
                email:"email",
                employer:"employer",
                job:"job",
                inConstruction:"inConstruction",
                hasOsha10Card:"hasOsha10Card",
                formattedAddress:"formattedAddress",
                address:"address",
                borough:"borough",
                councilDistrict:"councilDistrict",
                isNychaResident:"isNychaResident",
                development:"development",
                hasValidId:"hasValidId",
                assessment:{text:"assessment", url:"assessment"},
                photoId:{text:"id", url:"id"},
                completionCertificate:{text:"certificate", url:"certificate"},
                osha30Card:{text:"osha30Card", url:"osha30Card"}
            }
        }
    }

    export function getStudentData():DynamicGrid<Student>{
        const grid = getStudentDataRangeValues()
        const headers = getHeaders()
        return DynamicGrid.of(grid, headers) as DynamicGrid<Student>
        
        function getStudentDataRangeValues():Array<Array<RichText|string>>{
            const sheet = getOsha30TrackerSheet()
            if (!sheet) { throw new Error("No Sheet Found")}
            const dataRange = sheet.getRange("studentDataRange").getValues() as Array<Array<string>>
            const documentDataRange = sheet.getRange("studentDocumentRange").getRichTextValues()
                .map(row => row.map(rt => ({text: (rt?.getText() || ""), url:(rt?.getLinkUrl())})))
            const studentDataRange = Utility.appendColumn(dataRange, documentDataRange)
            return studentDataRange
        }
        function getHeaders(): Headers<Student>{
            const sheet = getOsha30TrackerSheet()
            const validHeaders = getMockStudent().emptyProps
            if (!sheet) { throw new Error("No Sheet Found")}
            const namedRanges = Object.fromEntries(sheet.getNamedRanges().map((nr) => [nr.getName(), nr.getRange().getColumn() - 1] ).filter(([name, _]) => name in validHeaders))
            return namedRanges
        }
    }

    function getFolderIds(){
        const CREDENTIALS = Credentials.getCredentials()
        const FOLDER_ID = CREDENTIALS.folderId
        const FolderIds = {
            assessment: FOLDER_ID.assessment,
            completionCertificate: FOLDER_ID.completionCertificate,
            osha30Card: FOLDER_ID.osha30Card,
            osha30Folder: FOLDER_ID.osha30Folder,
            photoId: FOLDER_ID.photoId,
         } as const
         return FolderIds
    }

    type FolderNames = keyof ReturnType<typeof Credentials.getCredentials>["folderId"]

    export function getFolder(name:FolderNames):GoogleAppsScript.Drive.Folder{
        return DriveApp.getFolderById(getFolderIds()[name])
    }
    export function getFilesFrom(folderName:FolderNames, maxNumberOfFilesToGet?:number): {get: (fileName:string) => Maybe<GoogleAppsScript.Drive.File>}{
        const fileIterator = getFolder(folderName).getFiles()
        const files =  Utility.collect(fileIterator, addToMap, maxNumberOfFilesToGet)
        return {get: (fileName:string) => Maybe.of(files.get(fileName.toUpperCase())) as Maybe<GoogleAppsScript.Drive.File> }

        function addToMap(file:GoogleAppsScript.Drive.File, map:Map<string, GoogleAppsScript.Drive.File>): Map<string, GoogleAppsScript.Drive.File>{
            return new Map(map).set(file.getName().toUpperCase(), file)
        }
    }
    export function getAssessmentTemplate():GoogleAppsScript.Drive.File{
        const id = Credentials.getCredentials().docId.assessmentTemplate
        return DriveApp.getFileById(id)
    }

    export function getMockCache(){
        return DocumentApp.openById("1ziwyassOwIZgnQZ676ONKf7at49xT_e6wnHn9Qi9bZk")
    }
    export function getMockDoc(){
        return DocumentApp.openById("1nCgPmNhaW7a3Fi5ZaW81Ryu-IfMMbfit47au0N3Ffps")
    }
    export function getMockAssessment(){
        return DocumentApp.openById("14r0GPivmewkoIwQDe6gcHpi_GxomTuB5gW-fNVBso4k")
    }
    
    export function getMockImage(){
        return DriveApp.getFileById("14yqnF8gc3FXUWL6o7S_0O3GGzOva3Y2y").getAs("image/jpeg")
    }
    
    export function getMockPhotoId(){
        return DocumentApp.openById("1RBwWVHJ7K-W6XI6CEiIJnXtqSyNQQywH7Oo7_eyrxFw")
    }
    export function getMockCompletionCertificate(){
        return DocumentApp.openById("1N-ygvGxDb20Do5lwFJqqPyFU_FQOaSgxTpzwKSyoHvU")
    }
    export function getMockOsha30Card(){
        return DocumentApp.openById("1K6OIfvzwLwtro9hKMAut2JovFZ3HNRY14hXNOZdjHiU")
    }
    export function getMockCachePhotoId(){
        return DocumentApp.openById("1GCWXUUHiLfjyaBwQzMt2A6P_nBDetkohXj0TTqew7lc")
    }
    export function getMockCacheCompletionCertificate(){
        return DocumentApp.openById("1sLnmaxScJV2rKdAslKyJuLMyr1jSw2_aVQijpY6bDNw")
    }
    export function getMockCacheOsha30Card(){
        return DocumentApp.openById("1fPxSBPsHq6pK24mbLLOorXZNGFio6M7pur8WbG3idZA")
    }



    export function getMockFolder(){
        return DriveApp.getFolderById("1FuU9JE3DWt_m4rOvnw3Vhq4cHm59ltbZ")
    }

    export function clearFolder(folder:GoogleAppsScript.Drive.Folder){
        const files = folder.getFiles()
        while(files.hasNext()){
            const file = files.next()
            folder.removeFile(file)
        }
        const subfolders = folder.getFolders()
        while(subfolders.hasNext()){
            const subfolder = subfolders.next()
            folder.removeFolder(subfolder)
        }
    }
  
    // function getOsha30Folder():GoogleAppsScript.Drive.Folder{
    //     const id = FOLDER_ID.osha30folder
    //     return DriveApp.getFolderById(id)
    // }

    // export function getAssessmentFolder():GoogleAppsScript.Drive.Folder{
    //     const id = FOLDER_ID.assessment
    //     return DriveApp.getFolderById(id)
    // }

    // export function getPhotoIdFolder():GoogleAppsScript.Drive.Folder{
    //     const id = FOLDER_ID.photoId
    //     return DriveApp.getFolderById(id)
    // }

    // export function getCompletionCertificateFolder():GoogleAppsScript.Drive.Folder{
    //     const id = FOLDER_ID.completionCertificate
    //     return DriveApp.getFolderById(id)
    // }

    // export function getOsha30CardFolder():GoogleAppsScript.Drive.Folder{
    //     const id = FOLDER_ID.osha30Card
    //     return DriveApp.getFolderById(id)
    // }

}