import { Assessment } from "./Assessment"
import { DynamicGrid } from "./DynamicGrid"
import { MyGlobals } from "./GLOBALS"
import { Utility } from "./Utility"

export namespace AssessmentWriter{    
    function fetchOrCreateAssessment():(student:{fullName: string}) => MyGlobals.RichText{
        const assessments = Assessment.retrieve()
        return (student) => createRichText("LINK", assessments.get(student.fullName).orElseGet(() => Assessment.create(student.fullName)).getUrl())
    }

    export function updateAssessments(studentData: DynamicGrid<MyGlobals.Student>):DynamicGrid<MyGlobals.Student>{
        const updatedData = studentData
            .updateCol("assessment", fetchOrCreateAssessment(), textIsEmptyString)
            .updateCol("assessment", fillAssessment, hasUrl)
        return updatedData
    }

    function fillAssessment(richTextStudent:MyGlobals.Student):MyGlobals.RichText{
        if(hasUrl(richTextStudent.assessment)){
            const assessment = DocumentApp.openByUrl(richTextStudent.assessment.url)
            const student = Utility.mapObjectValues( richTextStudent, (richText) => typeof richText === "string" ? richText : richText.text)
            Assessment.fillIn(student, assessment)
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

