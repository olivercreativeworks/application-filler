import { DocumentBody } from "./GAS/DocumentBody"
import { MyGlobals } from "./GLOBALS"
import { Maybe } from "./Maybe"
import { Utility } from "./Utility"

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
    
    export function retrieve():(studentName:string) => Maybe<GoogleAppsScript.Drive.File | undefined>{
        const assessments = MyGlobals.getFilesFrom("assessment")
        return (studentName) => assessments.get(studentName)
    }

    export function create(studentName:string):GoogleAppsScript.Drive.File {
        const template = MyGlobals.getAssessmentTemplate()
        const fileName = studentName.toUpperCase()
        const assessmentFolder = MyGlobals.getFolder("assessment")
        return template.makeCopy(fileName, assessmentFolder)
    }
    export function fillIn(responses: AssessmentFields, assessment:GoogleAppsScript.Document.Document):void{
        function getTodaysDate(){
            let date = new Date()
            let today = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
            return today
        }
        
        const body = assessment.getBody()

        body.replaceText('Date[^\\t\\n]*', "Date: " + getTodaysDate())

        body.replaceText('First[^\\t\\n]*', "First Name: "+ responses.firstName)
        body.replaceText('Last[^\\t\\n]*', "Last Name: "+ responses.lastName)
        body.replaceText('Address[^\\t\\n]*', "Address: "+ responses.address)
        body.replaceText('Borough[^\\t\\n]*', "Borough: "+ responses.borough)
        body.replaceText('Council[^\\t\\n]*', "Council District #: "+ responses.councilDistrict)

        DocumentBody.replaceFirstInstanceOfText(body, 'Phone[^\\t\\n]*','Phone Number: ' + responses.phone)
        
        body.replaceText('Email[^\\t\\n]*', "Email: "+ responses.email)
              
        const yesNoMap = new Map([['Y', "Y\\s"], ["N","N\\s"]])
        
        Maybe.of(yesNoMap.get(responses.isNychaResident)).map(textToBold => DocumentBody.bold(body, 'NYCHA development[^\\t\\n]*', textToBold,))
        Maybe.of(yesNoMap.get(responses.hasOsha10Card)).map(textToBold => DocumentBody.bold(body, 'OSHA 10 card[^\\t\\n]*', textToBold,))
        Maybe.of(yesNoMap.get(responses.inConstruction)).map(textToBold => DocumentBody.bold(body, 'construction-related[^\\t\\n]*', textToBold,))
        
        body.replaceText('Which one[^\\t\\n]*', "Which one? "+ responses.development)
        
        DocumentBody.replaceFirstInstanceOfText(body, 'Employer[^\\t\\n]*', 'Employer: ' + responses.employer)
        DocumentBody.replaceFirstInstanceOfText(body, 'Job[^\\t\\n]*', 'Job/position: ' + responses.job)
    
    }
} 