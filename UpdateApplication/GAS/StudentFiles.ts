import { Credentials } from "../Credentials"
import { DynamicGrid } from "../DynamicGrid"
import { MyGlobals } from "../GLOBALS"
import { MyCache } from "./Cacher"


export namespace StudentFiles{
    type FolderName = keyof ReturnType<typeof Credentials.getCredentials>["folderId"]
    export type StudentFolderName = keyof MyGlobals.Student & Exclude<FolderName, "assessment">

    export function updateSheetFileData(cache:MyCache, folderName:StudentFolderName):(studentGrid:DynamicGrid<MyGlobals.Student>) => DynamicGrid<MyGlobals.Student>{
        return studentGrid => {
            return studentGrid.updateCol(
                folderName,
                student => {
                    if(student.firstName === "" || student.lastName === ""){ return student.assessment}
                    const studentNameRegex = getStudentNameRegex(student.firstName, student.lastName)
                    const foundUrl = cache.getRangeContaining(studentNameRegex).map(nr => nr.getName())
                    return foundUrl.map(url => ({text:"LINK", url})).orElse(student.assessment) 
                },
                richTextField => richTextField.text === ""
            )
        }
    }

    function getStudentNameRegex(firstName:string, lastName:string): RegExp{
        return new RegExp(`(${firstName}.*${lastName})|(${lastName}.*${firstName})`,"ig")
    }

}