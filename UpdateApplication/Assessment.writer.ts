import { Assessment } from "./Assessment"
import { DynamicGrid } from "./DynamicGrid"
import { MyGlobals } from "./GLOBALS"
import { Maybe } from "./Maybe"

export namespace AssessmentWriter{  
    interface AssessmentObj<A>{
        fill:(student:MyGlobals.Student & {assessment:{url:string}}) => void
        getUrl:(fileName:string) => string
    }

    function getAssessmentObj():AssessmentObj<GoogleAppsScript.Drive.File>{
        const fetchOrCreateAssessment = Maybe.getThisOrGetThat(Assessment.retrieve(), Assessment.create)
        return {
            fill: (student:MyGlobals.Student & {assessment:{url:string}}) => Assessment.fillIn(student, DocumentApp.openByUrl(student.assessment.url)),
            getUrl: (fullName:string) => fetchOrCreateAssessment(fullName).getUrl()
        }
    }

    export function updateAssessments<A>(studentData: DynamicGrid<MyGlobals.Student>, assessmentObj:AssessmentObj<A> = getAssessmentObj()):DynamicGrid<MyGlobals.Student>{
        const updatedData = studentData
            .updateCol("assessment", createAssessmentRichText(x => assessmentObj.getUrl(x)), textIsEmptyString)
            .updateCol("assessment", populateAssessmentFields(assessmentObj.fill), hasUrl)
        return updatedData
    }

    function createAssessmentRichText<A>(getUrl:(arg:string) => string):(student:MyGlobals.Student) => MyGlobals.RichText{
        return (student) => student.fullName === "" ? student.assessment : createRichText("LINK", getUrl(student.fullName) )
    }

    function populateAssessmentFields(fillFn:(arg:MyGlobals.Student & {assessment:{url:string}}) => void): (student:MyGlobals.Student) => MyGlobals.RichText{
        return student => fillAssessment(student, fillFn)
    }

    export function fillAssessment(richTextStudent:MyGlobals.Student, fillFn:(student:MyGlobals.Student & {assessment:{url:string}}) => void):MyGlobals.RichText{
        if(hasUrl(richTextStudent.assessment)){
            fillFn(richTextStudent as MyGlobals.Student & {assessment:{url:string}})
        }
        return richTextStudent.assessment
    }
    
    function hasUrl(richText:MyGlobals.RichText): richText is {text:string, url:string}{
        return typeof richText.url === "string"
    }
    
    function textIsEmptyString(richText: MyGlobals.RichText):richText is {text:""}{
        return richText.text === ""
    }
    
    function createRichText(text:string, url?:string):MyGlobals.RichText{
        return {text, url}
    }
}

