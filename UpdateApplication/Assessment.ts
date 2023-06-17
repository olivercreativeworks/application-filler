import { MyGlobals } from "./GLOBALS"
import { Maybe } from "./Maybe"

interface AssessmentFields{
    firstName:string
    lastName:string
    address:string
    borough:string
    councilDistrict:string
    phone:string
    email:string
    isNychaResident:string
    hasOsha10Card:string
    inConstruction:string
    development:string
    employer:string
    job:string
}

export namespace Assessment{

    export function fillIn(student: AssessmentFields, assessment:GoogleAppsScript.Document.Document):void{
        const body = assessment.getBody()

        replaceBodyText(body, 'Date[^\\t\\n]*', "Date: " + getTodaysDate())

        replaceBodyText(body, 'First[^\\t\\n]*', "First Name: "+ student.firstName)
        replaceBodyText(body, 'Last[^\\t\\n]*', "Last Name: "+ student.lastName)
        replaceBodyText(body, 'Address[^\\t\\n]*', "Address: "+ student.address)
        replaceBodyText(body, 'Borough[^\\t\\n]*', "Borough: "+ student.borough)
        replaceBodyText(body, 'Council[^\\t\\n]*', "Council District #: "+ student.councilDistrict)

        replaceFirstInstanceOfText(body, 'Phone[^\\t\\n]*','Phone Number: ' + student.phone)
        
        replaceBodyText(body, 'Email[^\\t\\n]*', "Email: "+ student.email)
        
        boldAssessmentResponse(body, student.isNychaResident, 'NYCHA development[^\\t\\n]*')

        boldAssessmentResponse(body, student.hasOsha10Card, 'OSHA 10 card[^\\t\\n]*')
        boldAssessmentResponse(body, student.inConstruction, 'construction-related[^\\t\\n]*')
        
        replaceBodyText(body, 'Which one[^\\t\\n]*', "Which one? "+ student.development)
        
        replaceFirstInstanceOfText(body, 'Employer[^\\t\\n]*', 'Employer: ' + student.employer)
        replaceFirstInstanceOfText(body, 'Job[^\\t\\n]*','Job/position: ' + student.job)
    }
    
    export function retrieve(studentName:string): Maybe<GoogleAppsScript.Drive.File | undefined>{
        const assessmentFolder = MyGlobals.getAssessmentFolder()
        const fileName = studentName.toUpperCase()
        const existingAssessment = assessmentFolder.getFilesByName(fileName)
        return existingAssessment.hasNext() ?  Maybe.of(existingAssessment.next()) : Maybe.of(undefined)
    }

    export function create(studentName:string):GoogleAppsScript.Drive.File {
        const assessmentTemplate = MyGlobals.getAssessmentTemplate()
        const assessmentFolder = MyGlobals.getAssessmentFolder()
        const fileName = studentName.toUpperCase()
        const newAssessment = assessmentTemplate.makeCopy(fileName, assessmentFolder)
        return newAssessment
    }
}

function replaceFirstInstanceOfText(body:GoogleAppsScript.Document.Body, searchPattern:string, replacement:string):void{
    body.findText(searchPattern).getElement().asText().replaceText(searchPattern, replacement)
}

function replaceBodyText(body:GoogleAppsScript.Document.Body, searchPattern: string, replacement: string):void{
    body.replaceText(searchPattern, replacement)
}

function getTodaysDate(){
    let date = new Date()
    let today = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
    return today
}
    
function boldAssessmentResponse(body:GoogleAppsScript.Document.Body, response:string, assessmentFieldRegex:string):void{ 
    const textToBoldDict:Record<string, string> = {'Y': "Y\\s", "N":"N\\s"}
    const textToBold = Maybe.of(textToBoldDict[response])
    textToBold.map(text => bold(body, assessmentFieldRegex, text))
}
    
function bold(body:GoogleAppsScript.Document.Body, regex:string, textFromRegexToBold:string):void{
    let text = body.editAsText()
    let elementText = text.findText(regex).getElement().asText()
    elementText.setBold(false)
    
    let foundText = elementText.findText(textFromRegexToBold)
    let start = foundText?.getStartOffset()
    let end = foundText?.getEndOffsetInclusive()
    
    foundText?.getElement().asText().setBold(start, end, true)
}