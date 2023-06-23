import { Assessment } from "./Assessment"
import { DynamicGrid } from "./DynamicGrid"
import { MyGlobals } from "./GLOBALS"
import { Maybe } from "./Maybe"

export namespace AssessmentWriter{    
    export function fetchOrCreateAssessment<A>(fetchFn:(fileName:string) => Maybe<A> | Maybe<A | undefined>, createFn:(fileName:string) => A):(fileName:string) => A{
        const documentGetter = Maybe.getThisOrGetThat(fetchFn, createFn)
        return (fileName) =>  documentGetter(fileName) as A
    }

    export function updateAssessments(studentData: DynamicGrid<MyGlobals.Student>):DynamicGrid<MyGlobals.Student>{
        const fetcher = fetchOrCreateAssessment(Assessment.retrieve(), Assessment.create)
        const updatedData = studentData
            .updateCol("assessment", student => createRichText("LINK", fetcher(student.fullName)?.getUrl()), textIsEmptyString)
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

