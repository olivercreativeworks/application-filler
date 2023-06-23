import { Assessment } from "./Assessment"
import { DynamicGrid } from "./DynamicGrid"
import { MyGlobals } from "./GLOBALS"

export namespace AssessmentWriter{    
    function fetchOrCreateAssessment():(student:{fullName: string}) => MyGlobals.RichText{
        const assessments = Assessment.retrieve()
        return (student) => createRichText("LINK", assessments.get(student.fullName).orElseGet(() => Assessment.create(student.fullName)).getUrl())
    }

    export function updateAssessments(studentData: DynamicGrid<MyGlobals.Student>):DynamicGrid<MyGlobals.Student>{
        const updatedData = studentData
            .updateCol("assessment", fetchOrCreateAssessment(), textIsEmptyString)
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

