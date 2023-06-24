import { Assessment } from "./Assessment"
import { DynamicGrid } from "./DynamicGrid"
import { MyGlobals } from "./GLOBALS"
import { Maybe } from "./Maybe"

export namespace AssessmentWriter{  
    interface AssessmentObj<A>{
        fill:(student:MyGlobals.Student & {assessment:{url:string}}, assessment:A) => void
        getUrl:(fileName:string) => string
        getAssessment:(url:string) => A
    }

    function hasUrl(richText:MyGlobals.RichText): richText is {text:string, url:string}{
        return typeof richText.url === "string"
    }

    export function getAssessmentObj():AssessmentObj<GoogleAppsScript.Document.Document>{
        const fetchOrCreateAssessment = Maybe.getThisOrGetThat(Assessment.retrieve(), Assessment.create)
        return {
            fill: (student:MyGlobals.Student & {assessment:{url:string}}, assessment:GoogleAppsScript.Document.Document) => Assessment.fillIn(student, assessment),
            getUrl: (fullName:string) => fetchOrCreateAssessment(fullName).getUrl(),
            getAssessment: (url:string) => DocumentApp.openByUrl(url)
        }
    }

    export function updateAssessments<A>(studentData: DynamicGrid<MyGlobals.Student>, assessmentObj:AssessmentObj<A>):DynamicGrid<MyGlobals.Student>{
        function textIsEmptyString(richText: MyGlobals.RichText):richText is {text:""}{
            return richText.text === ""
        }
        
        const updatedData = studentData
            .updateCol("assessment", createAssessmentRichText(x => assessmentObj.getUrl(x)), textIsEmptyString)
            .updateCol("assessment", student => populateAssessmentFields(student, assessmentObj.fill, assessmentObj.getAssessment), hasUrl)
        return updatedData 
    }

    function createAssessmentRichText(getUrl:(arg:string) => string):(student:MyGlobals.Student) => MyGlobals.RichText{
        function createRichText(text:string, url?:string):MyGlobals.RichText{
            return {text, url}
        }
        return (student) => student.fullName === "" ? student.assessment : createRichText("LINK", getUrl(student.fullName) )

    }

    function populateAssessmentFields<A>(richTextStudent:MyGlobals.Student, fillFn:(student:MyGlobals.Student & {assessment:{url:string}}, assessment:A) => void, getAssessmentFn:(url:string) => A):MyGlobals.RichText{
        if(hasUrl(richTextStudent.assessment)){
            const assessment = getAssessmentFn(richTextStudent.assessment.url)
            fillFn(richTextStudent as MyGlobals.Student & {assessment:{url:string}}, assessment)
        }
        return richTextStudent.assessment
    }  
}

