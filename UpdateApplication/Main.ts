import { Assessment } from "./Assessment"
import { MyGlobals } from "./GLOBALS"

function main(){
    updateAssessments()
}

function updateAssessments(){
    const studentData = MyGlobals.getStudentData()
    
    const updatedData = studentData
        .updateCol("assessment", createAssessment, textIsEmptyString)
        .updateCol("assessment", fillAssessment, hasUrl)
    
    return updatedData
}

function mapObjectValues<A extends string, B, C>(obj: Record<A, B>, fn:(arg:B) => C):Record<A, C>{
    return Object.fromEntries( Object.entries(obj).map(([k,v]) => [k, fn(v as B)]) ) as Record<A, C>
}

function fillAssessment(richTextStudent:MyGlobals.RichTextStudent):MyGlobals.RichText{
    if(hasUrl(richTextStudent.assessment)){
        const assessment = DocumentApp.openByUrl(richTextStudent.assessment.url)
        const student = mapObjectValues( richTextStudent, (richText) => richText.text)
        Assessment.fillIn(student, assessment)
    }
    return richTextStudent.assessment
}

function hasUrl(richText:MyGlobals.RichText): richText is {text:string, url:string}{
    return typeof richText.url === "string"
}

function textIsEmptyString(richText:MyGlobals.RichText):richText is {text:""}{
    return richText.text === ""
}

function createAssessment(richTextStudent:MyGlobals.RichTextStudent):MyGlobals.RichText{
    const name = richTextStudent.fullName.text
    const url = Assessment.retrieve(name).orElse(Assessment.create(name)).getUrl()
    return createRichText("LINK", url)
}

function createRichText(text:string, url?:string):MyGlobals.RichText{
    return {text, url}
}