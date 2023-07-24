
import { Assessment } from "../System/Assessment"
import { Credentials } from "../System/Credentials"
import { DynamicGrid } from "../System/DynamicGrid"
import { MyGlobals } from "../System/GLOBALS"
import { Cacher, MyCache } from "./Cacher"


export namespace StudentFiles{
    type FolderName = keyof ReturnType<typeof Credentials.getCredentials>["folderId"]
    export type StudentFolderName = keyof MyGlobals.Student & Exclude<FolderName, "assessment">

    export function updateSheetFileData(cache:MyCache, folderName:StudentFolderName):(studentGrid:DynamicGrid<MyGlobals.Student>) => DynamicGrid<MyGlobals.Student>{
        return studentGrid => {
            const alreadyAssignedUrls = new Map(studentGrid.lookupCol(folderName).map(richText => [richText.url || "", undefined]))
            return studentGrid.updateCol(
                folderName,
                student => {
                    const currentRichText = student[folderName]
                    alreadyAssignedUrls.set(currentRichText.url || "", undefined)
                    if(typeof(currentRichText.url) === "string" ) { return currentRichText }
                    if(student.firstName === "" || student.lastName === ""){ return currentRichText}
                    const studentNameRegex = getStudentNameRegex(student.firstName, student.lastName)
                    const foundUrl = cache.getRangeContaining(studentNameRegex, alreadyAssignedUrls).map(nr => {
                        const url = nr.getName()
                        alreadyAssignedUrls.set(url, undefined)
                        return url
                    })
                    return foundUrl.map(url => ({text:"LINK", url})).orElse(currentRichText) 
                },
            )
        }
    }

    function getStudentNameRegex(firstName:string, lastName:string): RegExp{
        return new RegExp(`(${firstName}.*${lastName})|(${lastName}.*${firstName})`,"ig")
    }
    export function updateAssessment(student:DynamicGrid<MyGlobals.Student>):DynamicGrid<MyGlobals.Student>{
        return student.updateCol(
            "assessment", 
            student => {
                if(student.assessment.url){
                    Assessment.fillIn(student, DocumentApp.openByUrl(student.assessment.url))
                }
                return student.assessment
            }
        )
    }
    export function updateAssessmentImages(cacher:MyCache, folderName:StudentFolderName):(students: DynamicGrid<MyGlobals.Student>) => DynamicGrid<MyGlobals.Student>{
        return students => {
            return students.updateCol(
                folderName,
                student => {
                    Cacher.attachImagesToAssessment(student, cacher, folderName)
                    return student[folderName]
                }
            )
        }
    }
}