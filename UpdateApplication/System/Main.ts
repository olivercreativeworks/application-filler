import { Cacher } from "../GAS/Cacher"
import { StudentFiles } from "../GAS/StudentFiles"
import { AddressWriter } from "./Address.writer"
import { AssessmentWriter } from "./Assessment.writer"
import { Credentials } from "./Credentials"
import { MyGlobals } from "./GLOBALS"
import { Maybe } from "./Maybe"


type FolderName = keyof ReturnType<typeof Credentials.getCredentials>["folderId"]
export type StudentFolderName = keyof MyGlobals.Student & Exclude<FolderName, "assessment">

function updateStudentField(fieldName: StudentFolderName){
    const cache = Cacher.getReconciledCacheFor(fieldName)
    return StudentFiles.updateSheetFileData(cache, fieldName)
}

function main(){
    const photoIdCache = Cacher.getReconciledCacheFor("photoId")
    const completionCertificateCache = Cacher.getReconciledCacheFor("completionCertificate")
    const osha30CardCache = Cacher.getReconciledCacheFor("osha30Card")

    const studentData = MyGlobals.getStudentData()
    const alreadyAssigned = new Map()
    Maybe.of(studentData)
    .map(AddressWriter.updateStudentAddressFields)
    .map(StudentFiles.updateSheetFileData(photoIdCache, "photoId"))
    .map(StudentFiles.updateSheetFileData(completionCertificateCache, "completionCertificate"))
    .map(StudentFiles.updateSheetFileData(osha30CardCache, "osha30Card"))
    .map(AssessmentWriter.updateStudentAssessments)
    .map(StudentFiles.updateAssessment)
    .map(StudentFiles.updateAssessmentImages(photoIdCache, "photoId"))
    .map(StudentFiles.updateAssessmentImages(completionCertificateCache, "completionCertificate"))
    .map(StudentFiles.updateAssessmentImages(osha30CardCache, "osha30Card"))
    
    
    // Maybe.of(studentData)
    // .map(AddressWriter.updateStudentAddressFields)
    // .map(updateStudentField("photoId"))
    // .map(updateStudentField("completionCertificate"))
    // .map(updateStudentField("osha30Card"))
    // .map(AssessmentWriter.updateStudentAssessments)
    // .map(StudentFiles.updateAssessment)
    // .map(StudentFiles.updateAssessmentImages("photoId"))
    // .map(StudentFiles.updateAssessmentImages("completionCertificate"))
    // .map(StudentFiles.updateAssessmentImages("osha30Card"))


    // search the cached text for the student name
    // if we find the student name in the cached text, we put the url in the spreadsheet and remove the file from the map
    // filter out the files that are already in the spreadsheet

    // otherwise we continue through checking the other students
    // then we move on to the next file

        // .map(StudentFiles.insertRichText("photoId"))
        // .map(StudentFiles.insertRichText("osha30Card"))
        // .map(StudentFiles.insertRichText("completionCertificate"))
        // .map(StudentFiles.insertRichText("assessment"))
}

