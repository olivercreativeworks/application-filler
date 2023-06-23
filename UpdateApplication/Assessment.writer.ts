import { Assessment } from "./Assessment"
import { DynamicGrid } from "./DynamicGrid"
import { MyGlobals } from "./GLOBALS"
import { Maybe } from "./Maybe"

export namespace AssessmentWriter{    
    export function fetchOrCreateAssessment<A>(fetchFn:(fileName:string) => Maybe<A> | Maybe<A | undefined>, createFn:(fileName:string) => A):(fileName:string) => A{
        return (fileName) =>  fetchFn(fileName).orElseGet(() => createFn(fileName))
    }
    
    function $fetchOrCreateRichTextAssessment():(fileName:string) => MyGlobals.RichText{
        const documentGetter = fetchOrCreateAssessment(Assessment.retrieve(), Assessment.create)
        return fullName =>  createRichText("LINK", documentGetter(fullName)?.getUrl())
    }

    export function updateAssessments(studentData: DynamicGrid<MyGlobals.Student>):DynamicGrid<MyGlobals.Student>{
        const fetcher = $fetchOrCreateRichTextAssessment()
        const updatedData = studentData
            .updateCol("assessment", student => fetcher(student.fullName), textIsEmptyString)
            .updateCol("assessment", populateAssessmentFields, hasUrl)
        return updatedData
    }

    function populateAssessmentFields(student:MyGlobals.Student):MyGlobals.RichText{
        return fillAssessment(student, student => Assessment.fillIn(student, DocumentApp.openByUrl(student.assessment.url)))
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

